import type { Modifiers } from '$lib/types/Entities.dto'

export class ItemModel {
    name: string
    image: string
    price: number
    bonus: Modifiers

    constructor(name: string, price: number, bonus: Modifiers) {
        this.name = name
        this.image = name.replaceAll(' ', '-').toLowerCase()
        this.price = price
        this.bonus = bonus
    }
}
