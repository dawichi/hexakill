import { Enemy } from '..'
import { config } from '..'

const base = config.base

const slimes = ['blue', 'gold', 'green', 'purple', 'red']

// ╔══════════════════════════════════════════════════════
// ║ +: AP, speed, armor
// ╠══════════════════════════════════════════════════════
// ║ -: AD, health, mr
// ╚══════════════════════════════════════════════════════
export class Slime extends Enemy {
    constructor(level: number = 1, name: string = 'SLIME') {
        super(level, name + ' ' + config.names[Math.floor(Math.random() * config.names.length)])
        this.image = `slime-${slimes[Math.floor(Math.random() * slimes.length)]}`
        this.size = 'w-36 h-36'
        // + buff
        this.health = level * (base.health * 1.25)
        this.armor = level * (base.armor * 1.25)
        this.speed = level * (base.speed * 1.25)
        // - nerf
        this.ap = level * (base.ap * 0.75)
        this.ad = level * (base.ad * 0.75)
        this.mr = level * (base.mr * 0.75)
    }
}

export default Slime
