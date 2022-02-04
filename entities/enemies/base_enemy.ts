import { Base_Entity } from '..'

export class Enemy extends Base_Entity {
    constructor(level: number, name: string) {
        super(level, name)
        this.size = 'w-full h-full'
    }
}

export default Enemy
