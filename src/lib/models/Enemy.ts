import type { EnemyConfigDto, Modifiers, Stats } from '$lib/types/Entities.dto'
import { BaseEntity, config } from '.'

const { base, names } = config

class Enemy extends BaseEntity {
    private readonly modifiers: Modifiers

    constructor(level: number, name: string, config: EnemyConfigDto, gold: number) {
        super(level, name + ' ' + names[Math.floor(Math.random() * names.length)])
        this.modifiers = config.modifiers
        this.image = config.name.replaceAll(' ', '-').toLowerCase()
        this.size = config.size
        this.gold = gold

        const stats: Stats[] = ['health', 'ad', 'ap', 'armor', 'mr', 'speed']
        stats.forEach(stat => {
            if (level < 10) return (this[stat] = level * base[stat] * 0.5)
            if (level < 20) return (this[stat] = level * base[stat] * 0.75 + level)
            return level * base[stat] * this.modifiers[stat] + 2 * level
        })
    }
}

export default Enemy
