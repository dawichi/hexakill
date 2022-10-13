import type { Character, Enemy, Item } from '$lib/models'
import type { LoggerDTO } from './Logger.dto'

export type EnemyHistory = {
    image: string
    level: number
}
export type GameDTO = {
    view: 'welcome' | 'champSelect' | 'combat' | 'store' | 'gameover'
    username: string
    characterIdx: number
    character: Character | null
    enemy: Enemy | null
    shop: {
        items: Item[]
    }
    showUI: {
        fighting: boolean
        actionBtns: boolean
    }
    logs: LoggerDTO
    powerUps: {
        pending: number
        history: Record<string, number>
    }
    enemiesHistory: Array<EnemyHistory>
}
