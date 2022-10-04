type Character = {
    name: 'Wizard' | 'Samurai' | 'Warrior'
    imgPath: string
    bg: string
    desc: string
    subDesc: string
    size: string
    shadow: string
    color: 'indigo' | 'red' | 'amber'
}

/**
 * Characters available for use in the game.
 */
export const characters: Character[] = [
    {
        name: 'Wizard',
        imgPath: 'wizard',
        bg: 'bg-indigo-700/50',
        desc: 'Destroy with explosions',
        subDesc: 'weak vs AD',
        size: 'w-24 h-36',
        shadow: 'shadow-lg shadow-indigo-400',
        color: 'indigo',
    },
    {
        name: 'Samurai',
        imgPath: 'samurai',
        bg: 'bg-red-700/50',
        desc: 'The power of pure AD',
        subDesc: 'weak vs AP',
        size: 'h-36',
        shadow: 'shadow-lg shadow-red-400',
        color: 'red',
    },
    {
        name: 'Warrior',
        imgPath: 'warrior',
        bg: 'bg-amber-600/50',
        desc: 'One-shots are not for him',
        subDesc: 'low damage',
        size: 'w-36 h-36',
        shadow: 'shadow-lg shadow-amber-400',
        color: 'amber',
    },
]
