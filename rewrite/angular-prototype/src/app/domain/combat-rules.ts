import { Stats } from './game-types';

export const COMBAT_RULES = {
  ad: {
    criticalChance: 0.1,
    missChance: 0.1,
    hitRange: [0.8, 1.4] as const,
    resistance: 'armor' as const,
  },
  ap: {
    criticalChance: 0.4,
    missChance: 0.25,
    hitRange: [0.3, 2] as const,
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

export interface DamageResult {
  readonly kind: DamageKind;
  readonly rawDamage: number;
  readonly damageAfterResistance: number;
  readonly critical: boolean;
  readonly missed: boolean;
  readonly damageTaken: number;
}

function integerBetween(min: number, max: number, roll: number): number {
  if (roll < 0 || roll >= 1) {
    throw new RangeError('Random rolls must be in the range [0, 1).');
  }

  return Math.floor(roll * (max - min + 1) + min);
}

export function reduceDamage(damage: number, resistance: number): number {
  return Math.trunc((damage * 600) / (600 + resistance));
}

export function resolveDamage(
  attacker: Pick<Combatant, 'stats'>,
  defender: Combatant,
  kind: DamageKind,
  rolls: DamageRoll,
): DamageResult {
  const rule = COMBAT_RULES[kind === 'attack' ? 'ad' : 'ap'];
  const attackPower = attacker.stats[kind === 'attack' ? 'ad' : 'ap'];
  const [minimum, maximum] = rule.hitRange;
  const baseDamage = integerBetween(attackPower * minimum, attackPower * maximum, rolls.damageRoll);
  const missed = rolls.chanceRoll < rule.missChance;
  const critical = !missed && rolls.chanceRoll > 1 - rule.criticalChance;
  const rawDamage = missed ? 0 : critical ? baseDamage * 2 : baseDamage;
  const damageAfterResistance = reduceDamage(rawDamage, defender.stats[rule.resistance]);
  const damageTaken = Math.min(defender.stats.health, defender.damageTaken + damageAfterResistance);

  return {
    kind,
    rawDamage,
    damageAfterResistance,
    critical,
    missed,
    damageTaken,
  };
}
