import BaseEntity from '../Base/baseEntity'

class Bruno extends BaseEntity {
    dmgRecieved: number
    health: number
    ability_power: number
    attack_damage: number
    critical_hit: number
    magic_resist: number
    armor: number
    movement_speed: number
    luck: number
	image: string

    constructor(name: string, level: number = 1) {
        super(name, level)
        this.dmgRecieved = 0
        this.health = 200
        this.ability_power = 60
        this.attack_damage = 40
        this.critical_hit = 5
        this.magic_resist = 25
        this.armor = 25
        this.movement_speed = 2
        this.luck = 5
		this.image = '/images/slime-green/attack.gif'
    }

    upLevel() {
		if (this.level >= 18){
			return 
		}
        
		this.level++

        // TODO: make a random range in increments
        const props_updates = [
            {
                stat: 'health',
                increment: 40,
            },
            {
                stat: 'ability_power',
                increment: 20,
            },
            {
                stat: 'attack_damage',
                increment: 20,
            },
            {
                stat: 'critical_hit',
                increment: 1,
            },
            {
                stat: 'magic_resist',
                increment: 10,
            },
            {
                stat: 'armor',
                increment: 10,
            },
            {
                stat: 'movement_speed',
                increment: 3,
            },
            {
                stat: 'luck',
                increment: 1,
            },
        ]

        props_updates.forEach(prop => (this[prop.stat] += parseInt((Math.log2(prop.increment*this.level)/Math.log2(5)).toFixed(1))))
    }	

    getDamage(damage: number) {
		if  (this.dmgRecieved + damage >= this.health){
			this.dmgRecieved = this.health
		}
		if (this.dmgRecieved + damage <= 0){
			this.dmgRecieved = 0
		}
		else{
			this.dmgRecieved += damage
		}     
    }

    passive() {}

    attack() {
        
    }

    defend() {
        console.log('defend')
    }

    skillshot() {
        console.log('skillshot')
    }

    ultimate() {
        console.log('ultimate')
    }
}

export default Bruno
