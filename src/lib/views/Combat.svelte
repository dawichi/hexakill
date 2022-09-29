<!--
    @component
    ## Combat component
    The view of the actual game, where the user can fight enemies.
-->
<script lang="ts">
    import { styles } from '$lib/config/styles'
    import { gameData, logs } from '$lib/data/stores'
    import EntityView from '$lib/EntityView.svelte'
    import type { Character, Enemy } from '$lib/models'
    import type { Logger } from '$lib/types/Logger'
    import { enemyGenerator } from '$lib/utils/enemyGenerator'

    let _player: Character | null
    let _enemy: Enemy | null
    let _fighting: boolean = false
    let _playerTurn: boolean = true
    let _logs: Logger

    gameData.subscribe(n => {
        _player = n.character
        _enemy = n.enemy
    })

    logs.subscribe(n => {
        _logs = n
    })

    function attack() {}
    function magic() {}
    function heal() {}

    function startCombat() {
        gameData.update(n => {
            n.enemy = enemyGenerator(_player?.level ?? 1)
            return n
        })
        _fighting = true
        logs.update(n => {
            n.general.push(`${_enemy?.name} lv ${_enemy?.level} has appeared!`)
            return n
        })
    }
</script>

<!--╔══════════════════════════════════════════════════════
    ║ 💻 Game view
    ╚══════════════════════════════════════════════════════ -->
<div class="text-center container mx-auto">
    <div class="animate__animated animate__fadeIn bg-zinc-900 h-screen pt-20 pb-10 relative">
        <h1 class="absolute top-0 left-0 text-3xl p-5 text-center text-white w-full tracking-widest">HEXAKILL</h1>
        <!-- <nav class='absolute top-0 right-10 text-white'>
            <MusicToggle color={colorTheme} />
        </nav> -->

        <section class="bg-zinc-800 relative container mx-auto h-full grid grid-rows-2 grid-cols-1">
            <div class="grid grid-cols-3">
                <div class="bg-zinc-900 shadow p-2 m-2 rounded flex justify-center items-center">
                    {#if _fighting && _playerTurn}
                        <div>
                            <h4 class="text-center text-lg p-2">What do you want to do?</h4>
                            <hr />
                            <div class="flex gap-4 justify-center items-center p-4">
                                <button on:click={attack} class={styles.button.base + styles.button.red}> Attack </button>
                                <button on:click={magic} class={styles.button.base + styles.button.blue}> Magic </button>
                                <button on:click={heal} class={styles.button.base + styles.button.green}> Heal </button>
                            </div>
                        </div>
                    {/if}
                </div>

                {#if _player}
                    <EntityView entity={_player} />
                {/if}

                {#if _enemy}
                    <EntityView entity={_enemy} />
                {:else}
                    <section class="bg-zinc-900 shadow p-2 m-2 rounded flex justify-center items-center">
                        <button on:click={startCombat} class={styles.button.base + styles.button.red}> FIGHT </button>
                    </section>
                {/if}
            </div>

            <div class="bg-zinc-900 shadow p-2 m-2 rounded relative col-span-3">
                <h4 class="text-center text-lg p-2">Info</h4>
                <hr />
                <article class="p-4 h-4/5 overflow-y-hidden grid grid-cols-3 gap-4">
                    <div>
                        {#each _logs.player as log, idx}
                            <div class='animate__animated animate__fadeIn mt-2'>
                                <p class={idx > 2 ? 'opacity-25' : ''}>{log}</p>
                            </div>
                        {/each}
                    </div>
                    <div>
                        {#each _logs.general as log, idx}
                            <div class='animate__animated animate__fadeIn mt-2'>
                                <p class={idx > 2 ? 'opacity-25' : ''}>{log}</p>
                            </div>
                        {/each}
                    </div>
                    <div>
                        {#each _logs.enemy as log, idx}
                            <div class='animate__animated animate__fadeIn mt-2'>
                                <p class={idx > 2 ? 'opacity-25' : ''}>{log}</p>
                            </div>
                        {/each}
                    </div>
                </article>
            </div>
        </section>
    </div>
</div>
