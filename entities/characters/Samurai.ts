import { Character } from '..'
import { config } from '..'

const base = config.base

// ╔══════════════════════════════════════════════════════
// ║ +: AD, fast
// ╠══════════════════════════════════════════════════════
// ║ -: armor, health
// ╚══════════════════════════════════════════════════════
export class Samurai extends Character {
    constructor(level: number, name: string) {
        super(level, `${name} (Samurai)`)
        this.image = 'samurai'
        this.size = 'w-64 h-64'
        this.ad = level * base.ad * 2
    }

    _levelUp() {
        this.level++
        this.health += base.health * 0.75
        this.ad += base.ad * 1.25
        this.ap += base.ap
        this.armor += base.armor * 0.75
        this.mr += base.mr * 1.25
        this.speed += base.speed * 1.25
    }
}

export default Samurai
