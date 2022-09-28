import { Enemy } from '..'
import { config } from '..'

const base = config.base

// ╔══════════════════════════════════════════════════════
// ║ +: HP, AD, armor
// ╠══════════════════════════════════════════════════════
// ║ -: MR, AP, Speed
// ╚══════════════════════════════════════════════════════
export class FireKnight extends Enemy {
    constructor(level = 1, name = 'Fire Knight') {
        super(level, name + ' ' + config.names[Math.floor(Math.random() * config.names.length)])
        this.image = 'fire-knight'
        this.size = 'w-80 h-80'
        // + buff
        this.health = level * (base.health * 1.5)
        this.ad = level * (base.ad * 1.25)
        this.armor = level * (base.armor * 1.25)
        // - nerf
        this.mr = level * (base.mr * 0.75)
        this.ap = level * (base.ap * 0.75)
        this.speed = level * (base.speed * 0.5)
    }
}

export default FireKnight