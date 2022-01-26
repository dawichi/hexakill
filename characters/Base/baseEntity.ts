class BaseEntity {
    name: string
    level: number

    constructor(name: string, level: number = 1) {
        this.name = name
        this.level = level
    }
}

export default BaseEntity
