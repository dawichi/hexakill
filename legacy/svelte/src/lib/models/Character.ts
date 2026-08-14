import { BaseEntityModel, ItemModel } from '.'
import { base } from './config'
import type { CharacterConfigDto, Modifiers, Stats } from '$lib/types/Entities.dto'
import utils from '$lib/services/utils.service'

export class CharacterModel extends BaseEntityModel {
    private readonly modifiers: Modifiers
    inventory: {
        items: ItemModel[]
        totalBonus: Modifiers
    } = {
        items: [],
        totalBonus: {
            health: 0,
            ad: 0,
            ap: 0,
            armor: 0,
            mr: 0,
            speed: 0,
        },
    }

    constructor(level: number, name: string, config: CharacterConfigDto) {
        super(level, name, config.name)
        this.modifiers = config.modifiers
        this.image = config.name.toLowerCase()
    }

    /**
     * ## Increments a stat
     * @param stat stat to increment
     * @param preValue previous value of the stat
     * @returns the new value of the stat
     */
    private _incrementStat(stat: Stats, preValue: number): number {
        return base[stat] * this.modifiers[stat] + preValue
    }

    /**
     * ## Level up the entity
     * Increment all the stats
     */
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

    /**
     * ## Add an item to the inventory
     */
    addItem(item: ItemModel) {
        this.inventory.items.push(item)
        this.inventory.totalBonus = utils.calcTotalBonus(this.inventory.items)
    }
}
