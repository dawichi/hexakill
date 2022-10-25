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
    import type { GameDTO } from '$lib/types/Game.dto'
    import { combatService, enemyService } from '$lib/services'
    import { gameData } from '$lib/data/data'
    import { styles } from '$lib/config/styles'
    import { Button } from 'flowbite-svelte'
    import Icon from '@iconify/svelte'

    let _data: GameDTO
    gameData.subscribe(n => (_data = n))

    function newCombat(): void {
        enemyService.newEnemy()
    }

    function newTurn(action: 0 | 1 | 2): void {
        combatService.newTurn(_data, action)
    }

    function openStore(): void {
        gameData.update(n => {
            n.view = 'store'
            return n
        })
    }

    function onKeyDown(event: KeyboardEvent): void {
        if (!_data.showUI.fighting && !_data.powerUps.pending) {
            if (event.code === 'Space') newCombat()
            if (event.code === 'KeyP') openStore()
            return
        }
        if (!_data.showUI.fighting || !_data.showUI.actionBtns) return

        if (event.code === 'KeyA') newTurn(0)
        if (event.code === 'KeyS') newTurn(1)
        if (!(_data.character?.potions ?? 0)) return
        if (event.code === 'KeyD') newTurn(2)
    }
</script>

<svelte:window on:keydown|preventDefault={onKeyDown} />

<section class="grid h-full grid-cols-1 grid-rows-2 bg-zinc-800 animate__animated animate__fadeIn">
    <!-- ROW 1 - 3 COLUMNS -->
    <div class="grid lg:grid-cols-3">
        <div class={styles.cell}>
            <Items />
        </div>

        {#if _data.character}
            <Entity type="character" />
        {/if}

        {#if _data.enemy}
            <Entity type="enemy" />
        {:else if !_data.powerUps.pending}
            <section class={styles.cell + 'flex justify-center items-center gap-4'}>
                <Button gradient color="red" on:click={newCombat}>
                    <span class="font-bold tracking-wider text-xl flex items-center gap-2"><Icon icon="game-icons:sword-clash"/> FIGHT</span>
                </Button>
                <Button gradient color="green" on:click={openStore}>
                    <span class="font-bold tracking-wider text-xl flex items-center gap-2"><i class="bi bi-shop"></i> STORE</span>
                </Button>
            </section>
        {/if}
    </div>

    <!-- ROW 2 - 2 COLUMNS -->
    <div class="col-span-3 grid lg:grid-cols-2">
        <div class={styles.cell}>
            <PowerUps />
            {#if _data.showUI.fighting}
                <div>
                    <h4 class="mt-8 p-2 text-center text-lg">What do you want to do?</h4>
                    <div class={`flex gap-4 justify-center items-center p-4 transition-opacity ${_data.showUI.actionBtns ? '' : 'opacity-20'}`}>
                        <Button  disabled={!_data.showUI.actionBtns} on:click={() => newTurn(0)} gradient color="red">
                            <span class="font-bold tracking-wider text-xl flex items-center gap-2">Attack</span>
                        </Button>
                        <Button  disabled={!_data.showUI.actionBtns} on:click={() => newTurn(1)} gradient color="blue">
                            <span class="font-bold tracking-wider text-xl flex items-center gap-2">Magic</span>
                        </Button>
                        {#if (_data.character?.potions ?? 0) > 0}
                        <Button disabled={!_data.showUI.actionBtns} on:click={() => newTurn(2)} gradient color="green">
                            <span class="font-bold tracking-wider text-xl flex items-center gap-2"> Potion</span>
                        </Button>
                        {/if}
                    </div>
                </div>
            {/if}
        </div>
        <Logger />
    </div>
</section>
