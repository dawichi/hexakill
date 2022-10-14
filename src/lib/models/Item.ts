import type { Modifiers } from '$lib/types/Entities.dto'

class Item {
    id: number
    name: string
    image: string
    price: number
    bonus: Modifiers

    constructor(id: number, name: string, price: number, bonus: Modifiers) {
        this.id = id
        this.name = name
        this.image = name.replaceAll(' ', '-').toLowerCase()
        this.price = price
        this.bonus = bonus
    }
}

export default Item
