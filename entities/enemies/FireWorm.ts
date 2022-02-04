import { Enemy } from '..'
import { config } from '..'

const base = config.base

// ╔══════════════════════════════════════════════════════
// ║ +: AP, mr, health
// ╠══════════════════════════════════════════════════════
// ║ -: AD, armor, speed
// ╚══════════════════════════════════════════════════════
export class FireWorm extends Enemy {
    constructor(level: number = 1, name: string = 'Fire Worm') {
        super(level, name)
        this.image = 'fire-worm'
        this.size = 'w-64 h-64'
        // + buff
        this.health = level * (base.health * 1.25)
        this.ap = level * (base.ap * 1.25)
        this.mr = level * (base.mr * 1.25)
        // - nerf
        this.ad = level * (base.ad * 0.75)
        this.armor = level * (base.armor * 0.75)
        this.speed = level * (base.speed * 0.75)
    }
}

export default FireWorm
