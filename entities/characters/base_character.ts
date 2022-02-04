import { Base_Entity } from '..'
import { config } from '..'

const base = config.base

class Character extends Base_Entity {
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

export default Character
