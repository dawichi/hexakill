import type { EnemyConfigDto, Modifiers } from '$lib/types/Entities.dto'

const base: Modifiers = {
    health: 1,
    ad: 1,
    ap: 1,
    armor: 1,
    mr: 1,
    speed: 1,
}

const presets: {[key: string]: Modifiers} = {
    basic: base,
    ad: {
        ...base,
        health: 0.75,
        ad: 1.75,
        ap: 0.5,
        speed: 1.75,
    },
    ap: {
        ...base,
        ad: 0.5,
        ap: 1.75,
    },
    tank: {
        ...base,
        health: 1.75,
        armor: 1.75,
        mr: 1.75,
        speed: 0.75,
    },
    boss: {
        health: 2,
        ad: 2,
        ap: 2,
        armor: 2,
        mr: 2,
        speed: 2,
    },
}

/**
 * Enemies available in the game.
 */
export const enemies: EnemyConfigDto[] = [
    {
        name: 'Adventurer',
        size: 'w-48 h-48',
        modifiers: presets.easy,
    },
    {
        name: 'Archer',
        size: 'w-48 h-48',
        modifiers: presets.ad,
    },
    {
        name: 'Armored huntress',
        size: 'w-64 h-48',
        modifiers: presets.tank,
    },
    {
        name: 'Bringer of death',
        size: 'w-48 h-48',
        modifiers: presets.boss,
    },
    {
        name: 'Evil tree',
        size: 'w-48 h-48',
        modifiers: presets.ap,
    },
    {
        name: 'Evil Wizard',
        size: 'w-64 h-64',
        modifiers: presets.ap,
    },
    {
        name: 'Fire knight',
        size: 'w-64 h-64',
        modifiers: presets.tank,
    },
    {
        name: 'Fire worm',
        size: 'w-64 h-64',
        modifiers: presets.ap,
    },
    {
        name: 'Knight',
        size: 'w-64 h-64',
        modifiers: presets.tank,
    },
    {
        name: 'Martial Hero',
        size: 'w-64 h-64',
        modifiers: presets.ad,
    },
    {
        name: 'Slime Blue',
        size: 'w-36 h-36',
        modifiers: presets.basic,
    },
    {
        name: 'Slime Red',
        size: 'w-36 h-36',
        modifiers: presets.basic,
    },
    {
        name: 'Slime Green',
        size: 'w-36 h-36',
        modifiers: presets.basic,
    },
    {
        name: 'Slime Purple',
        size: 'w-36 h-36',
        modifiers: presets.ap,
    },
    {
        name: 'Slime Gold',
        size: 'w-36 h-36',
        modifiers: presets.boss,
    },
    {
        name: 'Water Priestess',
        size: 'w-64 h-64',
        modifiers: presets.ap,
    },
    {
        name: 'Wild Huntress',
        size: 'w-48 h-48',
        modifiers: presets.ad, 
    },
    {
        name: 'Witch Blue',
        size: 'w-36 h-36',
        modifiers: presets.ap,
    },
]
