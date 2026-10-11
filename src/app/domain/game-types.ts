export type CharacterId = 'wizard' | 'samurai' | 'warrior';

export type Stat = 'health' | 'ad' | 'ap' | 'armor' | 'mr' | 'speed';

export type Stats = Readonly<Record<Stat, number>>;

export const STAT_KEYS: readonly Stat[] = ['health', 'ad', 'ap', 'armor', 'mr', 'speed'];

export type DamageKind = 'attack' | 'magic';

export type Side = 'player' | 'enemy';

export interface SpriteStripAsset {
  readonly src: string;
  readonly frameWidth: number;
  readonly frameHeight: number;
  readonly frameCount: number;
  readonly orientation?: 'horizontal' | 'vertical';
  /** Pixels cropped from the source edge after the final frame in a legacy export. */
  readonly trailingPixels?: number;
}

export type AnimationState = 'idle' | 'attack' | 'magic' | 'hit' | 'defeat';

/**
 * Visual assets for a combatant. `portrait` is an animated GIF used outside combat and as the
 * fallback for any state without a sprite strip; missing states use CSS motion instead.
 */
export interface CombatantSprites {
  readonly portrait: string;
  readonly strips: Readonly<Partial<Record<AnimationState, SpriteStripAsset>>>;
  readonly gifs?: Readonly<Partial<Record<'attack' | 'defeat', string>>>;
}

export function scaleStats(stats: Stats, scale: (stat: Stat, value: number) => number): Stats {
  return Object.fromEntries(STAT_KEYS.map((stat) => [stat, scale(stat, stats[stat])])) as Stats;
}
