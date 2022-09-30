type Powerup = {
    title: string
    icon: string
    style: string
    type: 'health' | 'ad' | 'ap' | 'speed'
    value: number
}

/**
 * ## Powerups definitions
 */
export const powerups: Powerup[] = [
    {
        title: 'Health',
        icon: 'ant-design:heart-filled',
        style: 'text-green-400',
        type: 'health',
        value: 500,
    },
    {
        title: 'Attack Damage',
        icon: 'akar-icons:double-sword',
        style: 'text-red-400',
        type: 'ad',
        value: 40,
    },
    {
        title: 'Ability Power',
        icon: 'game-icons:pointy-hat',
        style: 'text-blue-400',
        type: 'ap',
        value: 50,
    },
    {
        title: 'Speed',
        icon: 'game-icons:boots',
        style: 'text-cyan-400',
        type: 'speed',
        value: 10,
    },
]

/**
 * ## Get Powerup Prop
 * Get the powerup[prop] from the powerup.type
 * @param type powerup.type
 * @param prop powerup[prop] wanted
 */
export const getPowerupProp = (type: string, prop: keyof Powerup): string | number => {
    return powerups.find(p => p.type === type)?.[prop] ?? ''
}
