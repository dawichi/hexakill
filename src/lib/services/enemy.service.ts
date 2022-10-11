import { enemies } from '$lib/config/enemies'
import { Enemy } from '$lib/models'
import { loggerService } from '.'
import { gameData } from '$lib/data/data'


/**
 * Enemy utils
 */
class EnemyService {
    private bosses: Record<number,Enemy> = {
        10: new Enemy(15,'Gold Slime 1', enemies[14]),
        20: new Enemy(25,'Gold Slime 2', enemies[14]),
        30: new Enemy(35,'Gold Slime 3', enemies[14]),
    }

    /**
     * ## Generate an enemy action
     * Depending of the hp, he prioritize attack or healing
     * @param enemy The enemy.
     * @returns The action choosen.
     */
    generateAction(enemy: Enemy): 0 | 1 | 2 {
        const currentHP = (enemy.health - enemy.dmgReceived) / enemy.health
        const enemy_action = Math.random()

        // If no potions available or HP > 60%, never heals
        if (!enemy.potions || currentHP >= 0.6) return enemy_action <= 0.5 ? 0 : 1

        // If HP < 10%, always heals
        if (currentHP <= 0.1) return 2

        // Any other case, 33% chance each
        if (enemy_action <= 0.33) return 0
        if (enemy_action <= 0.66) return 1
        return 2
    }

    /**
     * ## Generate a new enemy
     * Depending of the player levels
     * @param level The player's level.
     * @returns A enemy.
     */
    private generateEnemy(level: number): Enemy {
        // range of levels
        const min_level = Math.floor(level / 2)
        const max_level = level * 1.75

        if (level < parseInt(Object.keys(this.bosses)[0])) {
            const enemy_level = parseInt((Math.floor(Math.random() * (max_level - min_level + 1)) + min_level).toFixed(0))
            const enemy = enemies[Math.floor(Math.random() * enemies.length)]
            return new Enemy(enemy_level, enemy.name, enemy)
        } else {
            const boss = Object.values(this.bosses)[0]
            delete this.bosses[parseInt(Object.keys(this.bosses)[0])]
            return boss
        }
    }

    /**
     * ## New Enemy
     * Spawns a new enemy in the gameData
     * @param gameData The game data
     * @returns The game data
     */
    newEnemy(): void {
        gameData.update(d => {
            if (!d.character) return d
            d.character.potions += 1
            d.enemy = this.generateEnemy(d.character.level)
            d.showUI.fighting = true

            const isPlayerFaster: boolean = (d.character.speed ?? 0) > (d.enemy.speed ?? 0)

            loggerService.add(d.logs.enemy, {
                title: d.enemy.name,
                message: `has appeared!`,
            })

            const logTo = isPlayerFaster ? 'player' : 'enemy'
            loggerService.add(d.logs[logTo], {
                title: isPlayerFaster ? 'You' : d.enemy.name,
                message: isPlayerFaster ? `attack first!` : `attacks first!`,
            })
            return d
        })

    }
}

export default new EnemyService()
