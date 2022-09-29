type DamageLog = {
    title: string,
    damage?: number,
    icon?: string,
}

type GeneralLog = {
    title: string,
    message?: string,
}

export type LoggerDTO = {
    player: DamageLog[] | GeneralLog[],
    enemy: DamageLog[] | GeneralLog[],
}