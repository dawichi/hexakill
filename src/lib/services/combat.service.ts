import { gameData } from '$lib/data/data'
import { CharacterModel, EnemyModel } from '$lib/models'
import type { GameDTO } from '$lib/types/Game.dto'
import { enemyService, loggerService, soundsService, storageService } from '.'

/**
 * Functions used during the combat.
 */
class Combat {
    playerAction: 0 | 1 | 2 = 0

    /**
     * ## Execute the turn
     * @param active - The active entity (attacks)
     * @param passive - The passive entity (gets the damage)
     */
    private executeTurn(active: CharacterModel | EnemyModel, passive: CharacterModel | EnemyModel): void {
        const active_is_a_player: boolean = active instanceof CharacterModel
        const choice = active instanceof EnemyModel ? enemyService.generateAction(active) : this.playerAction

        let damage: number
        let dmgReceived: number
        let message: string
        let icon: string

        const choices: Record<0 | 1 | 2, () => void> = {
            0: () => {
                damage = active.attack()
                dmgReceived = passive.receiveAttack(damage)
                message = ''
                icon = '🔪'
            },
            1: () => {
                damage = active.magic()
                dmgReceived = passive.receiveMagic(damage)
                message = ''
                icon = '☄'
            },
            2: () => {
                const healed = active.heal()
                message = `healed ${healed} HP! ❤`
            },
        }

        choices[choice]()

        if (choice === 0) soundsService.play('attack')
        if (choice === 1) soundsService.play('magic')
        if (choice === 2) soundsService.play('potion')

        gameData.update(d => {
            loggerService.add(d.logs[active_is_a_player ? 'player' : 'enemy'], {
                title: active.name,
                message: message,
                value: dmgReceived,
                icon: icon,
            })
            return d
        })
    }

    /**
     * ## Defines a turn
     * @param active The active entity (attacks)
     * @param passive The passive entity (gets the damage)
     * @param defeatFn The function to call if the passive dies
     * @returns If the passive has died
     */
    private defineTurn(active: CharacterModel | EnemyModel, passive: CharacterModel | EnemyModel, defeatFn: () => void): boolean {
        this.executeTurn(active, passive)
        if (passive.dmgReceived === passive.health) {
            setTimeout(() => {
                defeatFn()
            }, 1000)
            return true
        }
        return false
    }

    /**
     * ## ✅ ENEMY DEFEATED
     */
    private enemyDefeat(data: GameDTO): void {
        if (!data.character || !data.enemy) return
        const exp = parseInt(((data.enemy.level / data.character.level) * 100).toFixed(0))
        const oldLevel = data.character.level
        const leveledUp = data.character.gainExp(exp)
        data.character.gainGold(data.enemy.gold)

        leveledUp
            ? soundsService.play('levelup')
            : soundsService.play('enemyKilled')

        gameData.update(d => {
            if (!d.character || !d.enemy) return d
            d.showUI.fighting = false
            loggerService.add(d.logs.enemy, {
                title: d.enemy.name,
                message: `lv ${d.enemy.level} has been defeated! 🎉🎉`,
            })
            loggerService.add(d.logs.player, {
                title: '',
                message: `Well done, you have gained ${exp} exp!`,
            })

            const maxPowerUps = 24
            const acc_history = Object.values(d.powerUps.history).reduce((acc, val) => acc + val, 0)
            if (leveledUp && acc_history < maxPowerUps) {
                const powerUpsToAdd = oldLevel % 2 !== 0 ? ~~((d.character.level - oldLevel) / 2) : parseInt(((d.character.level - oldLevel) / 2).toFixed(0))
                d.powerUps.pending = acc_history + powerUpsToAdd > maxPowerUps ? maxPowerUps - acc_history : powerUpsToAdd

                loggerService.add(d.logs.player, {
                    title: '',
                    message: `You have leveled up! 🎉🎉`,
                })
            }

            d.enemiesHistory.push({
                image: d.enemy.image,
                level: d.enemy.level,
            })
            return d
        })

        setTimeout(() => {
            gameData.update(d => {
                d.enemy = null
                return d
            })
        }, 2000)
    }

    /**
     * ## ❌ PLAYER DEFEATED
     */
    private playerDefeat(data: GameDTO): void {
        gameData.update(d => {
            d.showUI.fighting = false
            loggerService.add(d.logs.player, {
                title: 'Oh no!',
                message: 'You have been defeated! 😭',
            })
            return d
        })

        storageService.add({
            classIdx: data.characterIdx,
            name: data.character?.name ?? '',
            record: data.character?.level ?? 0,
        })

        setTimeout(() => {
            gameData.update(d => {
                d.view = 'gameover'
                return d
            })
        }, 2000)
    }

    /**
     * ## New Turn
     * The player has selected an action, call a new turn
     */
    newTurn(data: GameDTO, playerAction: 0 | 1 | 2): void {
        if (!data.character || !data.enemy) return
        this.playerAction = playerAction

        gameData.update(d => {
            d.showUI.actionBtns = false
            return d
        })

        // Call the attack functions in order depending of who is faster
        const isPlayerFaster: boolean = data.character.speed > data.enemy.speed
        let hasAnybodyDied = false

        // FIRST TURN
        if (isPlayerFaster) {
            // Execute: player -> enemy
            if (this.defineTurn(data.character, data.enemy, () => this.enemyDefeat(data))) hasAnybodyDied = true
        } else {
            // Execute: enemy -> player
            if (this.defineTurn(data.enemy, data.character, () => this.playerDefeat(data))) hasAnybodyDied = true
        }

        if (hasAnybodyDied) {
            gameData.update(d => {
                d.showUI.actionBtns = true
                return d
            })
            return
        }

        // SECOND TURN
        setTimeout(() => {
            if (!data.character || !data.enemy) return
            isPlayerFaster
                ? this.defineTurn(data.enemy, data.character, () => this.playerDefeat(data))
                : this.defineTurn(data.character, data.enemy, () => this.enemyDefeat(data))

            gameData.update(d => {
                d.showUI.actionBtns = true
                return d
            })
        }, 2000)
    }
}

export default new Combat()
