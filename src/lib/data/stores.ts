import { writable, type Writable } from 'svelte/store'
import type { Game } from '$lib/types/Game'

export const gameData: Writable<Game> = writable({
    step: 'starting',
    username: '',
    characterIdx: -1,
    character: null,
    enemy: null,
})
