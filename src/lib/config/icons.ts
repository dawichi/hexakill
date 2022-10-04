import type { BaseEntity } from "$lib/models"

type Icon = {
    stat: keyof BaseEntity
    name: string
    style: string
}

/**
 * Icons to display the entity stats.
 */
export const icons: Array<Icon> = [
    {
        stat: 'ad',
        name: 'akar-icons:double-sword',
        style: 'text-red-400',
    },
    {
        stat: 'ap',
        name: 'game-icons:pointy-hat',
        style: 'text-blue-400',
    },
    {
        stat: 'armor',
        name: 'game-icons:abdominal-armor',
        style: 'text-amber-400',
    },
    {
        stat: 'mr',
        name: 'game-icons:magic-shield',
        style: 'text-fuchsia-400',
    },
    {
        stat: 'speed',
        name: 'game-icons:boots',
        style: 'text-cyan-400',
    },
    {
        stat: 'potions',
        name: 'game-icons:health-potion',
        style: 'text-red-500',
    }
]
