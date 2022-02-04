import { Base_Entity } from './base'
import { config } from './config'

const base = config.base

export class Character extends Base_Entity {
    exp: number

    constructor(level: number, name: string) {
        super(level, name)
        this.exp = 0
    }

    _levelUp() {
        this.level++
        this.health += base.health
        this.ad += base.ad
        this.ap += base.ap
        this.armor += base.armor
        this.mr += base.mr
        this.speed += base.speed
    }

    gainExp(exp: number) {
        let exp_total = this.exp + exp
        if (exp_total >= 100) {
            while (true) {
                this._levelUp()
                exp_total -= 100
                if (exp_total < 100) break
            }
            this.exp = exp_total
            return true
        } else {
            this.exp += exp
            return false
        }
    }
}

// Sick AP, low armor
export class Wizard extends Character {
    constructor(level: number, name: string) {
        super(level, `${name} (Wizard)`)
        this.image = 'wizard'
        this.size = 'w-36 h-56'
    }

    _levelUp() {
        this.level++
        this.health += base.health * 1.25
        this.ad += base.ad
        this.ap += base.ap * 1.5
        this.armor += base.armor * 0.75
        this.mr += base.mr
        this.speed += base.speed
    }
}

// Sick AD, low MR
export class Samurai extends Character {
    constructor(level: number, name: string) {
        super(level, `${name} (Samurai)`)
        this.image = 'samurai'
        this.size = 'w-64 h-64'
    }

    _levelUp() {
        this.level++
        this.health += base.health
        this.ad += base.ad * 1.25
        this.ap += base.ap
        this.armor += base.armor * 0.75
        this.mr += base.mr * 1.25
        this.speed += base.speed * 1.25
    }
}

// Sick resists and HP
export class Warrior extends Character {
    constructor(level: number, name: string) {
        super(level, `${name} (Warrior)`)
        this.image = 'warrior'
        this.size = 'w-64 h-52'
    }

    _levelUp() {
        this.level++
        this.health += base.health * 1.5
        this.ad += base.ad * 1.25
        this.ap += base.ap
        this.armor += base.armor
        this.mr += base.mr * 0.75
        this.speed += base.speed * 0.75
    }
}
