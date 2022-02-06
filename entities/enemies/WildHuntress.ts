import { Enemy } from '..'
import { config } from '..'

const base = config.base

// ╔══════════════════════════════════════════════════════
// ║ +: AD*, ap, speed
// ╠══════════════════════════════════════════════════════
// ║ -: health*, armor, mr
// ╚══════════════════════════════════════════════════════
export class WildHuntress extends Enemy {
    constructor(level: number = 1, name: string = 'Wild Huntress') {
        super(level, name)
        this.image = 'huntress-wild'
        this.size = 'w-48 h-48'
        // + buff
        this.ad = level * (base.ad * 1.5)
        this.ap = level * (base.ap * 1.25)
        this.speed = level * (base.speed * 1.25)
        // - nerf
        this.health = level * (base.health * 0.5)
        this.armor = level * (base.armor * 0.75)
        this.mr = level * (base.mr * 0.75)
    }
}

export default WildHuntress
