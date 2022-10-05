import { Enemy } from '..'
import { config } from '..'

const base = config.base

// ╔══════════════════════════════════════════════════════
// ║ +: AP, MR, Speed
// ╠══════════════════════════════════════════════════════
// ║ -: HP, AD, Armor
// ╚══════════════════════════════════════════════════════
export class WaterPriestess extends Enemy {
    constructor(level = 1, name = 'Water Priestess') {
        super(level, name + ' ' + config.names[Math.floor(Math.random() * config.names.length)])
        this.image = 'water-priestess'
        //max: w-80 h-80
        this.size = 'w-80 h-80'

        this.speed = level * (base.speed * 1.25)
        // + buff
        this.ap = level * (base.ap * 1.5)
        this.mr = level * (base.mr * 1.25)
        // - nerf
        this.health = level * (base.health * 0.75)
        this.ad = level * (base.ad * 0.75)
        this.armor = level * (base.armor * 0.75)
    }
}

export default WaterPriestess
