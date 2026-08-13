import { DamageKind, DamageResult } from './combat-rules';
import { EnemyState } from './game-types';

export type CombatPhase = 'idle' | 'awaiting-player-action' | 'resolving-player-action' | 'victory';

export interface CombatState {
  readonly phase: CombatPhase;
  readonly enemy: EnemyState | null;
  readonly pendingAction: DamageKind | null;
  readonly lastResult: DamageResult | null;
}

export type CombatEvent =
  | { readonly type: 'enemy-spawned'; readonly enemy: EnemyState }
  | { readonly type: 'player-action-started'; readonly kind: DamageKind }
  | { readonly type: 'player-action-resolved'; readonly result: DamageResult }
  | { readonly type: 'reset' };

export type CombatTransition =
  | { readonly accepted: true; readonly state: CombatState }
  | { readonly accepted: false; readonly state: CombatState; readonly reason: string };

export const INITIAL_COMBAT_STATE: CombatState = {
  phase: 'idle',
  enemy: null,
  pendingAction: null,
  lastResult: null,
};

function rejected(state: CombatState, reason: string): CombatTransition {
  return { accepted: false, state, reason };
}

export function transitionCombat(state: CombatState, event: CombatEvent): CombatTransition {
  if (event.type === 'reset') {
    return { accepted: true, state: INITIAL_COMBAT_STATE };
  }

  if (event.type === 'enemy-spawned') {
    if (state.phase !== 'idle' && state.phase !== 'victory') {
      return rejected(state, 'An enemy cannot spawn during an active combat.');
    }

    return {
      accepted: true,
      state: {
        phase: 'awaiting-player-action',
        enemy: event.enemy,
        pendingAction: null,
        lastResult: null,
      },
    };
  }

  if (event.type === 'player-action-started') {
    if (state.phase !== 'awaiting-player-action' || !state.enemy) {
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

  if (state.phase !== 'resolving-player-action' || !state.enemy || !state.pendingAction) {
    return rejected(state, 'A player action cannot be resolved in the current combat phase.');
  }

  if (event.result.kind !== state.pendingAction) {
    return rejected(state, 'The resolved action does not match the pending action.');
  }

  const defeated = event.result.damageTaken >= state.enemy.stats.health;
  return {
    accepted: true,
    state: {
      ...state,
      phase: defeated ? 'victory' : 'awaiting-player-action',
      enemy: { ...state.enemy, damageTaken: event.result.damageTaken },
      pendingAction: null,
      lastResult: event.result,
    },
  };
}
