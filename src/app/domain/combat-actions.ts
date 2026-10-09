import {
  COMBAT_RULES,
  Combatant,
  DamageKind,
  DamageModifiers,
  DamageResult,
  reduceDamage,
  resolveDamage,
} from './combat-rules';
import { EnemyIntent } from './combat-state';
import { EnemyState, Stats } from './game-types';

export type CombatAction = DamageKind | 'heal';

export function guardBlockAmount(stats: Stats, multiplier = 1): number {
  if (
    !Object.values(stats).every((value) => Number.isFinite(value) && value >= 0) ||
    !Number.isFinite(multiplier) ||
    multiplier < 0
  ) {
    throw new RangeError('Guard stats and multiplier must be finite and non-negative.');
  }

  return Math.max(0, Math.round(((stats.armor + stats.mr) * multiplier) / 2));
}

function damagePreview(
  attacker: Stats,
  defender: Stats,
  kind: DamageKind,
): Pick<EnemyIntent, 'minValue' | 'maxValue'> {
  const rule = COMBAT_RULES[kind];
  const power = attacker[kind === 'attack' ? 'ad' : 'ap'];
  const resistance = defender[rule.resistance];
  const minRaw = Math.round(power * rule.hitRange[0]);
  const maxRaw = Math.round(power * rule.hitRange[1]);
  return {
    minValue: reduceDamage(minRaw, resistance),
    maxValue: reduceDamage(maxRaw, resistance),
  };
}

function chooseIntentKind(
  enemy: EnemyState,
  roll: number,
  turn: number,
): DamageKind | 'guard' | 'heal' {
  const healthRatio = (enemy.stats.health - enemy.damageTaken) / enemy.stats.health;
  if (enemy.potions > 0 && healthRatio <= 0.22) return 'heal';

  if (
    (enemy.definition.archetype === 'tank' && turn % 3 === 0) ||
    (enemy.definition.archetype === 'boss' && turn % 4 === 3) ||
    (enemy.definition.archetype === 'ap' && turn % 4 === 2)
  ) {
    return 'guard';
  }

  // Keep the baseline split predictable. Archetype-specific behavior is
  // expressed through the guard/heal patterns above, while the visible
  // intent remains easy to learn from run to run.
  const magicBias = 0.5;
  return roll <= magicBias ? 'attack' : 'magic';
}

export function chooseEnemyIntent(
  enemy: EnemyState,
  defenderStats: Stats,
  roll: number,
  turn = 0,
): EnemyIntent {
  assertEnemyState(enemy);
  if (
    !(Object.values(defenderStats) as number[]).every(
      (value) => Number.isFinite(value) && value >= 0,
    ) ||
    !Number.isFinite(roll) ||
    roll < 0 ||
    roll >= 1 ||
    !Number.isSafeInteger(turn) ||
    turn < 0
  ) {
    throw new RangeError('Enemy intent inputs must be finite and within their valid ranges.');
  }

  const kind = chooseIntentKind(enemy, roll, turn);
  if (kind === 'guard') {
    const block = guardBlockAmount(enemy.stats);
    return { kind, minValue: block, maxValue: block };
  }
  if (kind === 'heal') {
    const healing = resolveHeal(enemy.damageTaken, enemy.stats.health).healed;
    return { kind, minValue: healing, maxValue: healing };
  }

  return { kind, ...damagePreview(enemy.stats, defenderStats, kind) };
}

function assertNonNegativeFinite(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label} must be finite and non-negative.`);
  }
}

function assertEnemyState(enemy: EnemyState): void {
  if (
    !Object.values(enemy.stats).every((value) => Number.isFinite(value) && value >= 0) ||
    enemy.stats.health <= 0
  ) {
    throw new RangeError('Enemy stats must be finite and non-negative with positive health.');
  }
  if (!Number.isSafeInteger(enemy.potions) || enemy.potions < 0) {
    throw new RangeError('Enemy potions must be a non-negative safe integer.');
  }
  if (
    !Number.isFinite(enemy.damageTaken) ||
    enemy.damageTaken < 0 ||
    enemy.damageTaken > enemy.stats.health
  ) {
    throw new RangeError('Enemy damage must be within its health bounds.');
  }
}

export function determineFirstActor(playerSpeed: number, enemySpeed: number): 'player' | 'enemy' {
  assertNonNegativeFinite(playerSpeed, 'Player speed');
  assertNonNegativeFinite(enemySpeed, 'Enemy speed');
  return playerSpeed > enemySpeed ? 'player' : 'enemy';
}

/** Preserves the legacy enemy action policy until gameplay balance is reviewed. */
export function chooseEnemyAction(enemy: EnemyState, roll: number): CombatAction {
  assertEnemyState(enemy);
  if (!Number.isFinite(roll) || roll < 0 || roll >= 1) {
    throw new RangeError('Random rolls must be in the range [0, 1).');
  }

  const healthRatio = (enemy.stats.health - enemy.damageTaken) / enemy.stats.health;

  if (!enemy.potions || healthRatio >= 0.6) {
    return roll <= 0.5 ? 'attack' : 'magic';
  }

  if (healthRatio <= 0.1) return 'heal';
  if (roll <= 0.33) return 'attack';
  if (roll <= 0.66) return 'magic';
  return 'heal';
}

export interface HealResult {
  readonly action: 'heal';
  readonly healed: number;
  readonly damageTaken: number;
}

/** Healing is capped at a percentage of maximum health and never exceeds missing health. */
export function resolveHeal(
  damageTaken: number,
  maximumHealth: number,
  healingFraction = 0.25,
): HealResult {
  if (
    !Number.isFinite(damageTaken) ||
    damageTaken < 0 ||
    !Number.isFinite(maximumHealth) ||
    maximumHealth <= 0 ||
    !Number.isFinite(healingFraction) ||
    healingFraction < 0 ||
    healingFraction > 1
  ) {
    throw new RangeError('Healing inputs must be finite and within their valid ranges.');
  }

  const healed = Math.min(damageTaken, Math.trunc(maximumHealth * healingFraction));
  return { action: 'heal', healed, damageTaken: Math.max(0, damageTaken - healed) };
}

export type ActionResult = DamageResult | HealResult;

export function resolveAction(
  attacker: Pick<Combatant, 'stats'>,
  attackerDamageTaken: number,
  defender: Combatant,
  action: CombatAction,
  rolls: { readonly damageRoll: number; readonly chanceRoll: number },
  modifiers: DamageModifiers = {},
): ActionResult {
  if (action !== 'attack' && action !== 'magic' && action !== 'heal') {
    throw new RangeError('Combat action must be attack, magic, or heal.');
  }
  return action === 'heal'
    ? resolveHeal(attackerDamageTaken, attacker.stats.health)
    : resolveDamage(attacker, defender, action, rolls, modifiers);
}
