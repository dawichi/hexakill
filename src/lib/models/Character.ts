import type { CharacterConfigDto, Modifiers, Stats } from '$lib/types/Entities.dto'
import { BaseEntity, config } from '.'

const base = config.base

class Character extends BaseEntity {
    exp = 0
    private readonly modifiers: Modifiers

    constructor(level: number, name: string, config: CharacterConfigDto) {
        super(level, `${name} (${config.name})`)
        this.modifiers = config.modifiers
        this.image = config.name.toLowerCase()
        this.size = config.data.size
    }

    private _incrementStat(stat: Stats, preValue: number): number {
        return base[stat] * this.modifiers[stat] + preValue
    }

    private _levelUp(): void {
        this.level++
        this.health = this._incrementStat('health', this.health)
        this.ad = this._incrementStat('ad', this.ad)
        this.ap = this._incrementStat('ap', this.ap)
        this.armor = this._incrementStat('armor', this.armor)
        this.mr = this._incrementStat('mr', this.mr)
        this.speed = this._incrementStat('speed', this.speed)
    }

    /**
     * ## Gain Experience
     * @param exp Experience to gain
     * @returns true if leveled up
     */
    gainExp(exp: number): boolean {
        let exp_total = this.exp + exp
        if (exp_total >= 100) {
            while (exp_total >= 100) {
                this._levelUp()
                exp_total -= 100
            }
            this.exp = exp_total
            return true
        } else {
            this.exp += exp
            return false
        }
    }

    gainGold(gold: number): void {
        this.gold += gold
    }
}

export default Character
