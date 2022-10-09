import { calcDmgReduction } from '$lib/utils/calcDmgReduction'
import { numberBetween } from '$lib/utils/numberBetween'
import { config } from '.'

const base = config.base

abstract class BaseEntity {
    name: string
    level: number
    size: string
    image: string
    dmgReceived: number
    health: number
    potions: number
    ad: number
    ap: number
    armor: number
    mr: number
    speed: number
    readonly data: {
        ad_critic_chance: number
        ad_misses_chance: number
        ad_hit_range: [number, number]
        ap_critic_chance: number
        ap_misses_chance: number
        ap_hit_range: [number, number]
        heal_range: [number, number]
    }

    constructor(level: number, name: string) {
        this.name = name
        this.level = level
        this.size = 'w-full h-full'
        this.image = ''
        this.dmgReceived = 0
        this.health = level * base.health
        this.potions = 5
        this.ad = level * base.ad
        this.ap = level * base.ap
        this.armor = level * base.armor
        this.mr = level * base.mr
        this.speed = level * base.speed
        this.data = {
            ad_critic_chance: 0.9, // 10% top -> critic
            ad_misses_chance: 0.1, // 10% low -> misses
            ad_hit_range: [0.8, 1.4], // 80% - 140% ad
            ap_critic_chance: 0.6, // 40% top -> critic
            ap_misses_chance: 0.25, // 25% low -> misses
            ap_hit_range: [0.3, 2], // 30% - 200% ap
            heal_range: [0.2, 0.3], // 20% - 30% of damage received
        }
    }

    /**
     * Apply the damage to the entity, not showing negative health
     * @param damage damage to apply
     */
    private _getDamage(damage: number): number {
        this.dmgReceived += damage
        // If dies, HP counter shows 0 HP, not negative HP
        if (this.dmgReceived > this.health) this.dmgReceived = this.health
        return damage
    }

    receiveAttack(damage: number): number {
        return this._getDamage(calcDmgReduction(damage, this.armor))
    }

    receiveMagic(damage: number): number {
        return this._getDamage(calcDmgReduction(damage, this.mr))
    }

    /**
     * Action logic
     * 1. Gets a random damage between a range
     * 2. Calcs if the action is a critic or a miss
     * @param min_hit min hit
     * @param max_hit max hit
     * @param critic_chance critic chance
     * @param misses_chance misses chance
     * @returns damage done
     */
    private action(min_hit: number, max_hit: number, critic_chance: number, misses_chance: number) {
        // Calc damage between the range
        const damage = numberBetween(min_hit, max_hit)

        // Calc the chances
        const chances = Math.random()
        const critic = chances > critic_chance
        const misses = chances < misses_chance

        // return the correct damage done
        if (misses) return 0
        if (critic) return damage * 2
        return damage
    }

    attack() {
        return this.action(
            this.ad * this.data.ad_hit_range[0],
            this.ad * this.data.ad_hit_range[1],
            this.data.ad_critic_chance,
            this.data.ad_misses_chance,
        )
    }

    magic() {
        return this.action(
            this.ap * this.data.ap_hit_range[0],
            this.ap * this.data.ap_hit_range[1],
            this.data.ap_critic_chance,
            this.data.ap_misses_chance,
        )
    }

    heal() {
        this.potions -= 1
        const heal = numberBetween(
            this.dmgReceived * this.data.heal_range[0],
            this.dmgReceived * this.data.heal_range[0],
        )
        this.dmgReceived -= heal
        if (this.dmgReceived < 0) this.dmgReceived = 0
        return heal
    }
}

export default BaseEntity
