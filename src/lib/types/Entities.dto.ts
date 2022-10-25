export type Stats = 'health' | 'ad' | 'ap' | 'armor' | 'mr' | 'speed'

export type Modifiers = {
    [key in Stats]: number
}

export type CharacterConfigDto = {
    name: string
    data: {
        desc: string
        subDesc: string
        shadow: string
        color: 'blue' | 'red' | 'lime'
        bg: string
    }
    modifiers: Modifiers
}

export type EnemyConfigDto = {
    name: string
    size: string
    modifiers: Modifiers
}
