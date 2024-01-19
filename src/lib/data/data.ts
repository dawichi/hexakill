import { writable, type Writable } from 'svelte/store'
import type { GameDTO } from '$lib/types/Game.dto'
import { items } from '$lib/config/items'
import { ItemModel } from '$lib/models'

/**
 * ## Contexts
 * 
 * Contexts (sveltekit's stores) are used to store data that is used in multiple places.
 * When the data is updated, all the places that use it are updated too.
 * 
 * The contexts are divided in multiple `writable` stores, so if only one of them is updated, it do not trigger updates to the others.
 */
export const volume = writable({
    musicVolume: 0.05,
    effectsVolume: 0.2,
})

export const gameData: Writable<GameDTO> = writable({
    view: 'welcome',
    username: '',
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


