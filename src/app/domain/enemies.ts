import { BASE_STATS } from './characters';
import { CombatantSprites, SpriteStripAsset, Stats, scaleStats } from './game-types';
import { pick, Rng } from './random';

export type EnemyArchetype = 'basic' | 'ad' | 'ap' | 'tank' | 'boss';
export type BossId = 'fire-knight' | 'water-priestess' | 'bringer-of-death';

export interface EnemyDefinition {
  readonly id: string;
  readonly name: string;
  readonly archetype: EnemyArchetype;
  /** Stat multipliers relative to the regular enemy baseline. */
  readonly modifiers: Stats;
  readonly sprites: CombatantSprites;
  readonly goldMultiplier?: number;
  /** Boss-only flavour shown on the route map and when the fight begins. */
  readonly title?: string;
}

export interface EnemyState {
  readonly id: string;
  readonly level: number;
  readonly stats: Stats;
  readonly damageTaken: number;
  readonly potions: number;
  readonly gold: number;
  readonly elite: boolean;
}

export const ELITE_STAT_MULTIPLIER = 1.15;
export const ELITE_GOLD_MULTIPLIER = 1.5;
/** Regular enemies are generated from this share of the player-level baseline. */
const REGULAR_STAT_SCALE = 0.9;

function modifiers(overrides: Partial<Stats> = {}): Stats {
  return { health: 1, ad: 1, ap: 1, armor: 1, mr: 1, speed: 1, ...overrides };
}

const ARCHETYPE_MODIFIERS: Readonly<Record<Exclude<EnemyArchetype, 'boss'>, Stats>> = {
  basic: modifiers(),
  ad: modifiers({ health: 0.85, ad: 1.35, ap: 0.6, armor: 0.9, speed: 1.4 }),
  ap: modifiers({ health: 0.9, ad: 0.6, ap: 1.35, mr: 1.2, armor: 0.85 }),
  tank: modifiers({ health: 1.45, armor: 1.5, mr: 1.4, speed: 0.7, ad: 0.8, ap: 0.7 }),
};

const strip = (
  src: string,
  frameWidth: number,
  frameHeight: number,
  frameCount: number,
  extra: Partial<SpriteStripAsset> = {},
): SpriteStripAsset => ({ src, frameWidth, frameHeight, frameCount, ...extra });

const slimeSprites = (color: string): CombatantSprites => ({
  portrait: `/images/slime-${color}/idle.gif`,
  strips: {},
  gifs: { attack: `/images/slime-${color}/attack.gif`, defeat: `/images/slime-${color}/die.gif` },
});

function regular(
  id: string,
  name: string,
  archetype: Exclude<EnemyArchetype, 'boss'>,
  sprites: CombatantSprites,
  extra: Partial<Pick<EnemyDefinition, 'goldMultiplier'>> = {},
): EnemyDefinition {
  return { id, name, archetype, modifiers: ARCHETYPE_MODIFIERS[archetype], sprites, ...extra };
}

