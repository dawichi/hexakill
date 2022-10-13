import { writable, type Writable } from 'svelte/store'
import type { GameDTO } from '$lib/types/Game.dto'
import { items } from '$lib/config/items'
import { Item } from '$lib/models'

export const gameData: Writable<GameDTO> = writable({
    view: 'welcome',
    username: '',
    characterIdx: -1,
    character: null,
    enemy: null,
    shop: {
        items: items.map(item => new Item(item.name, item.price, item.bonus)),
    },
    showUI: {
        fighting: false,
        actionBtns: true
    },
    logs: {
        player: [],
        enemy: [],
    },
    powerUps: {
        pending: 0,
        history: {},
    },
    enemiesHistory: [],
})
