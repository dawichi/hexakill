import { DamageKind, DamageResult } from './combat-rules';
import { EnemyState } from './game-types';

export type CombatPhase =
  | 'idle'
  | 'awaiting-player-action'
  | 'resolving-player-action'
  | 'enemy-turn'
  | 'victory'
  | 'defeat';

export type PlayerCombatAction = DamageKind | 'guard';
export type EnemyIntentKind = DamageKind | 'guard' | 'heal';

export interface EnemyIntent {
  readonly kind: EnemyIntentKind;
  readonly minValue: number;
  readonly maxValue: number;
}

export interface CombatState {
  readonly phase: CombatPhase;
  readonly enemy: EnemyState | null;
  readonly playerDamageTaken: number;
  readonly pendingAction: PlayerCombatAction | null;
  readonly lastResult: DamageResult | null;
  /** Optional fields keep persisted v1 sessions and focused fixtures restorable. */
  readonly enemyIntent?: EnemyIntent | null;
  readonly playerBlock?: number;
  readonly enemyBlock?: number;
  readonly enemyHexed?: boolean;
  readonly turn?: number;
  readonly playerActions?: number;
  readonly damagingActions?: number;
  readonly attackCount?: number;
  readonly magicActions?: number;
  readonly potionUses?: number;
  readonly enemyDamageActions?: number;
  readonly enemyVenom?: number;
  readonly openingActor?: 'player' | 'enemy' | null;
  readonly relicFlags?: Readonly<Record<string, boolean>>;
}

export type CombatEvent =
  | { readonly type: 'enemy-spawned'; readonly enemy: EnemyState }
  | { readonly type: 'player-action-started'; readonly kind: PlayerCombatAction }
  | { readonly type: 'player-potion-used'; readonly freeTurn?: boolean }
  | { readonly type: 'player-action-resolved'; readonly result: DamageResult }
  | { readonly type: 'player-guard-resolved'; readonly block: number }
  | { readonly type: 'enemy-turn-started' }
  | {
      readonly type: 'enemy-action-resolved';
      readonly playerDamageTaken: number;
      readonly playerHealth: number;
      readonly playerBlock?: number;
      readonly enemyIntent?: EnemyIntent | null;
      readonly turn?: number;
      readonly allowPlayerHealing?: boolean;
    }
  | { readonly type: 'reset' };

export type CombatTransition =
  | { readonly accepted: true; readonly state: CombatState }
  | { readonly accepted: false; readonly state: CombatState; readonly reason: string };

export const INITIAL_COMBAT_STATE: CombatState = {
  phase: 'idle',
  enemy: null,
  playerDamageTaken: 0,
  pendingAction: null,
  lastResult: null,
  enemyIntent: null,
  playerBlock: 0,
  enemyBlock: 0,
  enemyHexed: false,
  turn: 0,
  playerActions: 0,
  damagingActions: 0,
  attackCount: 0,
  magicActions: 0,
  potionUses: 0,
  enemyDamageActions: 0,
  enemyVenom: 0,
  openingActor: null,
  relicFlags: {},
};

function rejected(state: CombatState, reason: string): CombatTransition {
  return { accepted: false, state, reason };
}

function isValidDamageResult(result: DamageResult, enemy: EnemyState): boolean {
  return (
    Number.isFinite(result.rawDamage) &&
    result.rawDamage >= 0 &&
    Number.isFinite(result.damageAfterResistance) &&
    result.damageAfterResistance >= 0 &&
    typeof result.critical === 'boolean' &&
    typeof result.missed === 'boolean' &&
    (result.blocked === undefined || (Number.isFinite(result.blocked) && result.blocked >= 0)) &&
    Number.isFinite(result.damageTaken) &&
    result.damageTaken >= enemy.damageTaken &&
    result.damageTaken <= enemy.stats.health
  );
}

function isDefeatedEnemy(enemy: EnemyState): boolean {
  return enemy.damageTaken >= enemy.stats.health;
}

function isLiveEnemy(enemy: EnemyState): boolean {
  return !isDefeatedEnemy(enemy);
}

function isDamageKind(value: unknown): value is DamageKind {
  return value === 'attack' || value === 'magic';
}

function isPlayerCombatAction(value: unknown): value is PlayerCombatAction {
  return isDamageKind(value) || value === 'guard';
}

export function isEnemyIntent(value: unknown): value is EnemyIntent {
  if (typeof value !== 'object' || value === null) return false;
  const intent = value as EnemyIntent;
  return (
    (isDamageKind(intent.kind) || intent.kind === 'guard' || intent.kind === 'heal') &&
    Number.isFinite(intent.minValue) &&
    intent.minValue >= 0 &&
    Number.isFinite(intent.maxValue) &&
    intent.maxValue >= intent.minValue
  );
}

