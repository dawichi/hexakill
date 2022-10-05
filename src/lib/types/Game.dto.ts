import type { Character, Enemy } from '$lib/models'

export type GameDTO = {
    step: 'welcome' | 'starting' | 'playing' | 'gameover'
    username: string
    characterIdx: number
    character: Character | null
    enemy: Enemy | null
}
