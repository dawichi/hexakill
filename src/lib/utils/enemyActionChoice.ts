import type { Enemy } from '$lib/models'

export function enemyActionChoice(enemy: Enemy): 0 | 1 | 2 {
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
