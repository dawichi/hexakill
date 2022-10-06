import { Enemy } from '..'
import { config } from '..'

const base = config.base

// ╔══════════════════════════════════════════════════════
// ║ +: AD*, speed
// ╠══════════════════════════════════════════════════════
// ║ -: health*, armor
// ╚══════════════════════════════════════════════════════
export class IceGolem extends Enemy {
    constructor(level = 1, name = 'Ice Golem') {
        super(level, 'Boss: ' + name )
        this.image = 'ice-golem'
        this.size = 'w-48 h-48'
        // + buff
        this.health = level * (base.health * 2.0)
        this.armor = level * (base.armor * 1.25)
        // - nerf
        this.ad = level * (base.ad * 0.5)
        this.ap = level * (base.ap * 0.5)
        this.speed = level * (base.speed * 0.75)
    }
}

export default IceGolem