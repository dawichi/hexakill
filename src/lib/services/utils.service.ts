import type { Item } from '$lib/models'
import type { Modifiers } from '$lib/types/Entities.dto'

/**
 * Small utils
 */
const utils = {
    /**
     * Get a random natural number between min and max
     * @param min min number
     * @param max max number
     * @returns random number
     */
    numberBetween(min: number, max: number): number {
        return parseInt((Math.floor(Math.random() * (max - min + 1)) + min).toFixed(0))
    },

    /**
     * ## Calculate damage reduction
     * @param damage - The damage to be reduced
     * @param resistance - The resistance of the target
     * @returns The damage reduced
     */
    calcDmgReduction(damage: number, resistance: number): number {
        return parseInt(((damage * 600) / (600 + resistance)).toFixed(0))
    },

    /**
     * ## Calculate damage reduction in percent
     * @param resistance - The resistance of the target
     * @returns The damage reduction in percent	(Ex: 100 armor = 14.3 reduction)
     */
    calcDmgReductionPercent(resistance: number): number {
        return (1000 - this.calcDmgReduction(1000, resistance)) / 10
    },

    /**
     * ## Calculate total bonus
     */
    calcTotalBonus(items: Item[]): Modifiers {
        const totalBonus: Modifiers = {
            health: 0,
            ad: 0,
            ap: 0,
            armor: 0,
            mr: 0,
            speed: 0,
        }

        items.forEach(item => {
            totalBonus.health += item.bonus.health
            totalBonus.ad += item.bonus.ad
            totalBonus.ap += item.bonus.ap
            totalBonus.armor += item.bonus.armor
            totalBonus.mr += item.bonus.mr
            totalBonus.speed += item.bonus.speed
        })

        return totalBonus
    },
}

export default utils
