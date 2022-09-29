<!--
    @component
    ## Combat component
    The view of the actual game, where the user can fight enemies.
-->
<script lang="ts">
    import { styles } from '$lib/config/styles'
    import { gameData, logs } from '$lib/data/stores'
    import EntityView from '$lib/EntityView.svelte'
    import Logger from '$lib/Logger.svelte'
    import type { Character, Enemy } from '$lib/models'
    import { enemyActionChoice } from '$lib/utils/enemyActionChoice'
    import { enemyGenerator } from '$lib/utils/enemyGenerator'

    // Variables binded to store
    let _player: Character | null
    let _enemy: Enemy | null
    
    // Helpers
    let _fighting: boolean = false
    let _showButtons: boolean = true
    let _actionSelected: 0 | 1 | 2

    gameData.subscribe(n => {
        _player = n.character
        _enemy = n.enemy
    })

    /**
     * ## Start Combat
     * Executes every time a new combat starts
     *   - Sets a new enemy
     *   - Sets _fighting to true
     *   - Logs information about it
     */
    function startCombat(): void {
        _fighting = true
        gameData.update(n => {
            n.enemy = enemyGenerator(_player?.level ?? 1)
            return n
        })
        
        logs.update(n => {
            const isPlayerFaster: boolean = (_player?.speed ?? 0) > (_enemy?.speed ?? 0)
            const enemyName = _enemy?.name ?? 'Enemy'
            n.enemy.push({
                title: enemyName,
                message: `has appeared!`,
            })
            
            const logTo = isPlayerFaster ? 'player' : 'enemy'
            n[logTo].push({
                title: isPlayerFaster ? 'You' : enemyName,
                message: isPlayerFaster ? `attack first!` : `attacks first!`,
            })
            return n
        })
    }

    /**
     * ## Select Action
     * Modify the action selected by the player
    */
    function selectAction(action: 0 | 1 | 2): void {
        _showButtons = false
        _actionSelected = action

        // Call the attack functions in order depending of who is faster
        const isPlayerFaster: boolean = (_player?.speed ?? 0) > (_enemy?.speed ?? 0)
        if (_player && _enemy) isPlayerFaster ? executeActions(_player, _enemy) : executeActions(_enemy, _player)
        setTimeout(() => {
            if (_player && _enemy) isPlayerFaster ? executeActions(_enemy, _player) : executeActions(_player, _enemy)
            _actionSelected = 0
            _showButtons = true
        }, 1000)
    }

    /**
     * ## Execute Actions
     * @param active - The one who deals the damage
     * @param passive - The one who receives the damage
     */
    function executeActions(active: Character | Enemy, passive: Character | Enemy): void {
        const is_a_player: boolean = 'exp' in active
        const entity = is_a_player ? 'player' : 'enemy'
        const choice = is_a_player ? _actionSelected : enemyActionChoice(active)

        let damage: number
        let dmgReceived: number
        let message: string
        let icon: string

        switch (choice) {
            case 0:
                damage = active.attack()
                dmgReceived = passive.receiveAttack(damage)
                message = ''
                icon = '🔪'
                break
            case 1:
                damage = active.magic()
                dmgReceived = passive.receiveMagic(damage)
                message = ''
                icon = '☄'
                break
            default:
                const healed = active.heal()
                message = `healed ${healed} HP! ❤`
                break
        }

        gameData.update(n => n)
        logs.update(n => {
            n[entity].push({
                title: active.name,
                message: message,
                value: dmgReceived,
                icon: icon,
            })
            return n
        })

        if (passive.dmgReceived === passive.health) {
            // is_a_player ? enemyDefeat() : playerDefeat()
        }
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
                    {#if _fighting}
                        <div>
                            <h4 class="text-center text-lg p-2">What do you want to do?</h4>
                            <hr />
                            <div class={`flex gap-4 justify-center items-center p-4 transition-opacity ${_showButtons ? '' : 'opacity-20'}`}>
                                <button disabled={!_showButtons} on:click={() => selectAction(0)} class={styles.button.base + styles.button.red}> Attack </button>
                                <button disabled={!_showButtons} on:click={() => selectAction(1)} class={styles.button.base + styles.button.blue}> Magic </button>
                                <button disabled={!_showButtons} on:click={() => selectAction(2)} class={styles.button.base + styles.button.green}> Heal </button>
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

            <div class="grid grid-cols-2  col-span-3">
                <div class="bg-zinc-900 shadow p-2 m-2 rounded">
                    <h4 class="text-center text-lg p-2">Items</h4>
                    <hr />
                </div>
                <div class="bg-zinc-900 shadow p-2 m-2 rounded relative">
                    <h4 class="text-center text-lg p-2">Info</h4>
                    <hr />
                    <Logger />
                </div>
            </div>
        </section>
    </div>
</div>