export function transitionCombat(state: CombatState, event: CombatEvent): CombatTransition {
  if (event.type === 'reset') {
    return { accepted: true, state: INITIAL_COMBAT_STATE };
  }

  if (event.type === 'enemy-spawned') {
    if (state.phase !== 'idle' && state.phase !== 'victory') {
      return rejected(state, 'An enemy cannot spawn during an active combat.');
    }

    if (
      (state.phase === 'idle' && state.enemy !== null) ||
      (state.phase === 'victory' && (!state.enemy || !isDefeatedEnemy(state.enemy)))
    ) {
      return rejected(state, 'An enemy can only spawn from a coherent terminal boundary.');
    }

    return {
      accepted: true,
      state: {
        phase: 'awaiting-player-action',
        enemy: event.enemy,
        playerDamageTaken: state.phase === 'victory' ? state.playerDamageTaken : 0,
        pendingAction: null,
        lastResult: null,
        enemyIntent: null,
        playerBlock: 0,
        enemyBlock: 0,
        enemyHexed: false,
        turn: 0,
        playerActions: 0,
        damagingActions: 0,
        attackCount: 0,
        magicActions: 0,
        potionUses: 0,
        enemyDamageActions: 0,
        enemyVenom: 0,
        openingActor: null,
        relicFlags: {},
      },
    };
  }

  if (event.type === 'player-action-started') {
    if (
      !isPlayerCombatAction(event.kind) ||
      state.phase !== 'awaiting-player-action' ||
      !state.enemy ||
      !isLiveEnemy(state.enemy)
    ) {
      return rejected(state, 'A player action is not available in the current combat phase.');
    }

    return {
      accepted: true,
      state: {
        ...state,
        phase: 'resolving-player-action',
        pendingAction: event.kind,
        lastResult: null,
      },
    };
  }

  if (event.type === 'enemy-turn-started') {
    if (state.phase !== 'awaiting-player-action' || !state.enemy || !isLiveEnemy(state.enemy)) {
      return rejected(state, 'The enemy turn is not available in the current combat phase.');
    }

    return { accepted: true, state: { ...state, phase: 'enemy-turn' } };
  }

  if (event.type === 'player-potion-used') {
    if (state.phase !== 'awaiting-player-action' || !state.enemy || !isLiveEnemy(state.enemy)) {
      return rejected(state, 'A potion cannot be used in the current combat phase.');
    }

    return {
      accepted: true,
      state: {
        ...state,
        phase: event.freeTurn ? 'awaiting-player-action' : 'enemy-turn',
        pendingAction: null,
        lastResult: null,
      },
    };
  }

  if (event.type === 'player-guard-resolved') {
    if (
      state.phase !== 'resolving-player-action' ||
      state.pendingAction !== 'guard' ||
      !state.enemy ||
      !isLiveEnemy(state.enemy) ||
      !Number.isFinite(event.block) ||
      event.block < 0
    ) {
      return rejected(state, 'A Guard action requires an active combat and valid Block.');
    }

    return {
      accepted: true,
      state: {
        ...state,
        phase: 'enemy-turn',
        pendingAction: null,
        lastResult: null,
        playerBlock: (state.playerBlock ?? 0) + event.block,
      },
    };
  }

  if (event.type === 'enemy-action-resolved') {
    if (state.phase !== 'enemy-turn' || !state.enemy || !isLiveEnemy(state.enemy)) {
      return rejected(state, 'An enemy action cannot be resolved in the current combat phase.');
    }

    if (
      !Number.isFinite(event.playerDamageTaken) ||
      event.playerDamageTaken < 0 ||
      !Number.isFinite(event.playerHealth) ||
      event.playerHealth <= 0 ||
      (event.playerDamageTaken < state.playerDamageTaken && !event.allowPlayerHealing) ||
      event.playerDamageTaken > event.playerHealth ||
      (event.playerBlock !== undefined &&
        (!Number.isFinite(event.playerBlock) || event.playerBlock < 0)) ||
      (event.enemyIntent !== undefined &&
        event.enemyIntent !== null &&
        !isEnemyIntent(event.enemyIntent)) ||
      (event.turn !== undefined && (!Number.isSafeInteger(event.turn) || event.turn < 0))
    ) {
      return rejected(state, 'An enemy action requires valid player health values.');
    }

    return {
      accepted: true,
      state: {
        ...state,
        phase: event.playerDamageTaken >= event.playerHealth ? 'defeat' : 'awaiting-player-action',
        playerDamageTaken: Math.min(event.playerHealth, event.playerDamageTaken),
        playerBlock: Math.max(0, event.playerBlock ?? state.playerBlock ?? 0),
        enemyIntent: event.enemyIntent ?? state.enemyIntent ?? null,
        turn: event.turn ?? state.turn ?? 0,
      },
    };
  }

  if (state.phase !== 'resolving-player-action' || !state.enemy || !state.pendingAction) {
    return rejected(state, 'A player action cannot be resolved in the current combat phase.');
  }

  if (state.pendingAction === 'guard' || event.result.kind !== state.pendingAction) {
    return rejected(state, 'The resolved action does not match the pending action.');
  }

  if (!isValidDamageResult(event.result, state.enemy)) {
    return rejected(state, 'A player action requires a valid damage result.');
  }

  const defeated = event.result.damageTaken >= state.enemy.stats.health;
  const previousHexed = state.enemyHexed ?? false;
  const dealtDamage = event.result.damageAfterResistance - (event.result.blocked ?? 0);
  const nextHexed =
    event.result.kind === 'magic' && !event.result.missed && dealtDamage > 0
      ? true
      : event.result.kind === 'attack' && previousHexed
        ? false
        : previousHexed;

  return {
    accepted: true,
    state: {
      ...state,
      phase: defeated ? 'victory' : 'enemy-turn',
      enemy: { ...state.enemy, damageTaken: event.result.damageTaken },
      pendingAction: null,
      lastResult: event.result,
      enemyBlock: Math.max(0, (state.enemyBlock ?? 0) - (event.result.blocked ?? 0)),
      enemyHexed: nextHexed,
    },
  };
}
