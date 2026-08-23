import { CharacterDefinition, CharacterId, PlayerState, Stats } from './game-types';
import {
  PLAYER_ACTION_ASSETS,
  PLAYER_DEFEAT_ASSETS,
  PLAYER_HIT_ASSETS,
  PLAYER_IDLE_ASSETS,
  PLAYER_MAGIC_ASSETS,
} from './assets';

export const BASE_STATS: Stats = {
  health: 200,
  ad: 16,
  ap: 20,
  armor: 12,
  mr: 12,
  speed: 4,
};

export const INITIAL_PLAYER_LEVEL = 4;

function statsAtLevel(level: number): Stats {
  const stats = { ...BASE_STATS };

  (Object.keys(BASE_STATS) as (keyof Stats)[]).forEach((stat) => {
    stats[stat] = BASE_STATS[stat] * level;
  });

  return stats;
}

export const CHARACTER_DEFINITIONS: readonly CharacterDefinition[] = [
  {
    id: 'wizard',
    name: 'Wizard',
    description: 'Destroy enemies with explosive magic.',
    modifiers: { health: 1, ad: 0.5, ap: 2, armor: 0.5, mr: 0.75, speed: 1.25 },
    accent: 'blue',
    idleAsset: '/images/wizard/idle.gif',
    idleSpriteAsset: PLAYER_IDLE_ASSETS.wizard,
    actionAsset: PLAYER_ACTION_ASSETS.wizard,
    magicAsset: PLAYER_MAGIC_ASSETS.wizard,
    hitAsset: PLAYER_HIT_ASSETS.wizard,
    defeatAsset: PLAYER_DEFEAT_ASSETS.wizard,
  },
  {
    id: 'samurai',
    name: 'Samurai',
    description: 'Master the sword and strike first.',
    modifiers: { health: 0.75, ad: 2, ap: 0.5, armor: 0.75, mr: 0.5, speed: 1.5 },
    accent: 'red',
    idleAsset: '/images/samurai/idle.gif',
    idleSpriteAsset: PLAYER_IDLE_ASSETS.samurai,
    actionAsset: PLAYER_ACTION_ASSETS.samurai,
    magicAsset: PLAYER_MAGIC_ASSETS.samurai,
    hitAsset: PLAYER_HIT_ASSETS.samurai,
    defeatAsset: PLAYER_DEFEAT_ASSETS.samurai,
  },
  {
    id: 'warrior',
    name: 'Warrior',
    description: 'A durable fighter built to survive.',
    modifiers: { health: 1.75, ad: 0.5, ap: 0.5, armor: 1.5, mr: 1.25, speed: 0.5 },
    accent: 'amber',
    idleAsset: '/images/warrior/idle.gif',
  },
];

export function findCharacter(id: CharacterId): CharacterDefinition {
  const character = CHARACTER_DEFINITIONS.find((candidate) => candidate.id === id);

  if (!character) {
    throw new Error(`Unknown character: ${id}`);
  }

  return character;
}

export function createInitialPlayer(name: string, character: CharacterDefinition): PlayerState {
  return {
    name,
    character,
    level: INITIAL_PLAYER_LEVEL,
    experience: 0,
    stats: statsAtLevel(INITIAL_PLAYER_LEVEL),
    potions: 5,
    gold: 2000,
    inventory: [],
    relicCharges: {},
    powerUps: { pending: 0, history: { health: 0, ad: 0, ap: 0, speed: 0 } },
    bossesDefeated: 0,
    defeatedEnemies: [],
  };
}
