import { Character } from '..'
import { config } from '..'

const base = config.base

// ╔══════════════════════════════════════════════════════
// ║ +: ap, hp
// ╠══════════════════════════════════════════════════════
// ║ -: armor, mr
// ╚══════════════════════════════════════════════════════
class Wizard extends Character {
    constructor(level: number, name: string) {
        super(level, `${name} (Wizard)`)
        this.image = 'wizard'
        this.size = 'w-36 h-56'
        this.ap = level * base.ap * 2
    }

    _levelUp() {
        this.level++
        this.health += base.health * 1.25
        this.ad += base.ad
        this.ap += base.ap * 1.5
        this.armor += base.armor * 0.75
        this.mr += base.mr * 0.75
        this.speed += base.speed
    }
}

export default Wizard
