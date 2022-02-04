import { config } from '.'

const base = config.base

class Base_Entity {
    name: string
    image: string
    size: string
    level: number
    dmgRecieved: number
    health: number
    ad: number
    ap: number
    armor: number
    mr: number
    speed: number

    constructor(level: number, name: string) {
        this.name = name
        this.size = 'w-full h-full'
        this.level = level
        this.dmgRecieved = 0
        this.health = level * base.health
        this.ad = level * base.ad
        this.ap = level * base.ap
        this.armor = level * base.armor
        this.mr = level * base.mr
        this.speed = level * base.speed
    }

    _getDamage(damage: number) {
        this.dmgRecieved += damage
        // If dies, HP counter shows 0 HP, not negative HP
        if (this.dmgRecieved > this.health) this.dmgRecieved = this.health
    }

    recieveAttack(damage: number) {
        let dmg = damage - this.armor
        if (dmg < 0) dmg = 0
        this._getDamage(dmg)
        return dmg
    }

    recieveMagic(damage: number) {
        let dmg = damage - this.mr
        if (dmg < 0) dmg = 0
        this._getDamage(dmg)
        return dmg
    }

    attack() {
        // Range of damage, [80% to 140%] of AD
        const min_hit = this.ad * 0.8
        const max_hit = this.ad * 1.4
        // Calc damage between the range
        const damage = parseInt((Math.floor(Math.random() * (max_hit - min_hit + 1)) + min_hit).toFixed(0))
        // Calc the chances. 10% critic, 10% misses
        const chances = Math.random()
        const critic = chances > 0.9
        const misses = chances < 0.1
        // return the correct damage done
        if (misses) return 0
        if (critic) return damage * 2
        return damage
    }

    magic() {
        // Range of damage, [30% to 200%] of AP
        const min_hit = this.ap * 0.3
        const max_hit = this.ap * 2
        // Calc damage between the range
        const damage = parseInt((Math.floor(Math.random() * (max_hit - min_hit + 1)) + min_hit).toFixed(0))
        // Calc the chances. 40% critic, 30% misses
        const chances = Math.random()
        const critic = chances > 0.6
        const misses = chances < 0.3
        // return the correct damage done
        if (misses) return 0
        if (critic) return damage * 2
        return damage
    }

    heal() {
        // Range of heal, [10% to 30%] of dmgRecieved
        const min_heal = this.dmgRecieved * 0.1
        const max_heal = this.dmgRecieved * 0.3
        // Calc heal between the range
        const heal = parseInt((Math.floor(Math.random() * (max_heal - min_heal + 1)) + min_heal).toFixed(0))
        this.dmgRecieved -= heal
        if (this.dmgRecieved < 0) {
            this.dmgRecieved = 0
        }
        return heal
    }
}

export default Base_Entity
