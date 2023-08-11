import type { CharacterModel, EnemyModel, ItemModel } from '$lib/models'
import type { LoggerDTO } from './Logger.dto'

export type EnemyHistory = {
    image: string
    level: number
}

export type PotionDto = {
    name: string
    quantity: number
    price: number
}

export type GameDTO = {
    view: 'welcome' | 'champSelect' | 'combat' | 'store' | 'gameover'
    username: string
    character: CharacterModel | null
    enemy: EnemyModel | null
    shop: {
        potions: PotionDto[]
        items: ItemModel[]
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
