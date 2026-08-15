import { BASE_STATS } from './characters';
import { EnemyDefinition, EnemyState, Stat, Stats } from './game-types';

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

function enemy(
  id: string,
  name: string,
  archetype: EnemyDefinition['archetype'],
  idleAsset: string,
  enemyModifiers: Stats,
  animationAssets: Pick<EnemyDefinition, 'attackAsset' | 'defeatAsset'> = {},
): EnemyDefinition {
  return { id, name, archetype, modifiers: enemyModifiers, idleAsset, ...animationAssets };
}

const BLUE_SLIME_ANIMATIONS = {
  attackAsset: '/images/slime-blue/attack.gif',
  defeatAsset: '/images/slime-blue/die.gif',
} as const;

const BASIC_MODIFIERS = modifiers();
const AD_MODIFIERS = modifiers({ health: 0.75, ad: 1.5, ap: 0.5, speed: 1.5 });
const AP_MODIFIERS = modifiers({ ad: 0.5, ap: 1.5 });
const TANK_MODIFIERS = modifiers({
  health: 1.75,
  armor: 1.75,
  mr: 1.75,
  speed: 0.75,
  ad: 0.5,
  ap: 0.5,
});
const BOSS_MODIFIERS = modifiers({
  health: 1.5,
  ad: 1.25,
  ap: 1.25,
  armor: 1.25,
  mr: 1.25,
  speed: 2,
});

/** Complete legacy roster. Boss encounters are kept separately below. */
export const ENEMY_DEFINITIONS: readonly EnemyDefinition[] = [
  enemy('adventurer', 'Adventurer', 'basic', '/images/adventurer/idle.gif', BASIC_MODIFIERS),
  enemy('archer', 'Archer', 'ad', '/images/archer/idle.gif', AD_MODIFIERS),
  enemy(
    'armored-huntress',
    'Armored huntress',
    'tank',
    '/images/armored-huntress/idle.gif',
    TANK_MODIFIERS,
  ),
  enemy(
    'bringer-of-death',
    'Bringer of death',
    'basic',
    '/images/bringer-of-death/idle.gif',
    BOSS_MODIFIERS,
  ),
  enemy('evil-tree', 'Evil tree', 'ap', '/images/evil-tree/idle.gif', AP_MODIFIERS, {
    attackAsset: '/images/evil-tree/attack.gif',
    defeatAsset: '/images/evil-tree/die.gif',
  }),
  enemy('evil-wizard', 'Evil Wizard', 'ap', '/images/evil-wizard/idle.gif', AP_MODIFIERS),
  enemy('fire-knight', 'Fire knight', 'tank', '/images/fire-knight/idle.gif', TANK_MODIFIERS),
  enemy('fire-worm', 'Fire worm', 'ap', '/images/fire-worm/idle.gif', AP_MODIFIERS),
  enemy('knight', 'Knight', 'tank', '/images/knight/idle.gif', TANK_MODIFIERS),
  enemy('martial-hero', 'Martial Hero', 'ad', '/images/martial-hero/idle.gif', AD_MODIFIERS),
  enemy(
    'slime-blue',
    'Slime Blue',
    'basic',
    '/images/slime-blue/idle.gif',
    BASIC_MODIFIERS,
    BLUE_SLIME_ANIMATIONS,
  ),
  enemy('slime-red', 'Slime Red', 'basic', '/images/slime-red/idle.gif', BASIC_MODIFIERS, {
    attackAsset: '/images/slime-red/attack.gif',
    defeatAsset: '/images/slime-red/die.gif',
  }),
  enemy('slime-green', 'Slime Green', 'basic', '/images/slime-green/idle.gif', BASIC_MODIFIERS, {
    attackAsset: '/images/slime-green/attack.gif',
    defeatAsset: '/images/slime-green/die.gif',
  }),
  enemy('slime-purple', 'Slime Purple', 'ap', '/images/slime-purple/idle.gif', AP_MODIFIERS, {
    attackAsset: '/images/slime-purple/attack.gif',
    defeatAsset: '/images/slime-purple/die.gif',
  }),
  enemy('slime-gold', 'Slime Gold', 'basic', '/images/slime-gold/idle.gif', BOSS_MODIFIERS, {
    attackAsset: '/images/slime-gold/attack.gif',
    defeatAsset: '/images/slime-gold/die.gif',
  }),
  enemy(
    'water-priestess',
    'Water Priestess',
    'ap',
    '/images/water-priestess/idle.gif',
    AP_MODIFIERS,
  ),
  enemy('wild-huntress', 'Wild Huntress', 'ad', '/images/wild-huntress/idle.gif', AD_MODIFIERS),
  enemy('witch-blue', 'Witch Blue', 'ap', '/images/witch-blue/idle.gif', AP_MODIFIERS),
];

