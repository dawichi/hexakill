import type { EnemyConfigDto, Modifiers, Stats } from '$lib/types/Entities.dto'
import { BaseEntity, config } from '.'

const { base, names } = config

class Enemy extends BaseEntity {
    private readonly modifiers: Modifiers

    constructor(level: number, name: string, config: EnemyConfigDto) {
        super(level, name + ' ' + names[Math.floor(Math.random() * names.length)])
        this.modifiers = config.modifiers
        this.image = config.name.replaceAll(' ', '-').toLowerCase()
        this.size = config.size

        const stats: Stats[] = ['health', 'ad', 'ap', 'armor', 'mr', 'speed']
        stats.forEach((stat) => {
            const value = level * base[stat] * this.modifiers[stat] + level
            level < 10
                ? this[stat] = level * base[stat] * 0.5
                : this[stat] = value
        })
    }
}

export default Enemy
