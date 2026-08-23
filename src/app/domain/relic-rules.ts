import { DamageKind } from './combat-rules';
import { hasRelic } from './relics';
import { PlayerState } from './game-types';

export interface RelicCombatContext {
  readonly playerHealth: number;
  readonly playerDamageTaken: number;
  readonly playerActions: number;
  readonly damagingActions: number;
  readonly attackCount: number;
  readonly magicActions: number;
  readonly potionUses: number;
  readonly enemyDamageActions: number;
  readonly openingActor: 'player' | 'enemy' | null;
  readonly relicFlags?: Readonly<Record<string, boolean>>;
}

export interface RelicDamageRules {
  readonly damageMultiplier: number;
  readonly guaranteedHit: boolean;
}

export function relicDamageRules(
  player: PlayerState,
  kind: DamageKind,
  context: RelicCombatContext,
): RelicDamageRules {
  let damageMultiplier = 1;
  let guaranteedHit = false;

  if (kind === 'attack' && hasRelic(player, 'honed-edge')) damageMultiplier *= 1.1;
  if (kind === 'magic' && hasRelic(player, 'apprentices-codex')) damageMultiplier *= 1.1;
  if (hasRelic(player, 'emberheart') && context.playerDamageTaken >= context.playerHealth * 0.5) {
    damageMultiplier *= 1.2;
  }
  if (
    kind === 'attack' &&
    hasRelic(player, 'echoing-blade') &&
    (context.attackCount + 1) % 3 === 0
  ) {
    damageMultiplier *= 1.75;
  }
  if (
    hasRelic(player, 'war-drums') &&
    context.openingActor === 'player' &&
    context.damagingActions === 0
  ) {
    damageMultiplier *= 1.3;
  }
  if (hasRelic(player, 'the-hourglass') && context.playerActions < 3) {
    damageMultiplier *= 1.25;
  }
  if (hasRelic(player, 'infinite-edge') && (context.damagingActions + 1) % 4 === 0) {
    damageMultiplier *= 1.35;
  }
  if (
    hasRelic(player, 'oath-of-first-strike') &&
    context.openingActor === 'player' &&
    context.damagingActions === 0
  ) {
    damageMultiplier *= 1.5;
    guaranteedHit = true;
  }
  if (hasRelic(player, 'ritual-bell') && context.damagingActions === 0) {
    damageMultiplier *= 0.9;
  }

  return { damageMultiplier, guaranteedHit };
}

export function relicIncomingDamageMultiplier(
  player: PlayerState,
  context: RelicCombatContext,
): number {
  return hasRelic(player, 'void-lantern') && context.enemyDamageActions === 0 ? 0.5 : 1;
}

export function relicStartOfCombatBlock(player: PlayerState): number {
  return hasRelic(player, 'ritual-bell') ? 14 : 0;
}

export function relicGuardBonus(player: PlayerState): number {
  return hasRelic(player, 'guarders-buckler') ? 8 : 0;
}

export function relicPotionBlock(player: PlayerState, context: RelicCombatContext): number {
  return hasRelic(player, 'potion-satchel') && context.potionUses === 0 ? 6 : 0;
}

export function relicPotionIsFree(player: PlayerState, context: RelicCombatContext): boolean {
  return hasRelic(player, 'alchemists-crown') && context.potionUses === 0;
}

export function relicMagicBlock(player: PlayerState, context: RelicCombatContext): number {
  let block = 0;
  if (hasRelic(player, 'hexglass-prism')) block += 4;
  if (
    hasRelic(player, 'arcane-battery') &&
    context.magicActions === 0 &&
    !context.relicFlags?.['arcane-battery-used']
  ) {
    block += 10;
  }
  return block;
}

export function relicMagicVenom(player: PlayerState): number {
  return hasRelic(player, 'venom-vial') ? 5 : 0;
}

export function relicStartEnemyDamage(player: PlayerState): number {
  return hasRelic(player, 'soot-charm') ? 4 : 0;
}

export function relicThornsDamage(player: PlayerState, blocked: number): number {
  if (blocked <= 0) return 0;
  return hasRelic(player, 'thornmail') ? 6 : 0;
}

export function relicCrownOfThornsDamage(player: PlayerState, blocked: number): number {
  return hasRelic(player, 'crown-of-thorns') && blocked >= 20 ? 20 : 0;
}

export function relicCrownOfThornsVenom(player: PlayerState, blocked: number): number {
  return hasRelic(player, 'crown-of-thorns') && blocked >= 20 ? 3 : 0;
}

export function relicBloodLedgerHeal(player: PlayerState, context: RelicCombatContext): number {
  return hasRelic(player, 'blood-ledger') && context.playerDamageTaken >= context.playerHealth * 0.6
    ? Math.trunc(context.playerHealth * 0.12)
    : 0;
}

export function relicVictoryMaxHealthBonus(player: PlayerState): number {
  return hasRelic(player, 'dungeon-heart') ? 40 : 0;
}

export function relicLethalProtectionAvailable(player: PlayerState): boolean {
  return hasRelic(player, 'phoenix-feather') && (player.relicCharges?.['phoenix-feather'] ?? 0) > 0;
}

export function relicInitialCharges(player: PlayerState): Readonly<Record<string, number>> {
  return player.relicCharges ?? {};
}
