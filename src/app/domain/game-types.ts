export type CharacterId = 'wizard' | 'samurai' | 'warrior';

export type Stat = 'health' | 'ad' | 'ap' | 'armor' | 'mr' | 'speed';

export type Stats = Record<Stat, number>;

export type PowerUpType = 'health' | 'ad' | 'ap' | 'speed';

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
  readonly price: number;
  readonly bonus: Stats;
  readonly asset: string;
}

export interface CharacterDefinition {
  readonly id: CharacterId;
  readonly name: string;
  readonly description: string;
  readonly weakness: string;
  readonly modifiers: Stats;
  readonly accent: 'blue' | 'red' | 'amber';
  readonly idleAsset: string;
  readonly actionAsset?: SpriteStripAsset;
  readonly magicAsset?: SpriteStripAsset;
  readonly defeatAsset?: SpriteStripAsset;
}

export interface EnemyDefinition {
  readonly id: string;
  readonly name: string;
  readonly archetype: 'basic' | 'ad' | 'ap' | 'tank' | 'boss';
  readonly modifiers: Stats;
  readonly idleAsset: string;
  readonly attackAsset?: string;
  readonly attackSpriteAsset?: SpriteStripAsset;
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
