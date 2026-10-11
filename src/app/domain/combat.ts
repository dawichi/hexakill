import {
  SAMURAI_CRITICAL_BONUS,
  WARRIOR_GUARD_MULTIPLIER,
  WARRIOR_RETALIATION,
  WIZARD_MAGIC_PENETRATION,
} from './characters';
import { damageRange, guardBlock, healAmount, resolveDamage } from './combat-rules';
import { BossId, EnemyState, enemyRemainingHealth, findEnemyDefinition } from './enemies';
import { DamageKind, Side } from './game-types';
import { hasRelic, PlayerState, remainingHealth } from './player';
import { Rng } from './random';
import { RELICS, RelicId } from './relics';

export type PlayerAction = 'attack' | 'magic' | 'guard' | 'potion';
export type CombatPhase = 'player-turn' | 'victory' | 'defeat';

/** What the enemy will do on its next turn. Damage moves may strike several times. */
export interface EnemyMove {
  readonly kind: DamageKind | 'guard' | 'heal' | 'charge';
  readonly hits: number;
  readonly multiplier: number;
  /** Named boss techniques; regular moves have no label. */
  readonly label?: string;
}

export interface CombatCounters {
  readonly playerActions: number;
  readonly damagingActions: number;
  readonly attacks: number;
  readonly potionUses: number;
  readonly enemyDamageActions: number;
}

export interface CombatState {
  readonly phase: CombatPhase;
  readonly enemy: EnemyState;
  readonly opening: Side;
  /** Enemy turns completed so far; drives enemy patterns. */
  readonly turn: number;
  readonly intent: EnemyMove | null;
  readonly playerBlock: number;
  readonly enemyBlock: number;
  readonly enemyHexed: boolean;
  readonly enemyVenom: number;
  readonly enemyCharged: boolean;
  readonly counters: CombatCounters;
  readonly arcaneBatteryUsed: boolean;
  readonly bloodLedgerUsed: boolean;
}

/** The visible numbers right after an event, so the UI can replay a turn step by step. */
export interface CombatSnapshot {
  readonly playerHealth: number;
  readonly playerMaxHealth: number;
  readonly playerBlock: number;
  readonly potions: number;
  readonly enemyHealth: number;
  readonly enemyMaxHealth: number;
  readonly enemyBlock: number;
  readonly enemyHexed: boolean;
  readonly enemyVenom: number;
  readonly enemyCharged: boolean;
  readonly intent: EnemyMove | null;
}

export type EffectSource =
  | 'venom'
  | 'retaliation'
  | Extract<RelicId, 'soot-charm' | 'thornmail' | 'crown-of-thorns' | 'mirror-of-night'>;

export type CombatEventBody =
  | { readonly type: 'combat-start'; readonly opening: Side }
  | {
      readonly type: 'action';
      readonly actor: Side;
      readonly action: EnemyMove['kind'] | PlayerAction;
      readonly label?: string;
    }
  | {
      readonly type: 'hit';
      readonly target: Side;
      readonly kind: DamageKind;
      readonly amount: number;
      readonly blocked: number;
      readonly critical: boolean;
      readonly missed: boolean;
    }
  | {
      readonly type: 'effect-damage';
      readonly target: Side;
      readonly amount: number;
      readonly source: EffectSource;
    }
  | {
      readonly type: 'block';
      readonly target: Side;
      readonly amount: number;
      readonly source: 'guard' | RelicId;
    }
  | {
      readonly type: 'heal';
      readonly target: Side;
      readonly amount: number;
      readonly source: 'potion' | RelicId;
    }
  | {
      readonly type: 'status';
      readonly target: Side;
      readonly status: 'hex' | 'hex-consumed' | 'venom' | 'charged' | 'cleansed';
      readonly amount?: number;
    }
  | { readonly type: 'relic'; readonly relicId: RelicId; readonly note: string }
  | { readonly type: 'victory' }
  | { readonly type: 'defeat' };

export type CombatEvent = CombatEventBody & { readonly snapshot: CombatSnapshot };

export interface CombatOutcome {
  readonly player: PlayerState;
  readonly combat: CombatState;
  readonly events: readonly CombatEvent[];
}

export const POTION_HEAL = 0.25;
export const ENEMY_POTION_HEAL = 0.25;
export const ARCANE_MARK_BONUS = 0.25;
/** Enemies drink a potion when their health falls to this share or less. */
const ENEMY_HEAL_THRESHOLD = 0.22;

