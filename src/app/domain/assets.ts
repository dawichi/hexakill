export const AUDIO_ASSETS = {
  music: {
    welcome: '/music/welcome.mp3',
    characterSelect: '/music/champSelect.mp3',
    dungeon: '/music/dungeon.mp3',
    store: '/music/store.mp3',
    boss: '/music/boss.mp3',
  },
  sounds: {
    attack: '/sounds/attack.mp3',
    magic: '/sounds/magic.mp3',
    guard: '/sounds/potion.mp3',
    miss: '/sounds/error.mp3',
    coin: '/sounds/coin.mp3',
    enemyKilled: '/sounds/enemy_killed.mp3',
    error: '/sounds/error.mp3',
    levelUp: '/sounds/levelup.mp3',
    potion: '/sounds/potion.mp3',
  },
} as const;

export type MusicTrack = keyof typeof AUDIO_ASSETS.music;
export type SoundEffect = keyof typeof AUDIO_ASSETS.sounds;
