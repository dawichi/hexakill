import BaseEntity, { Stats } from '../Base/baseEntity'

class Alex extends BaseEntity {
    constructor(name: string, stats: Stats) {
        super(name, stats)
    }

    passive() {}

    attack() {}

    defend() {}

    skillshot() {}

    ultimate() {}
}

export default Alex
