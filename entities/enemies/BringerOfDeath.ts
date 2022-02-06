import { Enemy } from '..'
import { config } from '..'

const base = config.base

// ╔══════════════════════════════════════════════════════
// ║ +: health*, armor, ap
// ╠══════════════════════════════════════════════════════
// ║ -: ad*, mr, speed
// ╚══════════════════════════════════════════════════════
export class BringerOfDeath extends Enemy {
    constructor(level: number = 1, name: string = 'BRINGER OF DEATH') {
        super(level, name)
        this.image = 'bringer-of-death'
        this.size = 'w-48 h-48'
        // + buff
        this.health = level * (base.health * 1.5)
        this.armor = level * (base.armor * 1.25)
        this.ap = level * (base.ap * 1.25)
        // - nerf
        this.ad = level * (base.ad * 0.5)
        this.speed = level * (base.speed * 0.75)
        this.mr = level * (base.mr * 0.75)
    }
}

export default BringerOfDeath
