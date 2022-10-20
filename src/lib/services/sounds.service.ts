type AvailableSounds = 'coin' | 'error' | 'attack' | 'magic' | 'potion' | 'levelup' | 'enemyKilled'

/**
 * Sounds used in the game.
 */
class Sounds {
   private readonly coin = '/sounds/coin.mp3'
   private readonly error = '/sounds/error.mp3'
   private readonly attack = '/sounds/attack.mp3'
   private readonly magic = '/sounds/magic.mp3'
   private readonly potion = '/sounds/potion.wav'
   private readonly levelup = '/sounds/levelup.mp3'
   private readonly enemyKilled = '/sounds/enemy_killed.mp3'

   /**
    * ## Play a sound
    * @param soundKey - The key of the sound to play.
    */
    public play(soundKey: AvailableSounds): void {
        const sound = new Audio(this[soundKey])
        sound.volume = 0.5
        sound.play()
   }
}

export default new Sounds()
