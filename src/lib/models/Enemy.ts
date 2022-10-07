import type { EnemyConfigDto, Modifiers } from '$lib/types/Entities.dto'
import { BaseEntity, config } from '.'

const { base, names } = config

class Enemy extends BaseEntity {
    private readonly modifiers: Modifiers

    constructor(level: number, name: string, config: EnemyConfigDto) {
        super(level, name + ' ' + names[Math.floor(Math.random() * names.length)])
        this.modifiers = config.modifiers
        this.image = config.name.replaceAll(' ', '-').toLowerCase()
        this.size = config.size
        this.health = level * base.health * this.modifiers.health
        this.ad = level * base.ad * this.modifiers.ad
        this.ap = level * base.ap * this.modifiers.ap
        this.armor = level * base.armor * this.modifiers.armor
        this.mr = level * base.mr * this.modifiers.mr
        this.speed = level * base.speed * this.modifiers.speed
    }
}

export default Enemy
