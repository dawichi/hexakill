import type { Enemy } from '$lib/models'

export function enemyActionChoice(enemy: Enemy): 0 | 1 | 2 {
    let choice: 0 | 1 | 2
    const enemy_action_generator = Math.random()

    if ((enemy.health - enemy.dmgReceived) / enemy.health < 0.1) {
        // If HP < 10%, always heals
        choice = 2
    } else if ((enemy.health - enemy.dmgReceived) / enemy.health > 0.8) {
        // If HP > 80%, never heals
        choice = enemy_action_generator < 0.5 ? 0 : 1
    } else {
        choice = enemy_action_generator < 0.33 ? 0 : enemy_action_generator < 0.66 ? 1 : 2
    }

    return choice
}
