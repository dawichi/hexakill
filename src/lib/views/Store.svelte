<script lang="ts">
    import Entity from '$lib/components/Entity.svelte'
    import Items from '$lib/components/Items.svelte'
    import StoreItem from '$lib/components/store/StoreItem.svelte'
    import type { GameDTO } from '$lib/types/Game.dto'
    import { gameData } from '$lib/data/data'
    import { styles } from '$lib/config/styles'
    import { Button } from 'flowbite-svelte'

    let defaultModal = false

    let _data: GameDTO
    gameData.subscribe(n => (_data = n))

    function closeStore(): void {
        gameData.update(n => {
            n.view = 'combat'
            return n
        })
    }

    function onKeyDown(event: KeyboardEvent): void {
        if (event.code === 'KeyP') closeStore()
        return
    }
</script>

<svelte:window on:keydown|preventDefault={onKeyDown} />

<div class="animate__animated animate__fadeIn grid h-full grid-cols-3 bg-zinc-800">
    <section class="grid grid-rows-2">
        <Entity type="character" />
        <div class={styles.cell}>
            <Items />
        </div>
    </section>

    <section class="col-span-2 h-full">
        <!-- Potions -->
        <div class={styles.cell}>
            <h1 class="pb-2 text-center text-2xl">Potions</h1>
            <hr />
            <div class="mt-2 grid grid-cols-4 gap-2">
                {#each _data.shop.potions as item}
                    <StoreItem {item} />
                {/each}
            </div>
        </div>
        <!-- Items -->
        <div class={styles.cell}>
            <h1 class="pb-2 text-center text-2xl">Items</h1>
            <hr />
            <div class="mt-2 grid grid-cols-4 gap-2">
                {#each _data.shop.items as item}
                    <StoreItem {item} />
                {/each}
            </div>
        </div>
        <Button gradient color="red" on:click={closeStore}>
            <span class="flex items-center gap-2 text-xl font-bold tracking-wider">Close</span>
        </Button>
    </section>
</div>
