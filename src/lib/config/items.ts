import type { Modifiers } from '$lib/types/Entities.dto'

type ItemDTO = {
    name: string
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
export const items: ItemDTO[] = [
    {
        name: 'orb',
        bonus: {
            ...base,
            ap: 50,
        },
    },
]
