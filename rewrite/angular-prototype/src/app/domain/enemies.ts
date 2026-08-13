import { BASE_STATS } from './characters';
import { EnemyDefinition, EnemyState, Stats, Stat } from './game-types';

function modifiers(overrides: Partial<Record<Stat, number>> = {}): Stats {
  return {
    health: overrides.health ?? 1,
    ad: overrides.ad ?? 1,
    ap: overrides.ap ?? 1,
    armor: overrides.armor ?? 1,
    mr: overrides.mr ?? 1,
    speed: overrides.speed ?? 1,
  };
}

const BASIC_MODIFIERS: Stats = modifiers();

export const ENEMY_DEFINITIONS: readonly EnemyDefinition[] = [
  {
    id: 'slime-blue',
    name: 'Slime Blue',
    archetype: 'basic',
    modifiers: BASIC_MODIFIERS,
    idleAsset: '/images/slime-blue/idle.gif',
  },
  {
    id: 'archer',
    name: 'Archer',
    archetype: 'ad',
    modifiers: modifiers({ health: 0.75, ad: 1.5, ap: 0.5, speed: 1.5 }),
    idleAsset: '/images/archer/idle.gif',
  },
  {
    id: 'evil-wizard',
    name: 'Evil Wizard',
    archetype: 'ap',
    modifiers: modifiers({ ad: 0.5, ap: 1.5 }),
    idleAsset: '/images/evil-wizard/idle.gif',
  },
  {
    id: 'knight',
    name: 'Knight',
    archetype: 'tank',
    modifiers: modifiers({
      health: 1.75,
      ad: 0.5,
      ap: 0.5,
      armor: 1.75,
      mr: 1.75,
      speed: 0.75,
    }),
    idleAsset: '/images/knight/idle.gif',
  },
];

function assertRoll(roll: number): void {
  if (roll < 0 || roll >= 1) {
    throw new RangeError('Random rolls must be in the range [0, 1).');
  }
}

function calculateStats(level: number, definition: EnemyDefinition): Stats {
  const stats = {} as Stats;

  (Object.keys(BASE_STATS) as Stat[]).forEach((stat) => {
    if (level < 10) {
      stats[stat] = level * BASE_STATS[stat] * 0.75;
    } else if (level < 20) {
      stats[stat] = level * BASE_STATS[stat] * 0.75 + level;
    } else {
      stats[stat] = level * BASE_STATS[stat] * definition.modifiers[stat] + 4 * level;
    }
  });

  return stats;
}

/**
 * Generates the first rewrite enemy from explicit rolls so the result can be
 * tested without coupling domain rules to Math.random(). The level and gold
 * formulas intentionally preserve the legacy game's pre-boss behavior.
 */
export function generateEnemy(
  playerLevel: number,
  definitionRoll: number,
  levelRoll: number,
): EnemyState {
  if (playerLevel < 1) {
    throw new RangeError('Player level must be positive.');
  }
  assertRoll(definitionRoll);
  assertRoll(levelRoll);

  const minLevel = Math.floor(playerLevel / 2);
  const maxLevel = Math.floor(playerLevel * 1.75);
  const level = Math.floor(levelRoll * (maxLevel - minLevel + 1)) + minLevel;
  const definition = ENEMY_DEFINITIONS[Math.floor(definitionRoll * ENEMY_DEFINITIONS.length)];

  return {
    definition,
    level,
    stats: calculateStats(level, definition),
    damageTaken: 0,
    potions: 3,
    gold: Math.trunc((level / playerLevel) * 250),
  };
}
