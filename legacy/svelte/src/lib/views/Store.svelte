<script lang="ts">
    import Entity from '$lib/components/Entity.svelte'
    import Items from '$lib/components/Items.svelte'
    import StoreItem from '$lib/components/store/StoreItem.svelte'
    import { gameData } from '$lib/data/data'
    import { styles } from '$lib/config/styles'
    import { Button } from 'flowbite-svelte'

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
                {#each $gameData.shop.potions as item}
                    <StoreItem {item} />
                {/each}
            </div>
        </div>
        <!-- Items -->
        <div class={styles.cell}>
            <h1 class="pb-2 text-center text-2xl">Items</h1>
            <hr />
            <div class="mt-2 grid grid-cols-4 gap-2">
                {#each $gameData.shop.items as item}
                    <StoreItem {item} />
                {/each}
            </div>
        </div>
        <Button gradient color="red" on:click={closeStore}>
            <span class="text-xl font-bold tracking-wider">Close</span>
        </Button>
    </section>
</div>
