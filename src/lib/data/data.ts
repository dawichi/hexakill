import { writable, type Writable } from 'svelte/store'
import type { GameDTO } from '$lib/types/Game.dto'
import type { LoggerDTO } from '$lib/types/Logger.dto'
import type { EnemyHistory } from '$lib/types/EnemyHistory.dto'

export const gameData: Writable<GameDTO> = writable({
    view: 'welcome',
    username: '',
    characterIdx: -1,
    character: null,
    enemy: null,
})

export const logs: Writable<LoggerDTO> = writable({
    player: [],
    enemy: [],
})

export const enemiesHistory: Writable<EnemyHistory[]> = writable([])
