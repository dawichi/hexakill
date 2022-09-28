import { Enemy } from '..'
import { config } from '..'

const base = config.base

// ╔══════════════════════════════════════════════════════
// ║ +: AD, armor, speed
// ╠══════════════════════════════════════════════════════
// ║ -: AP, health, mr
// ╚══════════════════════════════════════════════════════
export class Adventurer extends Enemy {
    constructor(level = 1, name = 'Adventurer') {
        super(level, name + ' ' + config.names[Math.floor(Math.random() * config.names.length)])
        this.image = 'adventurer'
        this.size = 'w-48 h-48'
        // + buff
        this.ad = level * (base.ad * 1.25)
        this.armor = level * (base.armor * 1.25)
        this.speed = level * (base.speed * 1.25)
        // - nerf
        this.health = level * (base.health * 0.75)
        this.ap = level * (base.ap * 0.75)
        this.mr = level * (base.mr * 0.75)
    }
}

export default Adventurer
