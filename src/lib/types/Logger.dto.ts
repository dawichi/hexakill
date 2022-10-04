export type LogDTO = {
    title: string
    message: string
    value?: number
    icon?: string
}

export type LoggerDTO = {
    player: LogDTO[]
    enemy: LogDTO[]
}
