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
}

export default utils
