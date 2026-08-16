import { Combatant, DamageKind, DamageResult, resolveDamage } from './combat-rules';
import { EnemyState } from './game-types';

export type CombatAction = DamageKind | 'heal';

export function determineFirstActor(playerSpeed: number, enemySpeed: number): 'player' | 'enemy' {
  return playerSpeed > enemySpeed ? 'player' : 'enemy';
}

/** Preserves the legacy enemy action policy until gameplay balance is reviewed. */
export function chooseEnemyAction(enemy: EnemyState, roll: number): CombatAction {
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

/** The legacy implementation heals exactly 20% despite a 20–30% config range. */
export function resolveHeal(damageTaken: number): HealResult {
  if (!Number.isFinite(damageTaken) || damageTaken < 0) {
    throw new RangeError('Damage taken must be a finite non-negative number.');
  }

  const healed = Math.trunc(damageTaken * 0.2);
  return { action: 'heal', healed, damageTaken: Math.max(0, damageTaken - healed) };
}

export type ActionResult = DamageResult | HealResult;

export function resolveAction(
  attacker: Pick<Combatant, 'stats'>,
  attackerDamageTaken: number,
  defender: Combatant,
  action: CombatAction,
  rolls: { readonly damageRoll: number; readonly chanceRoll: number },
): ActionResult {
  return action === 'heal'
    ? resolveHeal(attackerDamageTaken)
    : resolveDamage(attacker, defender, action, rolls);
}