const NO_COUNTERS: CombatCounters = {
  playerActions: 0,
  damagingActions: 0,
  attacks: 0,
  potionUses: 0,
  enemyDamageActions: 0,
};

const move = (kind: EnemyMove['kind'], extra: Partial<EnemyMove> = {}): EnemyMove => ({
  kind,
  hits: 1,
  multiplier: 1,
  ...extra,
});

/* ---------------------------------------------------------------- enemy AI */

function bossMove(
  id: BossId,
  rng: Rng,
  enemy: EnemyState,
  turn: number,
  charged: boolean,
): EnemyMove {
  const healthRatio = enemyRemainingHealth(enemy) / enemy.stats.health;
  switch (id) {
    case 'fire-knight':
      if (charged) return move('attack', { multiplier: 2.2, label: 'Inferno Strike' });
      if (turn % 3 === 2) return move('charge', { label: 'Stoke the Flames' });
      return move(rng.next() < 0.7 ? 'attack' : 'magic');
    case 'water-priestess':
      if (turn % 3 === 1)
        return move('magic', { hits: 3, multiplier: 0.45, label: 'Tidal Barrage' });
      return move(rng.next() < 0.75 ? 'magic' : 'attack');
    case 'bringer-of-death':
      if (healthRatio <= 0.5) {
        return charged
          ? move('magic', { multiplier: 2.5, label: "Death's Toll" })
          : move('charge', { label: 'The Bell Tolls' });
      }
      if (turn % 3 === 2)
        return move('attack', { hits: 2, multiplier: 0.65, label: 'Reaping Scythe' });
      return move(rng.next() < 0.5 ? 'attack' : 'magic');
  }
}

export function chooseEnemyMove(
  rng: Rng,
  enemy: EnemyState,
  turn: number,
  charged: boolean,
): EnemyMove {
  const definition = findEnemyDefinition(enemy.id);
  const roll = rng.next();
  if (definition.archetype === 'boss' && charged) {
    return bossMove(definition.id as BossId, rng, enemy, turn, charged);
  }
  if (
    enemy.potions > 0 &&
    enemyRemainingHealth(enemy) <= enemy.stats.health * ENEMY_HEAL_THRESHOLD
  ) {
    return move('heal');
  }
  switch (definition.archetype) {
    case 'boss':
      return bossMove(definition.id as BossId, rng, enemy, turn, charged);
    case 'ad':
      return move(roll < 0.8 ? 'attack' : 'magic');
    case 'ap':
      if (turn % 4 === 2) return move('guard');
      return move(roll < 0.8 ? 'magic' : 'attack');
    case 'tank':
      if (turn % 3 === 2) return move('guard');
      return move(roll < 0.7 ? 'attack' : 'magic');
    case 'basic':
      return move(roll < 0.5 ? 'attack' : 'magic');
  }
}

/** The range an intent will show: per-hit damage, Block raised, or Health restored. */
export function intentRange(
  intent: EnemyMove,
  enemy: EnemyState,
  player: PlayerState,
): readonly [number, number] {
  switch (intent.kind) {
    case 'attack':
    case 'magic':
      return damageRange(enemy.stats, player.stats, intent.kind, {
        damageMultiplier: intent.multiplier,
      });
    case 'guard': {
      const block = guardBlock(enemy.stats);
      return [block, block];
    }
    case 'heal': {
      const healed = healAmount(enemy.damageTaken, enemy.stats.health, ENEMY_POTION_HEAL);
      return [healed, healed];
    }
    case 'charge':
      return [0, 0];
  }
}

/* ---------------------------------------------------------- player rules */

interface PlayerDamageBonus {
  readonly multiplier: number;
  readonly guaranteedHit: boolean;
}

function relicParams<Id extends RelicId>(id: Id): (typeof RELICS)[Id]['params'] {
  return RELICS[id].params;
}

