import { Enemy } from '..'
import { config } from '..'

const base = config.base

// ╔══════════════════════════════════════════════════════
// ║ +: health*, mr, ap
// ╠══════════════════════════════════════════════════════
// ║ -: ad, armor*, speed
// ╚══════════════════════════════════════════════════════
export class EvilTree extends Enemy {
    constructor(level = 1, name = 'EVIL TREE') {
        super(level, name)
        this.image = 'evil-tree'
        this.size = 'w-48 h-48'
        // + buff
        this.health = level * (base.health * 1.5)
        this.mr = level * (base.mr * 1.25)
        this.ap = level * (base.ap * 1.25)
        // - nerf
        this.ad = level * (base.ad * 0.75)
        this.speed = level * (base.speed * 0.75)
        this.armor = level * (base.armor * 0.5)
    }
}

export default EvilTree
