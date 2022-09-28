import type { Game } from '$lib/types/Game'
import { writable, type Writable } from 'svelte/store'

export const gameData: Writable<Game> = writable({
    playing: true,
    username: '',
    character: -1,
})
