export type CharacterId = 'wizard' | 'samurai' | 'warrior';

export type Stat = 'health' | 'ad' | 'ap' | 'armor' | 'mr' | 'speed';

export type Stats = Record<Stat, number>;

export type PowerUpType = 'health' | 'ad' | 'ap' | 'speed';

export type RelicQuality = 'normal' | 'rare' | 'epic';

export type RelicTrigger =
  | 'start-of-combat'
  | 'start-of-player-turn'
  | 'start-of-enemy-turn'
  | 'after-attack'
  | 'after-magic'
  | 'after-block-absorbs'
  | 'below-health-threshold'
  | 'first-time-each-combat'
  | 'every-nth-action'
  | 'after-victory'
  | 'route-map'
  | 'store';

export type RelicEffect =
  | {
      readonly kind: 'multiplier';
      readonly target: 'attack' | 'magic' | 'potion' | 'gold' | 'experience';
      readonly amount: number;
    }
  | { readonly kind: 'stat-bonus'; readonly stat: 'health' | 'speed'; readonly amount: number }
  | { readonly kind: 'block'; readonly amount: number; readonly trigger: RelicTrigger }
  | {
      readonly kind: 'trigger';
      readonly trigger: RelicTrigger;
      readonly amount: number;
      readonly threshold?: number;
      readonly counter?: number;
    };

export interface SpriteStripAsset {
  readonly src: string;
  readonly frameWidth: number;
  readonly frameHeight: number;
  readonly frameCount: number;
  readonly orientation?: 'horizontal' | 'vertical';
  /** Pixels cropped from the source edge after the final frame in a legacy export. */
  readonly trailingPixels?: number;
}

export interface PowerUpState {
  readonly pending: number;
  readonly history: Readonly<Record<PowerUpType, number>>;
}

export interface ItemState {
  readonly id: string;
  readonly name: string;
  readonly quality: RelicQuality;
  readonly icon: string;
  readonly price: number;
  readonly description: string;
  readonly effect: RelicEffect;
}

export interface CombatLogEntry {
  readonly title: string;
  readonly message: string;
  readonly value?: number;
  readonly icon?: string;
}

export const MAX_COMBAT_LOG_ENTRIES = 8;

export interface CharacterDefinition {
  readonly id: CharacterId;
  readonly name: string;
  readonly description: string;
  readonly modifiers: Stats;
  readonly accent: 'blue' | 'red' | 'amber';
  readonly idleAsset: string;
  readonly idleSpriteAsset?: SpriteStripAsset;
  readonly actionAsset?: SpriteStripAsset;
  readonly magicAsset?: SpriteStripAsset;
  readonly hitAsset?: SpriteStripAsset;
  readonly defeatAsset?: SpriteStripAsset;
}

export interface EnemyDefinition {
  readonly id: string;
  readonly name: string;
  readonly archetype: 'basic' | 'ad' | 'ap' | 'tank' | 'boss';
  readonly modifiers: Stats;
  readonly idleAsset: string;
  readonly idleSpriteAsset?: SpriteStripAsset;
  readonly attackAsset?: string;
  readonly attackSpriteAsset?: SpriteStripAsset;
  readonly magicSpriteAsset?: SpriteStripAsset;
  readonly hitSpriteAsset?: SpriteStripAsset;
  readonly defeatAsset?: string;
  readonly defeatSpriteAsset?: SpriteStripAsset;
}

export interface PlayerState {
  readonly name: string;
  readonly character: CharacterDefinition;
  readonly level: number;
  readonly experience: number;
  readonly stats: Stats;
  readonly potions: number;
  readonly gold: number;
  readonly inventory: readonly ItemState[];
  readonly powerUps: PowerUpState;
  readonly bossesDefeated: number;
  readonly defeatedEnemies: readonly DefeatedEnemy[];
}

export interface DefeatedEnemy {
  readonly enemyId: string;
  readonly level: number;
}

export interface EnemyState {
  readonly definition: EnemyDefinition;
  readonly level: number;
  readonly stats: Stats;
  readonly damageTaken: number;
  readonly potions: number;
  readonly gold: number;
}
