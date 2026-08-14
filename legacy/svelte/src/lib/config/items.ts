import type { Modifiers } from '$lib/types/Entities.dto'

type Item = {
    name: string
    price: number
    bonus: Modifiers
}

const base: Modifiers = {
    health: 0,
    ad: 0,
    ap: 0,
    armor: 0,
    mr: 0,
    speed: 0,
}

/**
 * Items available for use in the game.
 */
export const items: Item[] = [
    {
        name: 'Orb',
        price: 500,
        bonus: {
            ...base,
            health: 1000,
        },
    },
    {
        name: 'Sword',
        price: 900,
        bonus: {
            ...base,
            ad: 200,
            speed: 50,
        },
    },
    {
        name: 'Wand',
        price: 2000,
        bonus: {
            ...base,
            ap: 500,
        },
    },
]
