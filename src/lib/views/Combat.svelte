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
    import PersonalRecords from '$lib/components/PersonalRecords.svelte'
    // others
    import type { GameDTO } from '$lib/types/Game.dto'
    import { enemyService, loggerService, storageService } from '$lib/services'
    import { Character, Enemy } from '$lib/models'
    import { gameData } from '$lib/data/data'
    import { styles } from '$lib/config/styles'

    let _data: GameDTO
    gameData.subscribe(n => (_data = n))

    // Helpers
    let _showButtons = true
    let _actionSelected: 0 | 1 | 2

    /**
     * ## Start Combat
     * Executes every time a new combat starts
     *   - Sets a new enemy
     *   - Sets _fighting to true
     *   - Logs information about it
     */
    function startCombat(): void {
        gameData.update(n => {
            if (!n.character) return n
            n.character.potions += 1
            n.enemy = enemyService.enemyGenerator(n.character.level)
            n.fighting = true

            const isPlayerFaster: boolean = (n.character.speed ?? 0) > (n.enemy.speed ?? 0)

            loggerService.add(n.logs.enemy, {
                title: n.enemy.name,
                message: `has appeared!`,
            })

            const logTo = isPlayerFaster ? 'player' : 'enemy'
            loggerService.add(n.logs[logTo], {
                title: isPlayerFaster ? 'You' : n.enemy.name,
                message: isPlayerFaster ? `attack first!` : `attacks first!`,
            })
            return n
        })

        gameData.update(n => {
            return n
        })
    }

    /**
     * ## Select Action
     * Modify the action selected by the player
     */
    function selectAction(action: 0 | 1 | 2): void {
        if (!_data.character) return
        if (!_data.enemy) return
        _showButtons = false
        _actionSelected = action

        // Call the attack functions in order depending of who is faster
        const isPlayerFaster: boolean = (_data.character.speed ?? 0) > (_data.enemy.speed ?? 0)

        /**
         * ## Shared Turn function
         * @param active The active entity
         * @param passive The passive entity
         * @param defeatFn The function to call when the passive entity is defeated
         * @returns If the passive has died
         */
        function turn(active: Character | Enemy, passive: Character | Enemy, defeatFn: any): boolean {
            executeActions(active, passive)
            if (passive.dmgReceived === passive.health) {
                defeatFn()
                return true
            }
            return false
        }

        let hasAnybodyDied: boolean = false

        // FIRST TURN
        if (isPlayerFaster) {
            if (turn(_data.character, _data.enemy, enemyDefeat)) hasAnybodyDied = true
        } else {
            if (turn(_data.enemy, _data.character, playerDefeat)) hasAnybodyDied = true
        }

        if (hasAnybodyDied) {
            _actionSelected = 0
            _showButtons = true
            return
        }

        // SECOND TURN
        setTimeout(() => {
            if (_data.character && _data.enemy)
                isPlayerFaster ? turn(_data.enemy, _data.character, playerDefeat) : turn(_data.character, _data.enemy, enemyDefeat)

            _actionSelected = 0
            _showButtons = true
        }, 1000)
    }

    function onKeyDown(event: KeyboardEvent): void {
        if (!_data.fighting && !_data.powerUps.pending) {
            if (event.code === 'Space') startCombat()
            return
        }
        if (!_showButtons) return

        if (event.code === 'KeyA') selectAction(0)
        if (event.code === 'KeyS') selectAction(1)
        if (!(_data.character?.potions ?? 0)) return
        if (event.code === 'KeyD') selectAction(2)
    }
    /**
     * ## Execute Actions
     * @param active - The one who deals the damage
     * @param passive - The one who receives the damage
     */
    function executeActions(active: Character | Enemy, passive: Character | Enemy): void {
        const active_is_a_player: boolean = active instanceof Character
        const choice = active instanceof Enemy ? enemyService.enemyActionChoice(active) : _actionSelected

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

        gameData.update(n => {
            loggerService.add(n.logs[active_is_a_player ? 'player' : 'enemy'], {
                title: active.name,
                message: message,
                value: dmgReceived,
                icon: icon,
            })
            return n
        })
    }

    // ╔══════════════════════════════════════════════════════
    // ║ ✅ ENEMY DEFEATED
    // ╚══════════════════════════════════════════════════════
    const enemyDefeat = () => {
        if (!_data.character || !_data.enemy) return
        const exp = parseInt(((_data.enemy.level / _data.character.level) * 100).toFixed(0))
        const oldLevel = _data.character.level
        const leveledUp = _data.character.gainExp(exp)

        gameData.update(n => {
            if (!n.character || !n.enemy) return n
            n.fighting = false
            loggerService.add(n.logs.enemy, {
                title: n.enemy.name,
                message: `lv ${n.enemy.level} has been defeated! 🎉🎉`,
            })
            loggerService.add(n.logs.player, {
                title: '',
                message: `Well done, you have gained ${exp} exp!`,
            })

            const maxPowerUps = 24
            const acc_history = Object.values(n.powerUps.history).reduce((acc, val) => acc + val, 0)
            if (leveledUp && acc_history < maxPowerUps) {
                const powerUpsToAdd = oldLevel % 2 !== 0 ? ~~((n.character.level - oldLevel) / 2) : parseInt(((n.character.level - oldLevel) / 2).toFixed(0))
                n.powerUps.pending = acc_history + powerUpsToAdd > maxPowerUps ? maxPowerUps - acc_history : powerUpsToAdd

                loggerService.add(n.logs.player, {
                    title: '',
                    message: `You have leveled up! 🎉🎉`,
                })
            }

            n.enemiesHistory.push({
                image: n.enemy.image,
                level: n.enemy.level,
            })
            n.enemy = null
            return n
        })
    }

    // ╔══════════════════════════════════════════════════════
    // ║ ❌ PLAYER DEFEATED
    // ╚══════════════════════════════════════════════════════
    const playerDefeat = () => {
        gameData.update(n => {
            n.fighting = false
            loggerService.add(n.logs.player, {
                title: 'Oh no!',
                message: 'You have been defeated! 😭',
            })
            return n
        })

        storageService.add({
            classIdx: _data.characterIdx,
            name: _data.character?.name ?? '',
            record: _data.character?.level ?? 0,
        })

        setTimeout(() => {
            gameData.update(n => {
                n.view = 'gameover'
                return n
            })
        }, 2000)
    }

    function openStore(): void {
        gameData.update(n => {
            n.view = 'store'
            return n
        })
    }
