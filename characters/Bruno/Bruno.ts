import BaseEntity from '../Base/baseEntity'

interface playerStat {
	value : number,
	increment: number,
	level: number
}

const props = ['health', 'ability_power', 'attack_damage', 'critical_hit', 'magic_resist', 'armor', 'movement_speed', 'luck']

class Bruno extends BaseEntity {
    dmgRecieved: number
    health: playerStat
    ability_power: playerStat
    attack_damage: playerStat
    critical_hit: playerStat
    magic_resist: playerStat
    armor: playerStat
    movement_speed: playerStat
    luck: playerStat
	image: string

    constructor(name: string, level: number = 1) {
        super(name, level)
        this.dmgRecieved = 0
        this.health = {
			value : 200,
			increment: 40,
			level: 0
		}
        this.ability_power = {
			value : 60,
			increment: 20,
			level: 0
		}
        this.attack_damage = {
			value : 40,
			increment: 20,
			level: 0
		}
        this.critical_hit = {
			value : 5,
			increment: 1,
			level: 0
		}
        this.magic_resist = {
			value : 25,
			increment: 10,
			level: 0
		}
        this.armor = {
			value : 25,
			increment: 10,
			level: 0
		}
        this.movement_speed = {
			value : 2,
			increment: 3,
			level: 0
		}
        this.luck = {
			value : 5,
			increment: 1,
			level: 0
		}
		this.image = '/images/slime-green/attack.gif'
    }

    upLevel() {
		if (this.level < 18){ 
			this.level++

			props.forEach(prop => {
				this[prop].value += parseInt((Math.log2(this[prop].increment*this.level)/Math.log2(5)).toFixed(1))
			})
		}
    }	

	upSkill(prop: string){
		if (this[prop].level < 3){
			this[prop].value += this[prop].increment*(this[prop].level+1)*2
			this[prop].level += 1
		}	
	}

    getDamage(damage: number) {
		if  (this.dmgRecieved + damage >= this.health.value){
			this.dmgRecieved = this.health.value
		}
		else if (this.dmgRecieved + damage <= 0){
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
