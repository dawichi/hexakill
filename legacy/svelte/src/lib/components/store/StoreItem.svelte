<!--
  @component
  ## ShopItem
  Display an item in the store.
-->
<script lang="ts">
    import Icon from '@iconify/svelte'
    import type { GameDTO, PotionDto } from '$lib/types/Game.dto'
    import { ItemModel } from '$lib/models'
    import { gameData } from '$lib/data/data'
    import { Image, Tooltip } from '..'
    import { soundsService } from '$lib/services'

    export let item: ItemModel | PotionDto

    let _data: GameDTO
    gameData.subscribe(n => (_data = n))

    function isTooExpensive(price: number): boolean {
        return price > (_data.character?.gold ?? 0)
    }

    function handleClick(): void {
        if (isTooExpensive(item.price)) {
            soundsService.play('error')
            return
        }
        soundsService.play('coin')
        item instanceof ItemModel ? buyItem() : buyPotion()
    }

    function buyItem(): void {
        if (item instanceof ItemModel) {
            const newItem = {
                name: item.name,
                price: item.price,
                image: item.image,
                bonus: item.bonus,
            }
            gameData.update(n => {
                if (!n.character) return n
                n.character.gold -= item.price
                n.character.addItem(newItem)
                // delete item from store
                n.shop.items = n.shop.items.filter(i => i.name !== item.name)
                return n
            })
        }
    }

    function buyPotion(): void {
        gameData.update(n => {
            if (!n.character) return n
            n.character.gold -= item.price
            n.character.potions += item.price === 100 ? 1 : 5
            return n
        })
    }

    const tooltip =
        item instanceof ItemModel
            ? {
                  title: item.name,
                  bonus: Object.entries(item.bonus).filter(([_, value]) => value !== 0),
                  content: null,
              }
            : {
                  title: item.name,
                  bonus: null,
                  content: ['Add potions to your inventory'],
              }
</script>

<Tooltip data={tooltip} styleLeftPx={200}>
    <article class={`${isTooExpensive(item.price) ? 'opacity-20' : 'hover:bg-zinc-700 hover:cursor-pointer'} rounded`} on:click={handleClick}>
        <div class="rounded bg-zinc-800 p-2">
            <h2 class="text-center text-xl">{item.name}</h2>
            <div class="flex justify-center">
                <div class="relative flex h-12 w-24 items-center justify-center">
                    {#if item instanceof ItemModel}
                        <Image image={`/images/items/${item.image}.png`} />
                    {:else if item.price === 100}
                        <Icon icon="game-icons:health-potion" class="text-3xl text-red-500" />
                    {:else}
                        <Icon icon="game-icons:health-potion" class="text-3xl text-red-500" />
                        <Icon icon="game-icons:health-potion" class="text-3xl text-red-500" />
                        <Icon icon="game-icons:health-potion" class="text-3xl text-red-500" />
                    {/if}
                </div>
            </div>
        </div>
        <p class="relative flex items-center p-1 text-lg">
            <span class="text-3xl">
                <Icon icon="bxs:coin" class="text-yellow-400" />
            </span>
            <span class={`pl-2 ${isTooExpensive(item.price) ? 'text-red-500' : ''}`}>{item.price}</span>
        </p>
    </article>
</Tooltip>
