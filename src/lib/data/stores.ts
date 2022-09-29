import { writable, type Writable } from 'svelte/store'
import type { Game } from '$lib/types/Game'
import type { LoggerDTO } from '$lib/types/Logger'

export const gameData: Writable<Game> = writable({
    step: 'welcome',
    username: '',
    characterIdx: -1,
    character: null,
    enemy: null,
})

export const logs: Writable<LoggerDTO> = writable({
    player: [],
    enemy: [],
})
