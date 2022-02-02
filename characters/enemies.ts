import { Base_Entity } from './base'
import { config } from './config'

const base = config.base

export class Enemy extends Base_Entity {
    constructor(level: number, name: string) {
        super(level, name)
        this.size = 'w-full h-full'
    }
}

export class Slime extends Enemy {
    // good AP  =>  but weak vs AD
    constructor(level: number = 1, name: string = 'SLIME') {
        super(level, name)
        this.image = 'slime-blue'
        this.size = 'w-36 h-36'
        // + buff
        this.ap = level * (base.ap * 1.5)
        // - nerf
        this.health = level * (base.health * 0.75)
        this.armor = level * (base.armor * 0.75)
    }
}

export class FireWorm extends Enemy {
    // fast and AD  =>  but low HP
    constructor(level: number = 1, name: string = 'FIRE WORM') {
        super(level, name)
        this.image = 'fire-worm'
        this.size = 'w-64 h-64'
        // + buff
        this.ap = level * (base.ad * 1.25)
        this.speed = level * (base.speed * 1.25)
        // - nerf
        this.health = level * (base.health * 0.75)
    }
}

export class Adventurer extends Enemy {
    // fast and AD  =>  but low HP
    constructor(level: number = 1, name: string = 'ADVENTURER PABLO') {
        super(level, name)
        this.image = 'adventurer'
        this.size = 'w-48 h-48'
        // + buff
        this.ap = level * (base.ad * 1.25)
        this.speed = level * (base.speed * 1.25)
        // - nerf
        this.health = level * (base.health * 0.75)
    }
}

export class Martial extends Enemy {
    // fast and AD  =>  but low HP
    constructor(level: number = 1, name: string = 'MARTIAL HERO BERTO') {
        super(level, name)
        this.image = 'martial'
        this.size = 'w-64 h-64'
        // + buff
        this.ap = level * (base.ad * 1.25)
        this.speed = level * (base.speed * 1.25)
        // - nerf
        this.health = level * (base.health * 0.75)
    }
}

export class Knight extends Enemy {
    // AD, HP and armor  =>  but low AP, MR and speed
    constructor(level: number = 1, name: string = 'KNIGHT') {
        super(level, name)
        this.image = 'knight'
        this.size = 'w-64 h-64'
        // + buff
        this.health = level * (base.health * 1.5)
        this.ad = level * (base.ad * 1.25)
        this.armor = level * (base.armor * 1.25)
        // - nerf
        this.ap = level * (base.ap * 0.5)
        this.mr = level * (base.mr * 0.75)
        this.speed = level * (base.speed * 0.75)
    }
}
