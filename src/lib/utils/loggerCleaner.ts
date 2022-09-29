import type { DamageLog, GeneralLog } from '$lib/types/Logger'

/**
 * ## Cleans the old logs to update the store
 * @param logs - The logs to clean
 * @param newLog - The new log to add
 * @returns The cleaned logs
 */
export const loggerCleaner = (logs: DamageLog[] | GeneralLog[], newLog: GeneralLog | DamageLog): DamageLog[] | GeneralLog[] => {
    if (logs.length >= 8) {
        logs.shift()
    }
    logs.push(newLog)
    return logs
}
