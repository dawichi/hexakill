import { BASE_STATS } from './characters';
import { EnemyDefinition, EnemyState, SpriteStripAsset, Stat, Stats } from './game-types';

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
  animationAssets: Pick<
    EnemyDefinition,
    'attackAsset' | 'attackSpriteAsset' | 'defeatAsset' | 'defeatSpriteAsset'
  > = {},
): EnemyDefinition {
  return { id, name, archetype, modifiers: enemyModifiers, idleAsset, ...animationAssets };
}

const BLUE_SLIME_ANIMATIONS = {
  attackAsset: '/images/slime-blue/attack.gif',
  defeatAsset: '/images/slime-blue/die.gif',
} as const;

const EVIL_WIZARD_DEFEAT_SPRITE: SpriteStripAsset = {
  src: '/images/evil-wizard/sprites/Death.png',
  frameWidth: 250,
  frameHeight: 250,
  frameCount: 7,
};

const EVIL_WIZARD_ATTACK_SPRITE: SpriteStripAsset = {
  src: '/images/evil-wizard/sprites/Attack1.png',
  frameWidth: 250,
  frameHeight: 250,
  frameCount: 8,
};

const WILD_HUNTRESS_DEFEAT_SPRITE: SpriteStripAsset = {
  src: '/images/wild-huntress/sprites/Death.png',
  frameWidth: 150,
  frameHeight: 150,
  frameCount: 8,
};

const WILD_HUNTRESS_ATTACK_SPRITE: SpriteStripAsset = {
  src: '/images/wild-huntress/sprites/Attack1.png',
  frameWidth: 150,
  frameHeight: 150,
  frameCount: 5,
};

const FIRE_WORM_DEFEAT_SPRITE: SpriteStripAsset = {
  src: '/images/fire-worm/Sprites/Worm/Death.png',
  frameWidth: 90,
  frameHeight: 90,
  frameCount: 8,
};

const FIRE_WORM_ATTACK_SPRITE: SpriteStripAsset = {
  src: '/images/fire-worm/Sprites/Worm/Attack.png',
  frameWidth: 90,
  frameHeight: 90,
  frameCount: 16,
};

const MARTIAL_HERO_DEFEAT_SPRITE: SpriteStripAsset = {
  src: '/images/martial-hero/Sprite/Death.png',
  frameWidth: 126,
  frameHeight: 126,
  frameCount: 11,
};

const MARTIAL_HERO_ATTACK_SPRITE: SpriteStripAsset = {
  src: '/images/martial-hero/Sprite/Attack1.png',
  frameWidth: 126,
  frameHeight: 126,
  frameCount: 7,
};

const WITCH_BLUE_ATTACK_SPRITE: SpriteStripAsset = {
  src: '/images/witch-blue/assets/B_witch_attack.png',
  frameWidth: 104,
  frameHeight: 104,
  frameCount: 4,
  orientation: 'vertical',
  trailingPixels: 2,
};

const WITCH_BLUE_DEFEAT_SPRITE: SpriteStripAsset = {
  src: '/images/witch-blue/assets/B_witch_death.png',
  frameWidth: 32,
  frameHeight: 32,
  frameCount: 15,
  orientation: 'vertical',
};

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
  enemy('evil-wizard', 'Evil Wizard', 'ap', '/images/evil-wizard/idle.gif', AP_MODIFIERS, {
    attackSpriteAsset: EVIL_WIZARD_ATTACK_SPRITE,
    defeatSpriteAsset: EVIL_WIZARD_DEFEAT_SPRITE,
  }),
  enemy('fire-knight', 'Fire knight', 'tank', '/images/fire-knight/idle.gif', TANK_MODIFIERS),
  enemy('fire-worm', 'Fire worm', 'ap', '/images/fire-worm/idle.gif', AP_MODIFIERS, {
    attackSpriteAsset: FIRE_WORM_ATTACK_SPRITE,
    defeatSpriteAsset: FIRE_WORM_DEFEAT_SPRITE,
  }),
  enemy('knight', 'Knight', 'tank', '/images/knight/idle.gif', TANK_MODIFIERS),
  enemy('martial-hero', 'Martial Hero', 'ad', '/images/martial-hero/idle.gif', AD_MODIFIERS, {
    attackSpriteAsset: MARTIAL_HERO_ATTACK_SPRITE,
    defeatSpriteAsset: MARTIAL_HERO_DEFEAT_SPRITE,
  }),
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
  enemy('wild-huntress', 'Wild Huntress', 'ad', '/images/wild-huntress/idle.gif', AD_MODIFIERS, {
    attackSpriteAsset: WILD_HUNTRESS_ATTACK_SPRITE,
    defeatSpriteAsset: WILD_HUNTRESS_DEFEAT_SPRITE,
  }),
  enemy('witch-blue', 'Witch Blue', 'ap', '/images/witch-blue/idle.gif', AP_MODIFIERS, {
    attackSpriteAsset: WITCH_BLUE_ATTACK_SPRITE,
    defeatSpriteAsset: WITCH_BLUE_DEFEAT_SPRITE,
  }),
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

export function enemySpriteAssetFor(
  id: string,
  animation: 'idle' | 'attack' | 'defeat',
): SpriteStripAsset | undefined {
  const definition = findEnemyDefinition(id);
  if (!definition) return undefined;
  if (animation === 'attack') return definition.attackSpriteAsset;
  if (animation === 'defeat') return definition.defeatSpriteAsset;
  return undefined;
}

function assertRoll(roll: number): void {
  if (!Number.isFinite(roll) || roll < 0 || roll >= 1) {
    throw new RangeError('Random rolls must be in the range [0, 1).');
  }
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
  if (!Number.isFinite(playerLevel) || playerLevel < 1) {
    throw new RangeError('Player level must be positive.');
  }
  if (
    !Number.isInteger(bossesDefeated) ||
    bossesDefeated < 0 ||
    bossesDefeated > BOSS_DEFINITIONS.length
  ) {
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
  const maxLevel = playerLevel * 1.75;
  const level = Math.floor(levelRoll * (maxLevel - minLevel + 1)) + minLevel;
  const definition = regularEnemies[Math.floor(definitionRoll * regularEnemies.length)];
  return {
    definition,
    level,
    stats: calculateStats(level, definition),
    damageTaken: 0,
    potions: 3,
    gold: Number(((level / playerLevel) * 250).toFixed(0)),
  };
}
