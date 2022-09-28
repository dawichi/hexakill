import { writable, type Writable } from 'svelte/store'

export const playing: Writable<boolean> = writable(false)
