import type { Enemy } from "$lib/models"

type Icon = {
    stat: keyof Enemy
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
        name: 'bxs:shield-alt-2',
        style: 'text-fuchsia-400',
    },
    {
        stat: 'speed',
        name: 'game-icons:boots',
        style: 'text-cyan-400',
    },
]
