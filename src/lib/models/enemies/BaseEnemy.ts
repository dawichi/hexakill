import { BaseEntity } from '..'

export class Enemy extends BaseEntity {
    constructor(level: number, name: string) {
        super(level, name)
        this.size = 'w-full h-full'
    }
}

export default Enemy
