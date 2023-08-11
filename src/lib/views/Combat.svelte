<!--
    @component
    ## Combat component
    The view of the actual game, where the user can fight enemies.
-->
<script lang="ts">
    // components
    import Items from '$lib/components/Items.svelte'
    import Entity from '$lib/components/Entity.svelte'
    import Logger from '$lib/components/Logger.svelte'
    import PowerUps from '$lib/components/PowerUps.svelte'
    // others
    import { combatService, enemyService } from '$lib/services'
    import { gameData } from '$lib/data/data'
    import { styles } from '$lib/config/styles'
    import { Button } from 'flowbite-svelte'
    import Icon from '@iconify/svelte'

    function newCombat(): void {
        $gameData.showUI.actionBtns = true
        enemyService.newEnemy()
    }

    function newTurn(action: 0 | 1 | 2): void {
        combatService.newTurn($gameData, action)
    }

    function openStore(): void {
        gameData.update(n => {
            n.view = 'store'
            return n
        })
    }

    function onKeyDown(event: KeyboardEvent): void {
        if (!$gameData.showUI.fighting && !$gameData.powerUps.pending) {
            if (event.code === 'Space') newCombat()
            if (event.code === 'KeyP') openStore()
            return
        }
        if (!$gameData.showUI.fighting || !$gameData.showUI.actionBtns) return

        if (event.code === 'KeyA') newTurn(0)
        if (event.code === 'KeyS') newTurn(1)
        if (!($gameData.character?.potions ?? 0)) return
        if (event.code === 'KeyD') newTurn(2)
    }
</script>

<svelte:window on:keydown|preventDefault={onKeyDown} />

<section class="animate__animated animate__fadeIn grid h-full grid-cols-1 grid-rows-2 bg-zinc-800">
    <!-- ROW 1 - 3 COLUMNS -->
    <div class="grid lg:grid-cols-3">
        <Items />

        {#if $gameData.character}
            <Entity type="character" />
        {/if}

        {#if $gameData.enemy}
            <Entity type="enemy" />
        {:else if !$gameData.powerUps.pending}
            <section class={styles.cell + 'flex justify-center items-center gap-4'}>
                <Button gradient color="red" on:click={newCombat}>
                    <span class="flex items-center gap-2 text-xl font-bold tracking-wider"><Icon icon="game-icons:sword-clash" /> FIGHT</span>
                </Button>
                <Button gradient color="green" on:click={openStore}>
                    <span class="flex items-center gap-2 text-xl font-bold tracking-wider"><i class="bi bi-shop" /> STORE</span>
                </Button>
            </section>
        {/if}
    </div>

    <!-- ROW 2 - 2 COLUMNS -->
    <div class="col-span-3 grid lg:grid-cols-2">
        <div class={styles.cell}>
            <PowerUps />
            {#if $gameData.showUI.fighting}
                <div>
                    <h4 class="mt-8 p-2 text-center text-lg">What do you want to do?</h4>
                    <div class={`flex gap-4 justify-center items-center p-4 transition-opacity ${$gameData.showUI.actionBtns ? '' : 'opacity-20'}`}>
                        <Button disabled={!$gameData.showUI.actionBtns} on:click={() => newTurn(0)} gradient color="red">
                            <span class="text-xl font-bold tracking-wider">Attack</span>
                        </Button>
                        <Button disabled={!$gameData.showUI.actionBtns} on:click={() => newTurn(1)} gradient color="blue">
                            <span class="text-xl font-bold tracking-wider">Magic</span>
                        </Button>
                        {#if ($gameData.character?.potions ?? 0) > 0}
                            <Button disabled={!$gameData.showUI.actionBtns} on:click={() => newTurn(2)} gradient color="green">
                                <span class="text-xl font-bold tracking-wider"> Potion</span>
                            </Button>
                        {/if}
                    </div>
                </div>
            {/if}
        </div>
        <Logger />
    </div>
</section>
