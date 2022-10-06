type Bonus = {
    attribute: 'health'|'potions'|'ad'|'ap'|'armor'|'mr'|'speed'
    bonus: number
}

function calcIncrement(upgrade: Bonus, tier: number): Bonus {
    upgrade.bonus*= 2**(tier-1)
    return upgrade
}

class Item {
    name: string
    image: string
    upgrade: Bonus
    tier: number

    constructor(upgrade: Bonus, name: string, tier: number) {
        this.name = name
        this.image = name.toLowerCase()
        this.tier = tier
        this.upgrade = calcIncrement(upgrade,tier)
    }
}

export default Item

