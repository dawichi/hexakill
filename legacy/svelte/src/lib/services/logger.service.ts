import type { LogDTO } from '$lib/types/Logger.dto'

/**
 * Logger service utils
 */
const logger = {
    /**
     * ## Add a new log
     */
    add: (logs: LogDTO[], newLog: LogDTO): LogDTO[] => {
        if (logs.length >= 8) {
            logs.shift()
        }
        logs.push(newLog)
        return logs
    },
}

export default logger
