import { Enemy } from '..'
import { config } from '..'

const base = config.base

// ╔══════════════════════════════════════════════════════
// ║ +: AP*, speed, health
// ╠══════════════════════════════════════════════════════
// ║ -: AD, armor*, mr
// ╚══════════════════════════════════════════════════════
export class WitchBlue extends Enemy {
    constructor(level = 1, name = 'Blue Witch') {
        super(level, name)
        this.image = 'witch-blue'
        this.size = 'w-36 h-36'
        // + buff
        this.ap = level * (base.ap * 1.5)
        this.health = level * (base.health * 1.25)
        this.speed = level * (base.speed * 1.25)
        // - nerf
        this.armor = level * (base.armor * 0.5)
        this.ad = level * (base.ad * 0.75)
        this.mr = level * (base.mr * 0.75)
    }
}

export default WitchBlue