function playerDamageBonus(
  player: PlayerState,
  combat: CombatState,
  kind: DamageKind,
): PlayerDamageBonus {
  const counters = combat.counters;
  const first = counters.damagingActions === 0;
  const opened = combat.opening === 'player';
  let multiplier = 1;
  let guaranteedHit = false;
  const has = (id: RelicId) => hasRelic(player, id);

  if (kind === 'attack' && has('honed-edge')) multiplier *= 1 + relicParams('honed-edge').bonus;
  if (kind === 'magic' && has('apprentices-codex')) {
    multiplier *= 1 + relicParams('apprentices-codex').bonus;
  }
  if (kind === 'attack' && combat.enemyHexed) {
    multiplier *=
      1 + (has('hexglass-prism') ? relicParams('hexglass-prism').markBonus : ARCANE_MARK_BONUS);
  }
  if (
    has('emberheart') &&
    remainingHealth(player) < player.stats.health * relicParams('emberheart').threshold
  ) {
    multiplier *= 1 + relicParams('emberheart').bonus;
  }
  if (kind === 'attack' && has('echoing-blade')) {
    const { every, bonus } = relicParams('echoing-blade');
    if ((counters.attacks + 1) % every === 0) multiplier *= 1 + bonus;
  }
  if (has('infinite-edge')) {
    const { every, bonus } = relicParams('infinite-edge');
    if ((counters.damagingActions + 1) % every === 0) multiplier *= 1 + bonus;
  }
  if (has('the-hourglass') && counters.playerActions < relicParams('the-hourglass').turns) {
    multiplier *= 1 + relicParams('the-hourglass').bonus;
  }
  if (first && opened && has('war-drums')) multiplier *= 1 + relicParams('war-drums').bonus;
  if (first && opened && has('oath-of-first-strike')) {
    multiplier *= 1 + relicParams('oath-of-first-strike').bonus;
    guaranteedHit = true;
  }
  if (first && has('ritual-bell')) multiplier *= 1 - relicParams('ritual-bell').penalty;
  return { multiplier, guaranteedHit };
}

function playerPenetration(player: PlayerState, kind: DamageKind): number {
  return player.characterId === 'wizard' && kind === 'magic' ? WIZARD_MAGIC_PENETRATION : 0;
}

function playerCriticalBonus(player: PlayerState, kind: DamageKind): number {
  return player.characterId === 'samurai' && kind === 'attack' ? SAMURAI_CRITICAL_BONUS : 0;
}

export function playerGuardBlock(player: PlayerState): number {
  const classBonus = player.characterId === 'warrior' ? WARRIOR_GUARD_MULTIPLIER : 1;
  const relicBonus = hasRelic(player, 'guarders-buckler')
    ? 1 + relicParams('guarders-buckler').bonus
    : 1;
  return guardBlock(player.stats, classBonus * relicBonus);
}

export function potionHeal(player: PlayerState): number {
  const fraction = hasRelic(player, 'alchemists-crown')
    ? relicParams('alchemists-crown').heal
    : POTION_HEAL;
  return healAmount(player.damageTaken, player.stats.health, fraction);
}

/** Damage range of the player's next Attack or Magic, before Block, crits, and misses. */
export function playerDamagePreview(
  player: PlayerState,
  combat: CombatState,
  kind: DamageKind,
): readonly [number, number] {
  return damageRange(player.stats, combat.enemy.stats, kind, {
    damageMultiplier: playerDamageBonus(player, combat, kind).multiplier,
    resistancePenetration: playerPenetration(player, kind),
  });
}

function playerActsFirst(player: PlayerState, enemy: EnemyState): boolean {
  return (
    player.stats.speed > enemy.stats.speed ||
    (player.stats.speed === enemy.stats.speed && player.characterId === 'samurai')
  );
}

/** The visible combat numbers for a player and combat state. */
export function combatSnapshot(player: PlayerState, combat: CombatState): CombatSnapshot {
  return {
    playerHealth: remainingHealth(player),
    playerMaxHealth: player.stats.health,
    playerBlock: combat.playerBlock,
    potions: player.potions,
    enemyHealth: enemyRemainingHealth(combat.enemy),
    enemyMaxHealth: combat.enemy.stats.health,
    enemyBlock: combat.enemyBlock,
    enemyHexed: combat.enemyHexed,
    enemyVenom: combat.enemyVenom,
    enemyCharged: combat.enemyCharged,
    intent: combat.intent,
  };
}

/* ---------------------------------------------------------------- engine */

/** Mutable working copy for one resolution step; never escapes this module. */
class Resolution {
  readonly events: CombatEvent[] = [];
  player: PlayerState;
  combat: CombatState;

  constructor(
    readonly rng: Rng,
    player: PlayerState,
    combat: CombatState,
  ) {
    this.player = player;
    this.combat = combat;
  }

  get enemy(): EnemyState {
    return this.combat.enemy;
  }

  set(changes: Partial<CombatState>): void {
    this.combat = { ...this.combat, ...changes };
  }

