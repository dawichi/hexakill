<script lang="ts">
    import Icon from '@iconify/svelte'
    import Container from '$lib/components/Container.svelte'
    import BgImage from '$lib/components/BgImage.svelte'
    import Tooltip from '$lib/components/Tooltip.svelte'
    import Entity from '$lib/components/Entity.svelte'
    import Items from '$lib/components/Items.svelte'
    import type { GameDTO } from '$lib/types/Game.dto'
    import type { Item } from '$lib/models'
    import { gameData } from '$lib/data/data'
    import { styles } from '$lib/config/styles'

    let _data: GameDTO
    gameData.subscribe(n => (_data = n))

    function closeStore(): void {
        gameData.update(n => {
            n.view = 'combat'
            return n
        })
    }

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

    function onKeyDown(event: KeyboardEvent): void {
        if (event.code === 'KeyP') closeStore()
        return
    }
</script>

<svelte:window on:keydown|preventDefault={onKeyDown} />

<Container>
    <div class="bg-zinc-800 h-full grid grid-cols-2">
        <section class="grid grid-rows-2">
            <Entity type="character" />
            <section class={styles.cell}>
                <button on:click={closeStore} class={styles.button.base + styles.button.red}>Arena</button>
                <Items />
            </section>
        </section>

        <section class={styles.cell}>
            <h1 class="text-2xl text-center pb-2">Items shop</h1>
            <hr />
            <div class="mt-2 grid grid-cols-4 gap-2">
                {#each _data.shop.items as item}
                    <Tooltip title={item.name} type="itemDescription" bonus={Object.entries(item.bonus).filter(([_, value]) => value !== 0)}>
                        <article
                            class={`${isTooExpensive(item) ? 'opacity-20' : 'hover:bg-zinc-700 hover:cursor-pointer'} rounded`}
                            on:click={() => handleClick(item)}
                        >
                            <div class="bg-zinc-800 rounded p-2">
                                <h2 class="text-xl text-center">{item.name}</h2>
                                <div class="flex justify-center">
                                    <div class="relative w-12 h-12">
                                        <BgImage image={`/images/items/${item.image}.png`} />
                                    </div>
                                </div>
                            </div>
                            <p class="relative flex items-center text-lg p-1">
                                <span class="text-3xl">
                                    <Icon icon="bxs:coin" class="text-yellow-400" />
                                </span>
                                <span class={`pl-2 ${isTooExpensive(item) ? 'text-red-500' : ''}`}>{item.price}</span>
                            </p>
                        </article>
                    </Tooltip>
                {/each}
            </div>
        </section>
    </div>
</Container>
