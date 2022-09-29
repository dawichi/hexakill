import { writable, type Writable } from 'svelte/store'
import type { Game } from '$lib/types/Game'
import type { Logger } from '$lib/types/Logger'

export const gameData: Writable<Game> = writable({
    step: 'starting',
    username: '',
    characterIdx: -1,
    character: null,
    enemy: null,
})

export const logs: Writable<Logger> = writable({
    player: [],
    general: [],
    enemy: [],
})