  count(changes: Partial<CombatCounters>): void {
    this.set({ counters: { ...this.combat.counters, ...changes } });
  }

  emit(event: CombatEventBody): void {
    this.events.push({ ...event, snapshot: combatSnapshot(this.player, this.combat) });
  }

  damageEnemy(amount: number, source: EffectSource): void {
    if (amount <= 0 || this.over) return;
    const enemy = this.enemy;
    this.set({
      enemy: { ...enemy, damageTaken: Math.min(enemy.stats.health, enemy.damageTaken + amount) },
    });
    this.emit({ type: 'effect-damage', target: 'enemy', amount, source });
    this.checkEnd();
  }

  healPlayer(amount: number, source: 'potion' | RelicId): void {
    this.player = { ...this.player, damageTaken: Math.max(0, this.player.damageTaken - amount) };
    this.emit({ type: 'heal', target: 'player', amount, source });
  }

  addPlayerBlock(amount: number, source: 'guard' | RelicId): void {
    if (amount <= 0) return;
    this.set({ playerBlock: this.combat.playerBlock + amount });
    this.emit({ type: 'block', target: 'player', amount, source });
  }

  get over(): boolean {
    return this.combat.phase !== 'player-turn';
  }

  checkEnd(): void {
    if (this.over) return;
    if (enemyRemainingHealth(this.enemy) <= 0) {
      this.set({ phase: 'victory', intent: null });
      this.emit({ type: 'victory' });
    } else if (remainingHealth(this.player) <= 0) {
      this.set({ phase: 'defeat', intent: null });
      this.emit({ type: 'defeat' });
    }
  }

  outcome(): CombatOutcome {
    return { player: this.player, combat: this.combat, events: this.events };
  }
}

function resolvePlayerStrike(r: Resolution, kind: DamageKind): void {
  const player = r.player;
  const bonus = playerDamageBonus(player, r.combat, kind);
  const result = resolveDamage(player.stats, r.enemy.stats, kind, r.rng.next(), r.rng.next(), {
    damageMultiplier: bonus.multiplier,
    resistancePenetration: playerPenetration(player, kind),
    criticalChanceBonus: playerCriticalBonus(player, kind),
    guaranteedHit: bonus.guaranteedHit,
    block: r.combat.enemyBlock,
  });
  const enemy = r.enemy;
  const wasHexed = r.combat.enemyHexed;
  r.set({
    enemy: {
      ...enemy,
      damageTaken: Math.min(enemy.stats.health, enemy.damageTaken + result.dealt),
    },
    enemyBlock: r.combat.enemyBlock - result.blocked,
  });
  r.count({
    damagingActions: r.combat.counters.damagingActions + 1,
    attacks: r.combat.counters.attacks + (kind === 'attack' ? 1 : 0),
  });
  if (kind === 'attack' && wasHexed) r.set({ enemyHexed: false });
  r.emit({
    type: 'hit',
    target: 'enemy',
    kind,
    amount: result.dealt,
    blocked: result.blocked,
    critical: result.critical,
    missed: result.missed,
  });
  if (kind === 'attack' && wasHexed) {
    r.emit({ type: 'status', target: 'enemy', status: 'hex-consumed' });
  }
  r.checkEnd();
  if (r.over || kind !== 'magic' || result.dealt <= 0) return;

  if (!wasHexed) {
    r.set({ enemyHexed: true });
    r.emit({ type: 'status', target: 'enemy', status: 'hex' });
  }
  if (hasRelic(player, 'hexglass-prism')) {
    r.addPlayerBlock(
      Math.round(result.dealt * relicParams('hexglass-prism').share),
      'hexglass-prism',
    );
  }
  if (hasRelic(player, 'arcane-battery') && !r.combat.arcaneBatteryUsed) {
    r.set({ arcaneBatteryUsed: true });
    r.addPlayerBlock(
      Math.round(result.dealt * relicParams('arcane-battery').share),
      'arcane-battery',
    );
  }
  if (hasRelic(player, 'venom-vial')) {
    const venom = relicParams('venom-vial').venom;
    r.set({ enemyVenom: r.combat.enemyVenom + venom });
    r.emit({ type: 'status', target: 'enemy', status: 'venom', amount: venom });
  }
}

