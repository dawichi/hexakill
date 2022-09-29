type DamageLog = {
    title: string,
    message: string,
    value?: number,
    icon?: string,
}

type GeneralLog = {
    title: string,
    message: string,
}

export type LoggerDTO = {
    player: DamageLog[] | GeneralLog[],
    enemy: DamageLog[] | GeneralLog[],
}