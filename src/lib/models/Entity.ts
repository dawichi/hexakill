import utils from '$lib/services/utils.service'
import { base, info } from './config'

export abstract class BaseEntityModel {
    name: string
    image = ''
    size = 'w-64 h-64'
    level: number
    exp = 0
    health: number
    dmgReceived = 0
    ad: number
    ap: number
    armor: number
    mr: number
    speed: number
    potions = 5
    gold = 2000

    constructor(level: number, name: string) {
        this.name = name
        this.level = level
        this.health = level * base.health
        this.ad = level * base.ad
        this.ap = level * base.ap
        this.armor = level * base.armor
        this.mr = level * base.mr
        this.speed = level * base.speed
    }

    /**
     * ## Apply the damage to the entity, not showing negative health
     * @param damage damage to apply
     */
    private _getDamage(damage: number): number {
        this.dmgReceived += damage
        // If dies, HP counter shows 0 HP, not negative HP
        if (this.dmgReceived > this.health) this.dmgReceived = this.health
        return damage
    }

    receiveAttack(damage: number): number {
        return this._getDamage(utils.calcDmgReduction(damage, this.armor))
    }

    receiveMagic(damage: number): number {
        return this._getDamage(utils.calcDmgReduction(damage, this.mr))
    }

    /**
     * ## Calculate damage
     * 1. Gets a random damage between a range
     * 2. Calcs if the action is a critic or a miss
     * @param min_hit min hit
     * @param max_hit max hit
     * @param critic_chance critic chance
     * @param misses_chance misses chance
     * @returns damage done
     */
    private _calculateDamage(min_hit: number, max_hit: number, critic_chance: number, misses_chance: number) {
        // Calc damage between the range
        const damage = utils.numberBetween(min_hit, max_hit)

        // Calc the chances
        const chances = Math.random()
        const critic = chances > critic_chance
        const misses = chances < misses_chance

        // return the correct damage done
        if (misses) return 0
        if (critic) return damage * 2
        return damage
    }

    /**
     * ## Executes a physic attack
     * @returns damage that the attack does
     */
    attack(): number {
        return this._calculateDamage(this.ad * info.ad_hit_range[0], this.ad * info.ad_hit_range[1], info.ad_critic_chance, info.ad_misses_chance)
    }

    /**
     * ## Executes a magic hit
     * @returns damage that the magic does
     */
    magic(): number {
        return this._calculateDamage(this.ap * info.ap_hit_range[0], this.ap * info.ap_hit_range[1], info.ap_critic_chance, info.ap_misses_chance)
    }

    /**
     * ## Use a potion to heal
     * @returns the health healed
     */
    heal(): number {
        this.potions -= 1
        const heal = utils.numberBetween(this.dmgReceived * info.heal_range[0], this.dmgReceived * info.heal_range[0])
        this.dmgReceived -= heal
        if (this.dmgReceived < 0) this.dmgReceived = 0
        return heal
    }
}
