import type { Character, Enemy } from '$lib/models'

export type Game = {
    step: 'welcome' | 'starting' | 'playing' | 'end'
    username: string
    characterIdx: number
    character: Character | null
    enemy: Enemy | null
}
