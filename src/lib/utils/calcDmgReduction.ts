/**
 * ## Calculate damage reduction
 * @param damage - The damage to be reduced
 * @param resistance - The resistance of the target
 * @returns The damage reduced
 */
export function calcDmgReduction(damage: number, resistance: number): number {
    return parseInt(((damage * 600) / (600 + resistance)).toFixed(0))
}

/**
 * ## Calculate damage reductino in percent
 * @param resistance - The resistance of the target
 * @returns The damage reduction in percent	(Ex: 100 armor = 14.3 reduction)
 */
export function calcDmgReductionPercent(resistance: number): number {
    return (1000 - calcDmgReduction(1000, resistance)) / 10
}
