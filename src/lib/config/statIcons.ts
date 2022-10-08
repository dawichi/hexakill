import type { BaseEntity } from '$lib/models'

type StatIcon = {
    stat: keyof BaseEntity
    name: string
    icon: string
    style: string
}

/**
 * Icons to display the entity stats.
 */
export const StatIcons: Array<StatIcon> = [
    {
        stat: 'ad',
        name: 'Attack Damage',
        icon: 'akar-icons:double-sword',
        style: 'text-red-400',
    },
    {
        stat: 'ap',
        name: 'Ability Power',
        icon: 'game-icons:pointy-hat',
        style: 'text-blue-400',
    },
    {
        stat: 'armor',
        name: 'Armor',
        icon: 'game-icons:abdominal-armor',
        style: 'text-amber-400',
    },
    {
        stat: 'mr',
        name: 'Magic Resist',
        icon: 'game-icons:magic-shield',
        style: 'text-fuchsia-400',
    },
    {
        stat: 'speed',
        name: 'Movement Speed',
        icon: 'game-icons:boots',
        style: 'text-cyan-400',
    },
    {
        stat: 'potions',
        name: 'Potions',
        icon: 'game-icons:health-potion',
        style: 'text-red-500',
    },
]
