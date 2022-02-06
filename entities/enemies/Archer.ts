import { Enemy } from '..'
import { config } from '..'

const base = config.base

// ╔══════════════════════════════════════════════════════
// ║ +: AD*, speed
// ╠══════════════════════════════════════════════════════
// ║ -: health*, armor
// ╚══════════════════════════════════════════════════════
export class Archer extends Enemy {
    constructor(level: number = 1, name: string = 'Archer') {
        super(level, name + ' ' + config.names[Math.floor(Math.random() * config.names.length)])
        this.image = 'archer'
        this.size = 'w-48 h-48'
        // + buff
        this.ad = level * (base.ad * 1.5)
        this.speed = level * (base.speed * 1.25)
        // - nerf
        this.health = level * (base.health * 0.5)
        this.armor = level * (base.armor * 0.75)
    }
}

export default Archer