export const REGULAR_ENEMIES: readonly EnemyDefinition[] = [
  regular('adventurer', 'Adventurer', 'basic', {
    portrait: '/images/adventurer/idle.gif',
    strips: {},
  }),
  regular('archer', 'Archer', 'ad', { portrait: '/images/archer/idle.gif', strips: {} }),
  regular('armored-huntress', 'Armored Huntress', 'tank', {
    portrait: '/images/armored-huntress/idle.gif',
    strips: {},
  }),
  regular('evil-tree', 'Evil Tree', 'ap', {
    portrait: '/images/evil-tree/idle.gif',
    strips: {},
    gifs: { attack: '/images/evil-tree/attack.gif', defeat: '/images/evil-tree/die.gif' },
  }),
  regular('evil-wizard', 'Evil Wizard', 'ap', {
    portrait: '/images/evil-wizard/idle.gif',
    strips: {
      idle: strip('/images/evil-wizard/sprites/Idle.png', 250, 250, 8),
      attack: strip('/images/evil-wizard/sprites/Attack1.png', 250, 250, 8),
      magic: strip('/images/evil-wizard/sprites/Attack2.png', 250, 250, 8),
      hit: strip('/images/evil-wizard/sprites/Take hit.png', 250, 250, 3),
      defeat: strip('/images/evil-wizard/sprites/Death.png', 250, 250, 7),
    },
  }),
  regular('fire-worm', 'Fire Worm', 'ap', {
    portrait: '/images/fire-worm/idle.gif',
    strips: {
      idle: strip('/images/fire-worm/Sprites/Worm/Idle.png', 90, 90, 9),
      attack: strip('/images/fire-worm/Sprites/Worm/Attack.png', 90, 90, 16),
      hit: strip('/images/fire-worm/Sprites/Worm/Get Hit.png', 90, 90, 3),
      defeat: strip('/images/fire-worm/Sprites/Worm/Death.png', 90, 90, 8),
    },
  }),
  regular('knight', 'Knight', 'tank', {
    portrait: '/images/knight/idle.gif',
    strips: { idle: strip('/images/knight/idle.png', 42, 42, 4) },
  }),
  regular('martial-hero', 'Martial Hero', 'ad', {
    portrait: '/images/martial-hero/idle.gif',
    strips: {
      idle: strip('/images/martial-hero/Sprite/Idle.png', 126, 126, 10),
      attack: strip('/images/martial-hero/Sprite/Attack1.png', 126, 126, 7),
      hit: strip('/images/martial-hero/Sprite/Take Hit.png', 126, 126, 3),
      defeat: strip('/images/martial-hero/Sprite/Death.png', 126, 126, 11),
    },
  }),
  regular('slime-blue', 'Blue Slime', 'basic', slimeSprites('blue')),
  regular('slime-red', 'Red Slime', 'basic', slimeSprites('red')),
  regular('slime-green', 'Green Slime', 'basic', slimeSprites('green')),
  regular('slime-purple', 'Purple Slime', 'ap', slimeSprites('purple')),
  regular('slime-gold', 'Gold Slime', 'basic', slimeSprites('gold'), { goldMultiplier: 2.5 }),
  regular('wild-huntress', 'Wild Huntress', 'ad', {
    portrait: '/images/wild-huntress/idle.gif',
    strips: {
      idle: strip('/images/wild-huntress/sprites/Idle.png', 150, 150, 8),
      attack: strip('/images/wild-huntress/sprites/Attack1.png', 150, 150, 5),
      hit: strip('/images/wild-huntress/sprites/Take hit.png', 150, 150, 3),
      defeat: strip('/images/wild-huntress/sprites/Death.png', 150, 150, 8),
    },
  }),
  regular('witch-blue', 'Blue Witch', 'ap', {
    portrait: '/images/witch-blue/idle.gif',
    strips: {
      idle: strip('/images/witch-blue/assets/B_witch_idle.png', 32, 32, 9, {
        orientation: 'vertical',
      }),
      attack: strip('/images/witch-blue/assets/B_witch_attack.png', 104, 104, 4, {
        orientation: 'vertical',
        trailingPixels: 2,
      }),
      magic: strip('/images/witch-blue/assets/B_witch_charge.png', 48, 48, 5, {
        orientation: 'vertical',
      }),
      hit: strip('/images/witch-blue/assets/B_witch_take_damage.png', 32, 32, 5, {
        orientation: 'vertical',
        trailingPixels: 16,
      }),
      defeat: strip('/images/witch-blue/assets/B_witch_death.png', 32, 32, 15, {
        orientation: 'vertical',
      }),
    },
  }),
];

const bossSprites = (
  id: BossId,
  frameWidth: number,
  frameHeight: number,
  frames: Readonly<Record<'idle' | 'attack' | 'magic' | 'hit' | 'defeat', number>>,
): CombatantSprites => ({
  portrait: `/images/${id}/idle.gif`,
  strips: {
    idle: strip(`/images/${id}/sprites/idle.png`, frameWidth, frameHeight, frames.idle),
    attack: strip(`/images/${id}/sprites/attack.png`, frameWidth, frameHeight, frames.attack),
    magic: strip(`/images/${id}/sprites/magic.png`, frameWidth, frameHeight, frames.magic),
    hit: strip(`/images/${id}/sprites/hit.png`, frameWidth, frameHeight, frames.hit),
    defeat: strip(`/images/${id}/sprites/death.png`, frameWidth, frameHeight, frames.defeat),
  },
});

