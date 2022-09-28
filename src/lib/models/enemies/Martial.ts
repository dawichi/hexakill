import { Enemy } from '..'
import { config } from '..'

const base = config.base

// ╔══════════════════════════════════════════════════════
// ║ +: AD, health, mr
// ╠══════════════════════════════════════════════════════
// ║ -: AP, armor, speed
// ╚══════════════════════════════════════════════════════
export class Martial extends Enemy {
    constructor(level = 1, name = 'Martial Hero') {
        super(level, name + ' ' + config.names[Math.floor(Math.random() * config.names.length)])
        this.image = 'martial'
        this.size = 'w-64 h-64'
        // + buff
        this.ad = level * (base.ad * 1.25)
        this.health = level * (base.health * 1.25)
        this.mr = level * (base.mr * 1.25)
        // - nerf
        this.ap = level * (base.ap * 0.75)
        this.armor = level * (base.armor * 0.75)
        this.speed = level * (base.speed * 0.75)
    }
}

export default Martial
