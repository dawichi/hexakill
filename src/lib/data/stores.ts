import { writable } from 'svelte/store'

export const playing = writable(false)
export const character = writable(false)

export const player = writable({
    name: '',
    character: 0,
})