/** Returns true when the action ends the player's turn. */
function resolvePlayerAction(r: Resolution, action: PlayerAction): boolean {
  const counters = r.combat.counters;
  r.emit({ type: 'action', actor: 'player', action });
  r.count({ playerActions: counters.playerActions + 1 });
  switch (action) {
    case 'attack':
    case 'magic':
      resolvePlayerStrike(r, action);
      return true;
    case 'guard':
      r.addPlayerBlock(playerGuardBlock(r.player), 'guard');
      return true;
    case 'potion': {
      const firstPotion = counters.potionUses === 0;
      const healed = potionHeal(r.player);
      r.player = { ...r.player, potions: r.player.potions - 1 };
      r.count({ potionUses: counters.potionUses + 1 });
      r.healPlayer(healed, 'potion');
      if (firstPotion && hasRelic(r.player, 'potion-satchel')) {
        r.addPlayerBlock(
          Math.round(healed * relicParams('potion-satchel').share),
          'potion-satchel',
        );
      }
      if (firstPotion && hasRelic(r.player, 'alchemists-crown')) {
        r.emit({
          type: 'relic',
          relicId: 'alchemists-crown',
          note: 'The potion did not end your turn.',
        });
        return false;
      }
      return true;
    }
  }
}

function resolveEnemyStrike(r: Resolution, intent: EnemyMove & { kind: DamageKind }): void {
  const has = (id: RelicId) => hasRelic(r.player, id);
  const lantern = has('void-lantern') && r.combat.counters.enemyDamageActions === 0;
  r.count({ enemyDamageActions: r.combat.counters.enemyDamageActions + 1 });
  let totalBlocked = 0;

  for (let hit = 0; hit < intent.hits && !r.over; hit += 1) {
    const result = resolveDamage(
      r.enemy.stats,
      r.player.stats,
      intent.kind,
      r.rng.next(),
      r.rng.next(),
      {
        damageMultiplier: intent.multiplier,
        receivedDamageMultiplier: lantern ? 1 - relicParams('void-lantern').reduction : 1,
        block: r.combat.playerBlock,
      },
    );
    totalBlocked += result.blocked;
    const healthBefore = remainingHealth(r.player);
    let dealt = result.dealt;
    let phoenix = false;
    if (dealt >= healthBefore && has('phoenix-feather')) {
      dealt = healthBefore - 1;
      phoenix = true;
    }
    r.player = { ...r.player, damageTaken: r.player.damageTaken + dealt };
    r.set({ playerBlock: r.combat.playerBlock - result.blocked });
    r.emit({
      type: 'hit',
      target: 'player',
      kind: intent.kind,
      amount: dealt,
      blocked: result.blocked,
      critical: result.critical,
      missed: result.missed,
    });

    if (phoenix) {
      r.player = { ...r.player, relics: r.player.relics.filter((id) => id !== 'phoenix-feather') };
      r.emit({
        type: 'relic',
        relicId: 'phoenix-feather',
        note: 'The Phoenix Feather burned away and kept you standing.',
      });
      r.healPlayer(
        healAmount(
          r.player.damageTaken,
          r.player.stats.health,
          relicParams('phoenix-feather').heal,
        ),
        'phoenix-feather',
      );
    }
    r.checkEnd();
    if (r.over) break;

    const ledger = relicParams('blood-ledger');
    if (
      dealt > 0 &&
      has('blood-ledger') &&
      !r.combat.bloodLedgerUsed &&
      remainingHealth(r.player) < r.player.stats.health * ledger.threshold
    ) {
      r.set({ bloodLedgerUsed: true });
      r.healPlayer(
        healAmount(r.player.damageTaken, r.player.stats.health, ledger.heal),
        'blood-ledger',
      );
    }
    if (r.player.characterId === 'warrior' && result.blocked > 0) {
      r.damageEnemy(Math.round(result.blocked * WARRIOR_RETALIATION), 'retaliation');
    }
    if (intent.kind === 'magic' && dealt > 0 && has('mirror-of-night')) {
      r.damageEnemy(Math.trunc(dealt * relicParams('mirror-of-night').reflect), 'mirror-of-night');
    }
  }

  if (r.over || totalBlocked <= 0) return;
  if (has('thornmail')) {
    r.damageEnemy(Math.round(totalBlocked * relicParams('thornmail').share), 'thornmail');
  }
  const crown = relicParams('crown-of-thorns');
  if (has('crown-of-thorns') && totalBlocked >= r.player.stats.health * crown.threshold) {
    r.damageEnemy(Math.round(totalBlocked * crown.share), 'crown-of-thorns');
    if (!r.over) {
      r.set({ enemyVenom: r.combat.enemyVenom + crown.venom });
      r.emit({ type: 'status', target: 'enemy', status: 'venom', amount: crown.venom });
    }
  }
}

