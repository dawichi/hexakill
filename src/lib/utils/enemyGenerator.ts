import {
    Adventurer,
    Archer,
    ArmoredHuntress,
    BringerOfDeath,
    EvilTree,
    EvilWizard,
    FireKnight,
    FireWorm,
    Knight,
    Martial,
    Slime,
    WaterPriestess,
    WildHuntress,
    WitchBlue,
    type Enemy,
} from '$lib/models'

/**
 * Return a random enemy from the enemies array.
 * Base enemy level on the player's level.
 * @param level The player's level.
 * @returns A enemy.
 */
export function enemyGenerator(level: number): Enemy {
    // range of levels
    const min_enemy_level = Math.floor(level / 2)
    const max_enemy_level = level * 1.75
    const enemy_level = parseInt((Math.floor(Math.random() * (max_enemy_level - min_enemy_level + 1)) + min_enemy_level).toFixed(0))

    // enemies available
    const enemies_pool = [
        Adventurer,
        EvilTree,
        FireKnight,
        FireWorm,
        Knight,
        Martial,
        Slime,
        Archer,
        ArmoredHuntress,
        BringerOfDeath,
        EvilWizard,
        WaterPriestess,
        WildHuntress,
        WitchBlue,
    ]

    // pick a random enemy and return it
    const enemy_pick = enemies_pool[Math.floor(Math.random() * enemies_pool.length)]
    return new enemy_pick(enemy_level)
}
