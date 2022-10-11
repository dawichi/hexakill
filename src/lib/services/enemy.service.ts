import { enemies } from '$lib/config/enemies'
import { Enemy } from '$lib/models'

const bosses: Record<number,Enemy> = {
    10: new Enemy(15,'Gold Slime 1', enemies[14]),
    20: new Enemy(25,'Gold Slime 2', enemies[14]),
    30: new Enemy(35,'Gold Slime 3', enemies[14]),
}
/**
 * Enemy utils
 */
const enemy = {
    /**
     * ## Generate the enemy action
     */
    enemyActionChoice(enemy: Enemy): 0 | 1 | 2 {
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
    },
    /**
     * Return a random enemy from the enemies array.
     * Base enemy level on the player's level.
     * @param level The player's level.
     * @returns A enemy.
     */
    enemyGenerator(level: number): Enemy {
        // range of levels
        const min_level = Math.floor(level / 2)
        const max_level = level * 1.75
        if ((level) < parseInt(Object.keys(bosses)[0])){
            const enemy_level = parseInt((Math.floor(Math.random() * (max_level - min_level + 1)) + min_level).toFixed(0))
            const enemy = enemies[Math.floor(Math.random() * enemies.length)]
            return new Enemy(enemy_level, enemy.name, enemy)
        }else{
            const boss = Object.values(bosses)[0]
            delete bosses[parseInt(Object.keys(bosses)[0])]
            return boss
        }
        // pick a random enemy and return it
    },
}

export default enemy