/** One boss guards each milestone room, in order. */
export const BOSSES: readonly (EnemyDefinition & {
  readonly id: BossId;
  readonly level: number;
})[] = [
  {
    id: 'fire-knight',
    name: 'Fire Knight',
    title: 'Warden of the Ember Gate',
    archetype: 'boss',
    level: 9,
    modifiers: modifiers({ health: 1.4, ad: 1, ap: 0.75, armor: 0.9, mr: 0.8, speed: 0.9 }),
    sprites: bossSprites('fire-knight', 155, 104, {
      idle: 8,
      attack: 11,
      magic: 18,
      hit: 6,
      defeat: 13,
    }),
  },
  {
    id: 'water-priestess',
    name: 'Water Priestess',
    title: 'Keeper of the Drowned Choir',
    archetype: 'boss',
    level: 16,
    modifiers: modifiers({ health: 1.6, ad: 0.8, ap: 1.15, armor: 0.9, mr: 1.1, speed: 1 }),
    sprites: bossSprites('water-priestess', 120, 51, {
      idle: 8,
      attack: 21,
      magic: 12,
      hit: 7,
      defeat: 16,
    }),
  },
  {
    id: 'bringer-of-death',
    name: 'Bringer of Death',
    title: 'The Last Door',
    archetype: 'boss',
    level: 22,
    modifiers: modifiers({ health: 1.9, ad: 1.15, ap: 1.15, armor: 1, mr: 1, speed: 1 }),
    sprites: bossSprites('bringer-of-death', 140, 92, {
      idle: 8,
      attack: 10,
      magic: 9,
      hit: 3,
      defeat: 10,
    }),
  },
];

const ALL_ENEMIES: readonly EnemyDefinition[] = [...REGULAR_ENEMIES, ...BOSSES];

export function findEnemyDefinition(id: string): EnemyDefinition {
  const definition = ALL_ENEMIES.find((candidate) => candidate.id === id);
  if (!definition) throw new RangeError(`Unknown enemy: ${id}`);
  return definition;
}

export function isEnemyId(value: unknown): value is string {
  return ALL_ENEMIES.some((candidate) => candidate.id === value);
}

export function isBossId(value: string): value is BossId {
  return BOSSES.some((boss) => boss.id === value);
}

function regularStats(level: number, definition: EnemyDefinition): Stats {
  // Deeper floors add a flat per-level bonus so late enemies keep pace with power-ups.
  const flatBonus = level >= 20 ? 4 * level : level >= 10 ? level : 0;
  return scaleStats(BASE_STATS, (stat, base) =>
    Math.round(level * base * REGULAR_STAT_SCALE * definition.modifiers[stat] + flatBonus),
  );
}

function bossStats(level: number, definition: EnemyDefinition): Stats {
  return scaleStats(BASE_STATS, (stat, base) =>
    Math.round(level * base * definition.modifiers[stat]),
  );
}

export type EncounterKind = 'battle' | 'elite' | 'boss';

/**
 * Regular enemies roll a level between half the player's level and one above it; elites never
 * roll below the player's level and gain a stat and gold premium.
 */
export function generateEnemy(
  rng: Rng,
  playerLevel: number,
  kind: EncounterKind,
  bossIndex = 0,
): EnemyState {
  if (kind === 'boss') {
    const boss = BOSSES[bossIndex];
    if (!boss) throw new RangeError(`No boss guards milestone ${bossIndex + 1}.`);
    return {
      id: boss.id,
      level: boss.level,
      stats: bossStats(boss.level, boss),
      damageTaken: 0,
      potions: 2,
      gold: 1000,
      elite: false,
    };
  }

  const definition = pick(rng, REGULAR_ENEMIES);
  const minimumLevel = kind === 'elite' ? playerLevel : Math.max(1, Math.floor(playerLevel / 2));
  const maximumLevel = playerLevel + 1;
  const level = minimumLevel + Math.floor(rng.next() * (maximumLevel - minimumLevel + 1));
  const elite = kind === 'elite';
  const stats = regularStats(level, definition);
  const gold = (level / playerLevel) * 250 * (definition.goldMultiplier ?? 1);
  return {
    id: definition.id,
    level,
    stats: elite
      ? scaleStats(stats, (_, value) => Math.round(value * ELITE_STAT_MULTIPLIER))
      : stats,
    damageTaken: 0,
    potions: elite ? 2 : 1,
    gold: Math.round(gold * (elite ? ELITE_GOLD_MULTIPLIER : 1)),
    elite,
  };
}

export function enemyRemainingHealth(enemy: EnemyState): number {
  return Math.max(0, enemy.stats.health - enemy.damageTaken);
}