const BOSS_DEFINITIONS: readonly EnemyDefinition[] = [
  enemy('gold-slime-1', 'Gold Slime 1', 'boss', '/images/slime-gold/idle.gif', BOSS_MODIFIERS, {
    attackAsset: '/images/slime-gold/attack.gif',
    defeatAsset: '/images/slime-gold/die.gif',
  }),
  enemy('gold-slime-2', 'Gold Slime 2', 'boss', '/images/slime-gold/idle.gif', BOSS_MODIFIERS, {
    attackAsset: '/images/slime-gold/attack.gif',
    defeatAsset: '/images/slime-gold/die.gif',
  }),
  enemy('gold-slime-3', 'Gold Slime 3', 'boss', '/images/slime-gold/idle.gif', BOSS_MODIFIERS, {
    attackAsset: '/images/slime-gold/attack.gif',
    defeatAsset: '/images/slime-gold/die.gif',
  }),
];

export function findEnemyDefinition(id: string): EnemyDefinition | undefined {
  return [...ENEMY_DEFINITIONS, ...BOSS_DEFINITIONS].find((candidate) => candidate.id === id);
}

export function enemyAssetFor(
  id: string,
  animation: 'idle' | 'attack' | 'defeat',
): string | undefined {
  const definition = findEnemyDefinition(id);
  if (!definition) return undefined;
  if (animation === 'attack') return definition.attackAsset ?? definition.idleAsset;
  if (animation === 'defeat') return definition.defeatAsset ?? definition.idleAsset;
  return definition.idleAsset;
}

function assertRoll(roll: number): void {
  if (roll < 0 || roll >= 1) throw new RangeError('Random rolls must be in the range [0, 1).');
}

function calculateStats(level: number, definition: EnemyDefinition): Stats {
  const stats = {} as Stats;
  (Object.keys(BASE_STATS) as Stat[]).forEach((stat) => {
    if (level < 10) stats[stat] = level * BASE_STATS[stat] * 0.75;
    else if (level < 20) stats[stat] = level * BASE_STATS[stat] * 0.75 + level;
    else stats[stat] = level * BASE_STATS[stat] * definition.modifiers[stat] + 4 * level;
  });
  return stats;
}

export function generateEnemy(
  playerLevel: number,
  definitionRoll: number,
  levelRoll: number,
  bossesDefeated = 0,
): EnemyState {
  if (playerLevel < 1) throw new RangeError('Player level must be positive.');
  if (bossesDefeated < 0 || bossesDefeated > BOSS_DEFINITIONS.length) {
    throw new RangeError('Boss progress must be between 0 and 3.');
  }
  assertRoll(definitionRoll);
  assertRoll(levelRoll);

  if (playerLevel >= 10 && bossesDefeated < BOSS_DEFINITIONS.length) {
    const definition = BOSS_DEFINITIONS[bossesDefeated];
    const level = 15 + bossesDefeated * 10;
    return {
      definition,
      level,
      stats: calculateStats(level, definition),
      damageTaken: 0,
      potions: 3,
      gold: 1000,
    };
  }

  const regularEnemies = ENEMY_DEFINITIONS.filter((candidate) => candidate.archetype !== 'boss');
  const minLevel = Math.floor(playerLevel / 2);
  const maxLevel = Math.floor(playerLevel * 1.75);
  const level = Math.floor(levelRoll * (maxLevel - minLevel + 1)) + minLevel;
  const definition = regularEnemies[Math.floor(definitionRoll * regularEnemies.length)];
  return {
    definition,
    level,
    stats: calculateStats(level, definition),
    damageTaken: 0,
    potions: 3,
    gold: Math.trunc((level / playerLevel) * 250),
  };
}
