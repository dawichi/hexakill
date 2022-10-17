<!--
  @component
  ## ShopItem
  Display an item in the store.
-->
<script lang="ts">
    import Icon from '@iconify/svelte'
    import BgImage from '../BgImage.svelte'
    import Tooltip from '../Tooltip.svelte'
    import type { Item } from '$lib/models'
    import type { GameDTO } from '$lib/types/Game.dto'
    import { gameData } from '$lib/data/data'

    export let item: Item

    let _data: GameDTO
    gameData.subscribe(n => (_data = n))

    function isTooExpensive(item: Item): boolean {
        return item.price > (_data.character?.gold ?? 0)
    }

    function handleClick(item: Item): void {
        isTooExpensive(item) ? console.log('too expensive') : buyItem(item)
    }

    function buyItem(item: Item): void {
        gameData.update(n => {
            if (!n.character) return n
            n.character.gold -= item.price
            n.character.addItem(item)
            // delete item from store
            const idx = n.shop.items.indexOf(item)
            n.shop.items.splice(idx, 1)
            return n
        })
    }
</script>

<Tooltip title={item.name} type="itemDescription" bonus={Object.entries(item.bonus).filter(([_, value]) => value !== 0)}>
    <article class={`${isTooExpensive(item) ? 'opacity-20' : 'hover:bg-zinc-700 hover:cursor-pointer'} rounded`} on:click={() => handleClick(item)}>
        <div class="rounded bg-zinc-800 p-2">
            <h2 class="text-center text-xl">{item.name}</h2>
            <div class="flex justify-center">
                <div class="relative h-12 w-12">
                    <BgImage image={`/images/items/${item.image}.png`} />
                </div>
            </div>
        </div>
        <p class="relative flex items-center p-1 text-lg">
            <span class="text-3xl">
                <Icon icon="bxs:coin" class="text-yellow-400" />
            </span>
            <span class={`pl-2 ${isTooExpensive(item) ? 'text-red-500' : ''}`}>{item.price}</span>
        </p>
    </article>
</Tooltip>
