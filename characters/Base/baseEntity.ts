export interface Stats {
    ability_power: number
    attack_damage: number

    magic_resist: number
    armor: number

    movement_speed: number
}

class BaseEntity {
    name: string
    stats: Stats

    constructor(name: string, stats: Stats) {
        this.name = name
        this.stats = stats
    }
}

export default BaseEntity
