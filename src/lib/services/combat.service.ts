import { gameData } from '$lib/data/data'
import { Character, Enemy } from '$lib/models'
import type { GameDTO } from '$lib/types/Game.dto'
import { loggerService, storageService } from '.'
import enemyService from './enemy.service'

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
    private executeTurn(active: Character | Enemy, passive: Character | Enemy): void {
        const active_is_a_player: boolean = active instanceof Character
        const choice = active instanceof Enemy ? enemyService.generateAction(active) : this.playerAction

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

    /**
     * ## Defines a turn
     * @param active The active entity (attacks)
     * @param passive The passive entity (gets the damage)
     * @param defeatFn The function to call if the passive dies
     * @returns If the passive has died
     */
    private defineTurn(active: Character | Enemy, passive: Character | Enemy, defeatFn: () => void): boolean {
        this.executeTurn(active, passive)
        if (passive.dmgReceived === passive.health) {
            defeatFn()
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

        gameData.update(n => {
            if (!n.character || !n.enemy) return n
            n.showUI.fighting = false
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
            return n
        })

        setTimeout(() => {
            gameData.update(n => {
                n.enemy = null
                return n
            })
        }, 2000)
    }

    /**
     * ## ❌ PLAYER DEFEATED
     */
    private playerDefeat(data: GameDTO): void {
        gameData.update(n => {
            n.showUI.fighting = false
            loggerService.add(n.logs.player, {
                title: 'Oh no!',
                message: 'You have been defeated! 😭',
            })
            return n
        })

        storageService.add({
            classIdx: data.characterIdx,
            name: data.character?.name ?? '',
            record: data.character?.level ?? 0,
        })

        setTimeout(() => {
            gameData.update(n => {
                n.view = 'gameover'
                return n
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

        gameData.update(n => {
            n.showUI.actionBtns = false
            return n
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
            gameData.update(n => {
                n.showUI.actionBtns = true
                return n
            })
            return
        }

        // SECOND TURN
        setTimeout(() => {
            if (!data.character || !data.enemy) return
            isPlayerFaster
                ? this.defineTurn(data.enemy, data.character, () => this.playerDefeat(data))
                : this.defineTurn(data.character, data.enemy, () => this.enemyDefeat(data))

            gameData.update(n => {
                n.showUI.actionBtns = true
                return n
            })
        }, 1000)
    }
}

export default new Combat()
