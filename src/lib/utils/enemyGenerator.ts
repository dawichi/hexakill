import { Enemy } from '$lib/models'
import { enemies } from '$lib/config/enemies'

/**
 * Return a random enemy from the enemies array.
 * Base enemy level on the player's level.
 * @param level The player's level.
 * @returns A enemy.
 */
export function enemyGenerator(level: number): Enemy {
    // range of levels
    const min_level = Math.floor(level / 2)
    const max_level = level * 1.75
    const enemy_level = parseInt((Math.floor(Math.random() * (max_level - min_level + 1)) + min_level).toFixed(0))

    // pick a random enemy and return it
    const enemy = enemies[Math.floor(Math.random() * enemies.length)]
    return new Enemy(enemy_level, enemy.name, enemy)
}