function resolveEnemyTurn(r: Resolution): void {
  // Block lasts until the start of its owner's next turn.
  r.set({ enemyBlock: 0 });
  if (hasRelic(r.player, 'soot-charm')) {
    r.damageEnemy(Math.round(r.enemy.stats.health * relicParams('soot-charm').share), 'soot-charm');
  }
  const venom = r.combat.enemyVenom;
  if (venom > 0 && !r.over) {
    r.set({ enemyVenom: venom - 1 });
    r.damageEnemy(venom, 'venom');
  }
  if (r.over) return;

  const intent =
    r.combat.intent ?? chooseEnemyMove(r.rng, r.enemy, r.combat.turn, r.combat.enemyCharged);
  r.emit({
    type: 'action',
    actor: 'enemy',
    action: intent.kind,
    ...(intent.label ? { label: intent.label } : {}),
  });

  switch (intent.kind) {
    case 'attack':
    case 'magic':
      if (intent.label === 'Tidal Barrage' && (r.combat.enemyHexed || r.combat.enemyVenom > 0)) {
        r.set({ enemyHexed: false, enemyVenom: 0 });
        r.emit({ type: 'status', target: 'enemy', status: 'cleansed' });
      }
      if (r.combat.enemyCharged) r.set({ enemyCharged: false });
      resolveEnemyStrike(r, { ...intent, kind: intent.kind });
      break;
    case 'guard': {
      const block = guardBlock(r.enemy.stats);
      r.set({ enemyBlock: Math.max(r.combat.enemyBlock, block) });
      r.emit({ type: 'block', target: 'enemy', amount: block, source: 'guard' });
      break;
    }
    case 'heal': {
      const enemy = r.enemy;
      const healed = healAmount(enemy.damageTaken, enemy.stats.health, ENEMY_POTION_HEAL);
      r.set({
        enemy: {
          ...enemy,
          damageTaken: enemy.damageTaken - healed,
          potions: Math.max(0, enemy.potions - 1),
        },
      });
      r.emit({ type: 'heal', target: 'enemy', amount: healed, source: 'potion' });
      break;
    }
    case 'charge':
      r.set({ enemyCharged: true });
      r.emit({ type: 'status', target: 'enemy', status: 'charged' });
      break;
  }
  if (r.over) return;

  const turn = r.combat.turn + 1;
  r.set({
    turn,
    playerBlock: 0,
    intent: chooseEnemyMove(r.rng, r.enemy, turn, r.combat.enemyCharged),
  });
}

export function startCombat(rng: Rng, player: PlayerState, enemy: EnemyState): CombatOutcome {
  const opening: Side = playerActsFirst(player, enemy) ? 'player' : 'enemy';
  const combat: CombatState = {
    phase: 'player-turn',
    enemy,
    opening,
    turn: 0,
    intent: null,
    playerBlock: 0,
    enemyBlock: 0,
    enemyHexed: false,
    enemyVenom: 0,
    enemyCharged: false,
    counters: NO_COUNTERS,
    arcaneBatteryUsed: false,
    bloodLedgerUsed: false,
  };
  const r = new Resolution(rng, player, combat);
  r.set({ intent: chooseEnemyMove(rng, enemy, 0, false) });
  r.emit({ type: 'combat-start', opening });
  if (hasRelic(player, 'ritual-bell')) {
    r.addPlayerBlock(
      Math.round(player.stats.health * relicParams('ritual-bell').block),
      'ritual-bell',
    );
  }
  if (opening === 'enemy') resolveEnemyTurn(r);
  return r.outcome();
}

export function canUseAction(
  player: PlayerState,
  combat: CombatState,
  action: PlayerAction,
): boolean {
  if (combat.phase !== 'player-turn') return false;
  return action !== 'potion' || player.potions > 0;
}

/**
 * Resolve one player action and, unless it was free, the enemy's whole response. All rolls are
 * consumed here, so the returned state can be persisted before anything is animated.
 */
export function act(
  rng: Rng,
  player: PlayerState,
  combat: CombatState,
  action: PlayerAction,
): CombatOutcome {
  if (!canUseAction(player, combat, action)) return { player, combat, events: [] };
  const r = new Resolution(rng, player, combat);
  const endsTurn = resolvePlayerAction(r, action);
  if (endsTurn && !r.over) resolveEnemyTurn(r);
  return r.outcome();
}
