import { enemies } from '$lib/config/enemies'
import { Enemy } from '$lib/models'

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
        const enemy_level = parseInt((Math.floor(Math.random() * (max_level - min_level + 1)) + min_level).toFixed(0))

        // pick a random enemy and return it
        const enemy = enemies[Math.floor(Math.random() * enemies.length)]
        return new Enemy(enemy_level, enemy.name, enemy)
    },
}

export default enemy
