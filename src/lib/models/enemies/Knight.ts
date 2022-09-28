import { Enemy } from '..'
import { config } from '..'

const base = config.base

// ╔══════════════════════════════════════════════════════
// ║ +: health*, armor, ad
// ╠══════════════════════════════════════════════════════
// ║ -: ap, mr*, speed
// ╚══════════════════════════════════════════════════════
export class Knight extends Enemy {
    constructor(level = 1, name = 'KNIGHT') {
        super(level, name)
        this.image = 'knight'
        this.size = 'w-64 h-64'
        // + buff
        this.health = level * (base.health * 1.5)
        this.armor = level * (base.armor * 1.25)
        this.ad = level * (base.ad * 1.25)
        // - nerf
        this.ap = level * (base.ap * 0.75)
        this.speed = level * (base.speed * 0.75)
        this.mr = level * (base.mr * 0.5)
    }
}

export default Knight
