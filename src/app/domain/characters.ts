import { CharacterId, CombatantSprites, Stats, scaleStats } from './game-types';

export const BASE_STATS: Stats = {
  health: 200,
  ad: 16,
  ap: 20,
  armor: 12,
  mr: 12,
  speed: 4,
};

export const STARTING_LEVEL = 4;
/** Character modifiers apply at half strength to the starting stats and in full on level-up. */
export const STARTING_MODIFIER_WEIGHT = 0.5;
export const STARTING_POTIONS = 5;
export const STARTING_GOLD = 2000;

export interface CharacterPassive {
  readonly name: string;
  readonly description: string;
}

export interface CharacterDefinition {
  readonly id: CharacterId;
  readonly name: string;
  readonly description: string;
  readonly passive: CharacterPassive;
  /** Per-level growth multipliers relative to BASE_STATS. */
  readonly modifiers: Stats;
  readonly accent: 'blue' | 'red' | 'amber';
  readonly sprites: CombatantSprites;
}

/** Wizard Magic ignores this share of the enemy's Magic resist. */
export const WIZARD_MAGIC_PENETRATION = 0.15;
/** Samurai Attacks gain this much critical chance, and the Samurai wins speed ties. */
export const SAMURAI_CRITICAL_BONUS = 0.2;
/** Warrior Guard grants this much more Block. */
export const WARRIOR_GUARD_MULTIPLIER = 1.5;
/** Share of the damage absorbed by the Warrior's Block that strikes back at the attacker. */
export const WARRIOR_RETALIATION = 0.15;

const strip = (src: string, frameWidth: number, frameHeight: number, frameCount: number) => ({
  src,
  frameWidth,
  frameHeight,
  frameCount,
});

export const CHARACTERS: readonly [CharacterDefinition, CharacterDefinition, CharacterDefinition] =
  [
    {
      id: 'wizard',
      name: 'Wizard',
      description: 'Fragile and fast, with devastating Magic.',
      passive: {
        name: 'Spellweaver',
        description: `Magic ignores ${WIZARD_MAGIC_PENETRATION * 100}% of the enemy's Magic resist.`,
      },
      modifiers: { health: 1, ad: 0.5, ap: 2, armor: 0.6, mr: 0.9, speed: 1.25 },
      accent: 'blue',
      sprites: {
        portrait: '/images/wizard/idle.gif',
        strips: {
          idle: strip('/images/wizard/sprites/Idle.png', 231, 190, 6),
          attack: strip('/images/wizard/sprites/Attack1.png', 231, 190, 8),
          magic: strip('/images/wizard/sprites/Attack2.png', 231, 190, 8),
          hit: strip('/images/wizard/sprites/Hit.png', 231, 190, 4),
          defeat: strip('/images/wizard/sprites/Death.png', 231, 190, 7),
        },
      },
    },
    {
      id: 'samurai',
      name: 'Samurai',
      description: 'A precise duelist who strikes first and cuts deep.',
      passive: {
        name: 'Iaijutsu',
        description: `Wins speed ties. Attacks gain +${SAMURAI_CRITICAL_BONUS * 100}% critical chance.`,
      },
      modifiers: { health: 1.1, ad: 2.6, ap: 0.5, armor: 0.8, mr: 0.7, speed: 1.5 },
      accent: 'red',
      sprites: {
        portrait: '/images/samurai/idle.gif',
        strips: {
          idle: strip('/images/samurai/Sprites/Idle.png', 200, 200, 8),
          attack: strip('/images/samurai/Sprites/Attack1.png', 200, 200, 6),
          magic: strip('/images/samurai/Sprites/Attack2.png', 200, 200, 6),
          hit: strip('/images/samurai/Sprites/Take Hit.png', 200, 200, 4),
          defeat: strip('/images/samurai/Sprites/Death.png', 200, 200, 6),
        },
      },
    },
    {
      id: 'warrior',
      name: 'Warrior',
      description: 'A slow, armored wall who punishes every blow.',
      passive: {
        name: 'Bulwark',
        description: `Guard grants ${(WARRIOR_GUARD_MULTIPLIER - 1) * 100}% more Block. Block that absorbs a hit strikes back for ${WARRIOR_RETALIATION * 100}% of the absorbed damage.`,
      },
      modifiers: { health: 1.2, ad: 1.4, ap: 0.5, armor: 1.1, mr: 1, speed: 0.5 },
      accent: 'amber',
      sprites: { portrait: '/images/warrior/idle.gif', strips: {} },
    },
  ];

export function findCharacter(id: CharacterId): CharacterDefinition {
  const character = CHARACTERS.find((candidate) => candidate.id === id);
  if (!character) throw new RangeError(`Unknown character: ${id}`);
  return character;
}

export function isCharacterId(value: unknown): value is CharacterId {
  return CHARACTERS.some((character) => character.id === value);
}

export function startingStats(character: CharacterDefinition): Stats {
  return scaleStats(BASE_STATS, (stat, base) =>
    Math.round(
      base * STARTING_LEVEL * (1 + (character.modifiers[stat] - 1) * STARTING_MODIFIER_WEIGHT),
    ),
  );
}
