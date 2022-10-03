import type { PersonalRecord } from '$lib/types/PersonalRecord'

const localStorageKey = 'hxkllPersonalRecords'

export const localStorageService = {
    add: (record: PersonalRecord) => {
        const localStorageItem = localStorage.getItem(localStorageKey)
        const localStorageItemArray = localStorageItem ? JSON.parse(localStorageItem) : []
        localStorageItemArray.push(record)
        localStorageItemArray.sort((a: PersonalRecord, b: PersonalRecord) => b.record - a.record)
        localStorage.setItem(localStorageKey, JSON.stringify(localStorageItemArray.slice(0, 5)))
    },
    get: (): PersonalRecord[] => {
        const localStorageItem = localStorage.getItem(localStorageKey)
        return localStorageItem ? JSON.parse(localStorageItem) : []
    },
    clear: () => localStorage.removeItem(localStorageKey),
}
