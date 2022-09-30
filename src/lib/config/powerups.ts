type Powerup = {
    title: string
    icon: string
    style: string
    type: 'ad' | 'ap' | 'speed'
    value: number
}

export const powerups: Powerup[] = [
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