import { volume } from '$lib/data/data'

// The volume of the sound effects
let effectsVolume: number
volume.subscribe(n => (effectsVolume = n.effectsVolume))

/**
 * Sounds used in the game.
 */
class Sounds {
    private readonly sounds = {
        coin: '/sounds/coin.mp3',
        error: '/sounds/error.mp3',
        attack: '/sounds/attack.mp3',
        magic: '/sounds/magic.mp3',
        potion: '/sounds/potion.wav',
        levelup: '/sounds/levelup.mp3',
        enemyKilled: '/sounds/enemy_killed.mp3',
    }

    /**
     * ## Play a sound
     * @param soundKey - The key of the sound to play.
     */
    public play(soundKey: keyof typeof this.sounds): void {
        const sound = new Audio(this.sounds[soundKey])
        sound.volume = effectsVolume
        sound.play()
    }
}

export default new Sounds()
