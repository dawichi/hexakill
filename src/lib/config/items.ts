import type { Modifiers } from '$lib/types/Entities.dto'

type ItemDef = {
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
const itemsDefinition: Record<number, ItemDef> = {
    1: {
        name: 'Orb',
        price: 300,
        bonus: {
            ...base,
            ap: 50,
        },
    },
    2: {
        name: 'Orb',
        price: 500,
        bonus: {
            ...base,
            ap: 100,
        },
    },
    3: {
        name: 'Orb',
        price: 800,
        bonus: {
            ...base,
            ap: 200,
            speed: 50,
        },
    },
    4: {
        name: 'Orb',
        price: 1200,
        bonus: {
            ...base,
            health: 2000,
            ap: 200,
            speed: 50,
        },
    },
}

interface Item extends ItemDef {
    id: number
}
export const items: Item[] = Object.entries(itemsDefinition).map(([id, item]) => ({
    id: Number(id),
    ...item,
}))
