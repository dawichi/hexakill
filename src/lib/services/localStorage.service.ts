import type { PersonalRecord } from '$lib/types/PersonalRecord'

const key = 'hxkllPersonalRecords'

export const localStorageService = {
    /**
     * ## Get the personal records from localStorage
     */
    get: (): PersonalRecord[] => {
        const data = localStorage.getItem(key)
        return data ? JSON.parse(data) : []
    },
    /**
     * ## Add a new personal record to localStorage
     */
    add: (record: PersonalRecord): void => {
        const data = localStorage.getItem(key)
        const data_arr = data ? JSON.parse(data) : []
        data_arr.push(record)
        data_arr.sort((a: PersonalRecord, b: PersonalRecord) => b.record - a.record)
        localStorage.setItem(key, JSON.stringify(data_arr.slice(0, 5)))
    },
    /**
     * ## Clear the personal records from localStorage
     */
    clear: (): void => localStorage.removeItem(key),
}
