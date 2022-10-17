import type { CharacterConfigDto } from '$lib/types/Entities.dto'

/**
 * Characters available for use in the game.
 */
export const characters: CharacterConfigDto[] = [
    {
        name: 'Wizard',
        data: {
            desc: 'Destroy with explosions',
            subDesc: 'weak in close combat',
            shadow: 'shadow-lg shadow-indigo-400',
            color: 'indigo',
            bg: 'bg-indigo-700/50',
        },
        modifiers: {
            health: 1,
            ad: 0.5,
            ap: 2,
            armor: 0.5,
            mr: 0.75,
            speed: 1.25,
        },
    },
    {
        name: 'Samurai',
        data: {
            desc: 'The master of the sword',
            subDesc: 'weak against magic',
            shadow: 'shadow-lg shadow-red-400',
            color: 'red',
            bg: 'bg-red-700/50',
        },
        modifiers: {
            health: 0.75,
            ad: 2,
            ap: 0.5,
            armor: 0.75,
            mr: 0.5,
            speed: 1.5,
        },
    },
    {
        name: 'Warrior',
        data: {
            desc: 'Strongest man in the world',
            subDesc: 'slow and low damage',
            shadow: 'shadow-lg shadow-amber-400',
            color: 'amber',
            bg: 'bg-amber-700/50',
        },
        modifiers: {
            health: 1.75,
            ad: 0.5,
            ap: 0.5,
            armor: 1.5,
            mr: 1.25,
            speed: 0.5,
        },
    },
]
