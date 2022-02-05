import { Enemy } from '..'
import { config } from '..'

const base = config.base

// ╔══════════════════════════════════════════════════════
// ║ +: AP, speed, mr
// ╠══════════════════════════════════════════════════════
// ║ -: AD, health, armor
// ╚══════════════════════════════════════════════════════
export class EvilWizard extends Enemy {
    constructor(level: number = 1, name: string = 'Evil Wizard') {
        super(level, name + ' ' + config.names[Math.floor(Math.random() * config.names.length)])
        this.image = 'evil-wizard'
        this.size = 'w-64 h-64'
        // + buff
        this.health = level * (base.health * 1.25)
        this.mr = level * (base.mr * 1.25)
        this.speed = level * (base.speed * 1.25)
        // - nerf
        this.ap = level * (base.ap * 0.75)
        this.ad = level * (base.ad * 0.75)
        this.armor = level * (base.armor * 0.75)
    }
}

export default EvilWizard
