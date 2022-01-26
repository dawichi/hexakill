import BaseEntity from '../Base/baseEntity'

const stats = {
	dmgRecieved: 0,
	health: 200,
	ability_power: 20,
	attack_damage: 20,
	critical_hit: 20,
	magic_resist: 20,
	armor: 20,
	movement_speed: 2,
	luck: 20,
}

class Alex extends BaseEntity {
	dmgRecieved: number
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
		this.dmgRecieved = 0
		this.health = 200
		this.ability_power = 20
		this.attack_damage = 20
		this.critical_hit = 20
		this.magic_resist = 20
		this.armor = 20
		this.movement_speed = 2
		this.luck = 20
    }

	upLevel() {
		this.level++

		const props_updates = [
			{
				stat: 'health',
				increment: 40
			},			{
				stat: 'ability_power',
				increment: 5
			},			{
				stat: 'attack_damage',
				increment: 5
			},			{
				stat: 'critical_hit',
				increment: 5
			},			{
				stat: 'magic_resist',
				increment: 5
			},			{
				stat: 'armor',
				increment: 5
			},			{
				stat: 'movement_speed',
				increment: 5
			},			{
				stat: 'luck',
				increment: 1
			},
		]

		props_updates.forEach(prop => this[prop.stat] = this[prop.stat] + prop.increment)
	}

	getDamage(damage: number) {
		this.dmgRecieved += damage
	}

    passive() {}

    attack() {}

    defend() {}

    skillshot() {}

    ultimate() {}
}

export default Alex
