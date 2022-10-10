import type { Character, Enemy } from '$lib/models'

export type GameDTO = {
    view: 'welcome' | 'champSelect' | 'combat' | 'store' | 'gameover'
    username: string
    characterIdx: number
    character: Character | null
    enemy: Enemy | null
}
