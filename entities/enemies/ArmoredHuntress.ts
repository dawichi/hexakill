import { Enemy } from '..'
import { config } from '..'

const base = config.base

// ╔══════════════════════════════════════════════════════
// ║ +: health*, speed, ad
// ╠══════════════════════════════════════════════════════
// ║ -: ap, armor, mr*
// ╚══════════════════════════════════════════════════════
export class ArmoredHuntress extends Enemy {
    constructor(level: number = 1, name: string = 'Armored huntress') {
        super(level, name)
        this.image = 'huntress-armored'
        this.size = 'w-64 h-48'
        // + buff
        this.health = level * (base.health * 1.5)
        this.speed = level * (base.speed * 1.25)
        this.ad = level * (base.ad * 1.25)
        // - nerf
        this.ap = level * (base.ap * 0.75)
        this.armor = level * (base.armor * 0.75)
        this.mr = level * (base.mr * 0.5)
    }
}

export default ArmoredHuntress
