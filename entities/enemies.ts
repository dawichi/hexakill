import { Base_Entity } from './base'
import { config } from './config'

const base = config.base

export class Enemy extends Base_Entity {
    constructor(level: number, name: string) {
        super(level, name)
    }
}

export class Slime extends Enemy {
    // good AP  =>  but weak vs AD
    constructor(level: number = 1, name: string = 'SLIME') {
        super(level, name)
        // + buff
        this.ap = level * (base.ap * 1.5)
        // - nerf
        this.health = level * (base.health * 0.75)
        this.armor = level * (base.armor * 0.75)
    }
}

export class Eagle extends Enemy {
    // fast and AD  =>  but low HP
    constructor(level: number = 1, name: string = 'EAGLE') {
        super(level, name)
        // + buff
        this.ad = level * (base.ad * 1.25)
        this.speed = level * (base.speed * 1.25)
        // - nerf
        this.health = level * (base.health * 0.75)
    }
}

export class Knight extends Enemy {
    // AD, HP and armor  =>  but low AP, MR and speed
    constructor(level: number = 1, name: string = 'KNIGHT') {
        super(level, name)
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
