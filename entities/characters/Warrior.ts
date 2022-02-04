import { Character } from '..'
import { config } from '..'

const base = config.base

// ╔══════════════════════════════════════════════════════
// ║ +: health, armor, mr
// ╠══════════════════════════════════════════════════════
// ║ -: ad, ap, speed
// ╚══════════════════════════════════════════════════════
export class Warrior extends Character {
    constructor(level: number, name: string) {
        super(level, `${name} (Warrior)`)
        this.image = 'warrior'
        this.size = 'w-64 h-52'
        this.health = level * base.health * 2
    }

    _levelUp() {
        this.level++
        this.health += base.health * 1.5
        this.ad += base.ad * 0.75
        this.ap += base.ap * 0.75
        this.armor += base.armor * 1.25
        this.mr += base.mr * 1.25
        this.speed += base.speed * 0.75
    }
}

export default Warrior
