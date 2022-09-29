/**
 * Get a random natural number between min and max
 * @param min min number
 * @param max max number
 * @returns random number
 */
export function numberBetween(min: number, max: number): number {
        return parseInt((Math.floor(Math.random() * (max - min + 1)) + min).toFixed(0))
}