import { DamageKind, Stats } from './game-types';

export const COMBAT_RULES = {
  attack: {
    criticalChance: 0.1,
    criticalMultiplier: 1.5,
    missChance: 0.05,
    hitRange: [0.85, 1.15] as const,
    power: 'ad' as const,
    resistance: 'armor' as const,
  },
  magic: {
    criticalChance: 0.2,
    criticalMultiplier: 1.75,
    missChance: 0.1,
    hitRange: [0.75, 1.25] as const,
    power: 'ap' as const,
    resistance: 'mr' as const,
  },
} as const;

export interface DamageModifiers {
  /** Multiplies raw damage before resistance (relics, marks, charged attacks). */
  readonly damageMultiplier?: number;
  /** Share of the defender's resistance that is ignored, from 0 to 1. */
  readonly resistancePenetration?: number;
  /** Multiplies damage after resistance (defensive relics). */
  readonly receivedDamageMultiplier?: number;
  /** Added to the critical chance of the attack. */
  readonly criticalChanceBonus?: number;
  /** When true the attack cannot miss. */
  readonly guaranteedHit?: boolean;
  /** Temporary Block available to absorb the hit. */
  readonly block?: number;
}

export interface DamageResult {
  readonly kind: DamageKind;
  readonly critical: boolean;
  readonly missed: boolean;
  /** Damage after resistance, before Block. */
  readonly damage: number;
  /** Portion of `damage` absorbed by Block. */
  readonly blocked: number;
  /** Damage that reached health. */
  readonly dealt: number;
}

/** Resistance reduces damage hyperbolically: 100 resistance halves it. */
export function reduceDamage(damage: number, resistance: number): number {
  return Math.round((damage * 100) / (100 + Math.max(0, resistance)));
}

/**
 * Resolve one hit. `damageRoll` picks a value in the hit range; `chanceRoll` decides misses (low
 * rolls) and critical hits (high rolls). Both rolls must be in [0, 1).
 */
export function resolveDamage(
  attacker: Stats,
  defender: Stats,
  kind: DamageKind,
  damageRoll: number,
  chanceRoll: number,
  modifiers: DamageModifiers = {},
): DamageResult {
  const rule = COMBAT_RULES[kind];
  const power = attacker[rule.power];
  const [low, high] = rule.hitRange;
  const minimum = Math.floor(power * low);
  const maximum = Math.floor(power * high);
  const base = minimum + Math.floor(damageRoll * (maximum - minimum + 1));
  const missed = !modifiers.guaranteedHit && chanceRoll < rule.missChance;
  const criticalChance = rule.criticalChance + (modifiers.criticalChanceBonus ?? 0);
  const critical = !missed && chanceRoll >= 1 - criticalChance;
  const raw = missed
    ? 0
    : Math.trunc(
        base * (critical ? rule.criticalMultiplier : 1) * (modifiers.damageMultiplier ?? 1),
      );
  const resistance = defender[rule.resistance] * (1 - (modifiers.resistancePenetration ?? 0));
  const damage = Math.trunc(
    reduceDamage(raw, resistance) * (modifiers.receivedDamageMultiplier ?? 1),
  );
  const blocked = Math.min(Math.max(0, modifiers.block ?? 0), damage);
  return { kind, critical, missed, damage, blocked, dealt: damage - blocked };
}

/** The damage range shown in intents and action previews (no crit, no miss, before Block). */
export function damageRange(
  attacker: Stats,
  defender: Stats,
  kind: DamageKind,
  modifiers: Pick<DamageModifiers, 'damageMultiplier' | 'resistancePenetration'> = {},
): readonly [number, number] {
  const rule = COMBAT_RULES[kind];
  const power = attacker[rule.power];
  const multiplier = modifiers.damageMultiplier ?? 1;
  const resistance = defender[rule.resistance] * (1 - (modifiers.resistancePenetration ?? 0));
  const value = (share: number) =>
    reduceDamage(Math.trunc(Math.floor(power * share) * multiplier), resistance);
  return [value(rule.hitRange[0]), value(rule.hitRange[1])];
}

/** Heal up to `fraction` of maximum health without exceeding the damage taken. */
export function healAmount(damageTaken: number, maximumHealth: number, fraction: number): number {
  return Math.max(0, Math.min(damageTaken, Math.trunc(maximumHealth * fraction)));
}

/** Guard Block is three quarters of combined resistances. */
export const GUARD_SHARE = 0.75;

export function guardBlock(stats: Stats, multiplier = 1): number {
  return Math.round((stats.armor + stats.mr) * GUARD_SHARE * multiplier);
}
