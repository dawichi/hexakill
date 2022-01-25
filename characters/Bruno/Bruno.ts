import BaseEntity, { Stats } from '../Base/baseEntity'

class Bruno extends BaseEntity {
    constructor(name: string, stats: Stats) {
        super(name, stats)
    }

    passive() {}

    attack() {}

    defend() {}

    skillshot() {}

    ultimate() {}
}

export default Bruno
