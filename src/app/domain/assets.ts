import { CharacterId, SpriteStripAsset } from './game-types';

export const ASSET_MANIFEST = {
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
    coin: '/sounds/coin.mp3',
    enemyKilled: '/sounds/enemy_killed.mp3',
    error: '/sounds/error.mp3',
    levelUp: '/sounds/levelup.mp3',
    potion: '/sounds/potion.wav',
  },
  items: {
    orb: '/images/items/orb.png',
    sword: '/images/items/sword.png',
    wand: '/images/items/wand.png',
  },
} as const;

/**
 * Provisional single-row player action strips. The original files are retained
 * historical art; the dimensions describe the observed files, not a product
 * decision about the final combat animation language.
 */
export const PLAYER_ACTION_ASSETS: Readonly<Partial<Record<CharacterId, SpriteStripAsset>>> = {
  wizard: {
    src: '/images/wizard/sprites/Attack1.png',
    frameWidth: 231,
    frameHeight: 190,
    frameCount: 8,
  },
  samurai: {
    src: '/images/samurai/Sprites/Attack1.png',
    frameWidth: 200,
    frameHeight: 200,
    frameCount: 6,
  },
};
