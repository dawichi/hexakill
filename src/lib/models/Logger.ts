type GeneralLog = {
    type: 'new-enemy'
    data: string[]
}

type PlayerLog = {
    type: 'new-enemy'
    data: string[]
}

type EnemyLog = {
    type: 'new-enemy'
    data: string[]
}

export class Logger {
    general: GeneralLog[] = []
    player: PlayerLog[] = []
    enemy: EnemyLog[] = []
}