import { CharacterDefinition, CharacterId, PlayerState, Stats } from './game-types';

export const BASE_STATS: Stats = {
  health: 200,
  ad: 16,
  ap: 20,
  armor: 12,
  mr: 12,
  speed: 4,
};

export const CHARACTER_DEFINITIONS: readonly CharacterDefinition[] = [
  {
    id: 'wizard',
    name: 'Wizard',
    description: 'Destroy enemies with explosive magic.',
    weakness: 'Weak in close combat.',
    modifiers: { health: 1, ad: 0.5, ap: 2, armor: 0.5, mr: 0.75, speed: 1.25 },
    accent: 'blue',
    idleAsset: '/images/wizard/idle.gif',
  },
  {
    id: 'samurai',
    name: 'Samurai',
    description: 'Master the sword and strike first.',
    weakness: 'Weak against magic.',
    modifiers: { health: 0.75, ad: 2, ap: 0.5, armor: 0.75, mr: 0.5, speed: 1.5 },
    accent: 'red',
    idleAsset: '/images/samurai/idle.gif',
  },
  {
    id: 'warrior',
    name: 'Warrior',
    description: 'A durable fighter built to survive.',
    weakness: 'Slow and low damage.',
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
    level: 4,
    experience: 0,
    stats: { ...BASE_STATS },
    potions: 5,
    gold: 2000,
    inventory: [],
    powerUps: { pending: 0, history: { health: 0, ad: 0, ap: 0, speed: 0 } },
    bossesDefeated: 0,
  };
}
