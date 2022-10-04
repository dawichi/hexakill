import type { LogDTO } from '$lib/types/Logger.dto'

/**
 * ## Cleans the old logs to update the store
 * @param logs - The logs to clean
 * @param newLog - The new log to add
 * @returns The cleaned logs
 */
export const loggerCleaner = (logs: LogDTO[], newLog: LogDTO): LogDTO[] => {
    if (logs.length >= 8) {
        logs.shift()
    }
    logs.push(newLog)
    return logs
}
