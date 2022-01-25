import BaseEntity from '../Base/baseEntity'

const stats = {
	health: 200,
	ability_power: 20,
	attack_damage: 20,
	critical_hit: 20,
	magic_resist: 20,
	armor: 20,
	movement_speed: 2,
	luck: 20,
}

class Bruno extends BaseEntity {
	health: number
	ability_power: number
	attack_damage: number
	critical_hit: number
	magic_resist: number
	armor: number
	movement_speed: number
	luck: number

    constructor(name: string, level: number) {
        super(name, level)
		this.health = stats.health + (this.level - 1) * 0.1 * stats.health
		this.ability_power = stats.ability_power + (this.level - 1) * 0.1 * stats.ability_power
		this.attack_damage = stats.attack_damage + (this.level - 1) * 0.1 * stats.attack_damage
		this.critical_hit = stats.critical_hit + (this.level - 1) * 0.1 * stats.critical_hit
		this.magic_resist = stats.magic_resist + (this.level - 1) * 0.1 * stats.magic_resist
		this.armor = stats.armor + (this.level - 1) * 0.1 * stats.armor
		this.movement_speed = stats.movement_speed + (this.level - 1) * 0.1 * stats.movement_speed
		this.luck = stats.luck + (this.level - 1) * 0.1 * stats.luck
    }

    passive() {}

    attack() {}

    defend() {}

    skillshot() {}

    ultimate() {}
}

export default Bruno