</script>

<svelte:window on:keydown|preventDefault={onKeyDown} />

<!--╔══════════════════════════════════════════════════════
    ║ 💻 Game view
    ╚══════════════════════════════════════════════════════ -->
<div class="text-center container mx-auto">
    <div class="animate__animated animate__fadeIn bg-zinc-900 lg:h-screen pt-20 pb-10 relative">
        <h1 class="absolute top-0 text-3xl p-5 text-center w-full tracking-widest">HEXAKILL</h1>
        <!-- <nav class='absolute top-0 right-10 text-white'>
            <MusicToggle color={colorTheme} />
        </nav> -->

        <!-- Center section - 2 ROWS -->
        <section class="bg-zinc-800 h-full grid grid-rows-2 grid-cols-1">
            <!-- ROW 1 - 3 COLUMNS -->
            <div class="grid lg:grid-cols-3">
                <div class={styles.cell + 'grid grid-cols-2'}>
                    <PersonalRecords />
                    <Items />
                </div>

                {#if _data.character}
                    <Entity type="character" />
                {/if}

                {#if _data.enemy}
                    <Entity type="enemy" />
                {:else if !_data.powerUps.pending}
                    <section class={styles.cell + 'flex justify-center items-center'}>
                        <button on:click={startCombat} class={styles.button.base + styles.button.red}> FIGHT </button>
                        <button on:click={openStore} class={styles.button.base + styles.button.green}> STORE </button>
                    </section>
                {/if}
            </div>

            <!-- ROW 2 - 2 COLUMNS -->
            <div class="grid lg:grid-cols-2 col-span-3">
                <div class={styles.cell}>
                    <PowerUps />
                    {#if _data.fighting}
                        <div>
                            <h4 class="text-center text-lg p-2 mt-8">What do you want to do?</h4>
                            <div class={`flex gap-4 justify-center items-center p-4 transition-opacity ${_showButtons ? '' : 'opacity-20'}`}>
                                <button disabled={!_showButtons} on:click={() => selectAction(0)} class={styles.button.base + styles.button.red}>
                                    Attack
                                </button>
                                <button disabled={!_showButtons} on:click={() => selectAction(1)} class={styles.button.base + styles.button.blue}>
                                    Magic
                                </button>
                                {#if (_data.character?.potions ?? 0) > 0}
                                    <button disabled={!_showButtons} on:click={() => selectAction(2)} class={styles.button.base + styles.button.green}>
                                        Potion
                                    </button>
                                {/if}
                            </div>
                        </div>
                    {/if}
                </div>
                <Logger />
            </div>
        </section>
    </div>
</div>
