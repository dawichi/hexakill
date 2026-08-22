import { Stats } from './game-types';

export const COMBAT_RULES = {
  attack: {
    criticalChance: 0.1,
    criticalMultiplier: 1.5,
    missChance: 0.05,
    hitRange: [0.85, 1.15] as const,
    resistance: 'armor' as const,
  },
  magic: {
    criticalChance: 0.2,
    criticalMultiplier: 1.75,
    missChance: 0.1,
    hitRange: [0.75, 1.25] as const,
    resistance: 'mr' as const,
  },
} as const;

export type DamageKind = 'attack' | 'magic';

export interface Combatant {
  readonly stats: Stats;
  readonly damageTaken: number;
}

export interface DamageRoll {
  readonly damageRoll: number;
  readonly chanceRoll: number;
}

export interface DamageModifiers {
  readonly damageMultiplier?: number;
  readonly resistancePenetration?: number;
  readonly receivedDamageMultiplier?: number;
  readonly block?: number;
}

export interface DamageResult {
  readonly kind: DamageKind;
  readonly rawDamage: number;
  readonly damageAfterResistance: number;
  readonly critical: boolean;
  readonly missed: boolean;
  readonly damageTaken: number;
  /** Damage absorbed by a temporary Guard block. Kept optional for old saves/tests. */
  readonly blocked?: number;
}

function integerBetween(min: number, max: number, roll: number): number {
  if (!Number.isFinite(roll) || roll < 0 || roll >= 1) {
    throw new RangeError('Random rolls must be in the range [0, 1).');
  }

  return Math.floor(roll * (max - min + 1) + min);
}

function assertStats(stats: Stats, role: string): void {
  if (
    !Object.values(stats).every((value) => Number.isFinite(value) && value >= 0) ||
    stats.health <= 0
  ) {
    throw new RangeError(`${role} stats must be finite and non-negative with positive health.`);
  }
}

export function reduceDamage(damage: number, resistance: number): number {
  if (!Number.isFinite(damage) || damage < 0 || !Number.isFinite(resistance) || resistance < 0) {
    throw new RangeError('Damage and resistance must be finite and non-negative.');
  }

  return Number(((damage * 100) / (100 + resistance)).toFixed(0));
}

export function resolveDamage(
  attacker: Pick<Combatant, 'stats'>,
  defender: Combatant,
  kind: DamageKind,
  rolls: DamageRoll,
  modifiers: DamageModifiers = {},
): DamageResult {
  if (kind !== 'attack' && kind !== 'magic') {
    throw new RangeError('Damage kind must be attack or magic.');
  }
  assertStats(attacker.stats, 'Attacker');
  assertStats(defender.stats, 'Defender');
  if (
    !Number.isFinite(defender.damageTaken) ||
    defender.damageTaken < 0 ||
    defender.damageTaken > defender.stats.health
  ) {
    throw new RangeError('Defender damage must be within its health bounds.');
  }
  if (!Number.isFinite(rolls.chanceRoll) || rolls.chanceRoll < 0 || rolls.chanceRoll >= 1) {
    throw new RangeError('Random rolls must be in the range [0, 1).');
  }

  const damageMultiplier = modifiers.damageMultiplier ?? 1;
  const resistancePenetration = modifiers.resistancePenetration ?? 0;
  const receivedDamageMultiplier = modifiers.receivedDamageMultiplier ?? 1;
  const block = modifiers.block ?? 0;
  if (
    !Number.isFinite(damageMultiplier) ||
    damageMultiplier < 0 ||
    !Number.isFinite(resistancePenetration) ||
    resistancePenetration < 0 ||
    resistancePenetration > 1 ||
    !Number.isFinite(receivedDamageMultiplier) ||
    receivedDamageMultiplier < 0 ||
    !Number.isFinite(block) ||
    block < 0
  ) {
    throw new RangeError('Damage modifiers must be finite and within their valid ranges.');
  }

  const rule = COMBAT_RULES[kind];
  const attackPower = attacker.stats[kind === 'attack' ? 'ad' : 'ap'];
  const [minimum, maximum] = rule.hitRange;
  const baseDamage = integerBetween(attackPower * minimum, attackPower * maximum, rolls.damageRoll);
  const missed = rolls.chanceRoll < rule.missChance;
  const critical = !missed && rolls.chanceRoll > 1 - rule.criticalChance;
  const rawDamage = missed
    ? 0
    : Math.trunc(baseDamage * (critical ? rule.criticalMultiplier : 1) * damageMultiplier);
  const effectiveResistance = defender.stats[rule.resistance] * (1 - resistancePenetration);
  const damageAfterResistance = Math.trunc(
    reduceDamage(rawDamage, effectiveResistance) * receivedDamageMultiplier,
  );
  const blocked = Math.min(block, damageAfterResistance);
  const damageTaken = Math.min(
    defender.stats.health,
    defender.damageTaken + damageAfterResistance - blocked,
  );

  return {
    kind,
    rawDamage,
    damageAfterResistance,
    critical,
    missed,
    damageTaken,
    blocked,
  };
}

export function damageDealt(
  result: Pick<DamageResult, 'damageAfterResistance' | 'blocked'>,
): number {
  return Math.max(0, result.damageAfterResistance - (result.blocked ?? 0));
}
