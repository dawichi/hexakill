import { writable, type Writable } from 'svelte/store'
import type { GameDTO } from '$lib/types/Game.dto'
import { items } from '$lib/config/items'
import { ItemModel } from '$lib/models'

export const gameData: Writable<GameDTO> = writable({
    view: 'welcome',
    username: '',
    characterIdx: -1,
    character: null,
    enemy: null,
    shop: {
        potions: [
            {
                name: 'Potion',
                quantity: 1,
                price: 100,
            },
            {
                name: '5 Potions pack',
                quantity: 5,
                price: 400,
            },
        ],
        items: items.map(item => new ItemModel(item.name, item.price, item.bonus)),
    },
    showUI: {
        fighting: false,
        actionBtns: true,
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
