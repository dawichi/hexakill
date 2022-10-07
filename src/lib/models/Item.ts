import type { Modifiers, Stats } from '$lib/types/Entities.dto'

function calcIncrement(bonus: Modifiers, tier: number): Modifiers {
    const stats: Stats[] = ['health', 'ad', 'ap', 'armor', 'mr', 'speed']
    stats.forEach(stat => {
        bonus[stat] = bonus[stat] * 2 ** (tier - 1)
    })
    return bonus
}

class Item {
    name: string
    image: string
    tier: 1 | 2 | 3
    bonus: Modifiers

    constructor(name: string, tier: 1 | 2 | 3, bonus: Modifiers) {
        this.name = name
        this.image = name.replaceAll(' ', '-').toLowerCase()
        this.tier = tier
        this.bonus = calcIncrement(bonus, tier)
    }
}

export default Item
