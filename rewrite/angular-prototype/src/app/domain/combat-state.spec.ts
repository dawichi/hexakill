import { describe, expect, it } from 'vitest';
import { DamageResult } from './combat-rules';
import { generateEnemy } from './enemies';
import { INITIAL_COMBAT_STATE, CombatState, transitionCombat } from './combat-state';

const enemy = generateEnemy(4, 0, 0);
const result: DamageResult = {
  kind: 'attack',
  rawDamage: 16,
  damageAfterResistance: 16,
  critical: false,
  missed: false,
  damageTaken: 16,
};

function activeState(): CombatState {
  return transitionCombat(INITIAL_COMBAT_STATE, { type: 'enemy-spawned', enemy }).state;
}

describe('combat state transitions', () => {
  it('moves from idle to an available player action', () => {
    const transition = transitionCombat(INITIAL_COMBAT_STATE, {
      type: 'enemy-spawned',
      enemy,
    });

    expect(transition.accepted).toBe(true);
    expect(transition.state.phase).toBe('awaiting-player-action');
    expect(transition.state.enemy?.definition.name).toBe('Slime Blue');
  });

  it('requires resolution after an action starts', () => {
    const transition = transitionCombat(activeState(), {
      type: 'player-action-started',
      kind: 'attack',
    });

    expect(transition.accepted).toBe(true);
    expect(transition.state.phase).toBe('resolving-player-action');
    expect(transition.state.pendingAction).toBe('attack');
  });

  it('returns to the player turn after a non-lethal action', () => {
    const started = transitionCombat(activeState(), {
      type: 'player-action-started',
      kind: 'attack',
    }).state;
    const resolved = transitionCombat(started, {
      type: 'player-action-resolved',
      result,
    });

    expect(resolved.accepted).toBe(true);
    expect(resolved.state.phase).toBe('enemy-turn');
    expect(resolved.state.enemy?.damageTaken).toBe(16);
  });

  it('returns to the player turn after the enemy acts', () => {
    const started = transitionCombat(activeState(), {
      type: 'player-action-started',
      kind: 'attack',
    }).state;
    const enemyTurn = transitionCombat(started, {
      type: 'player-action-resolved',
      result,
    }).state;
    const resolved = transitionCombat(enemyTurn, {
      type: 'enemy-action-resolved',
      playerDamageTaken: 12,
      playerHealth: 200,
    });

    expect(resolved.accepted).toBe(true);
    expect(resolved.state.phase).toBe('awaiting-player-action');
    expect(resolved.state.playerDamageTaken).toBe(12);
  });

  it('enters defeat when the enemy reduces player health to zero', () => {
    const started = transitionCombat(activeState(), {
      type: 'player-action-started',
      kind: 'attack',
    }).state;
    const enemyTurn = transitionCombat(started, {
      type: 'player-action-resolved',
      result,
    }).state;
    const resolved = transitionCombat(enemyTurn, {
      type: 'enemy-action-resolved',
      playerDamageTaken: 200,
      playerHealth: 200,
    });

    expect(resolved.state.phase).toBe('defeat');
  });

  it('rejects actions outside the player-action phase', () => {
    const transition = transitionCombat(INITIAL_COMBAT_STATE, {
      type: 'player-action-started',
      kind: 'magic',
    });

    expect(transition.accepted).toBe(false);
    if (transition.accepted) throw new Error('Expected the transition to be rejected.');
    expect(transition.reason).toContain('not available');
  });

  it('rejects a result for a different action kind', () => {
    const started = transitionCombat(activeState(), {
      type: 'player-action-started',
      kind: 'magic',
    }).state;
    const transition = transitionCombat(started, {
      type: 'player-action-resolved',
      result,
    });

    expect(transition.accepted).toBe(false);
    if (transition.accepted) throw new Error('Expected the transition to be rejected.');
    expect(transition.reason).toContain('does not match');
  });

  it('enters victory when the resolved damage defeats the enemy', () => {
    const started = transitionCombat(activeState(), {
      type: 'player-action-started',
      kind: 'magic',
    }).state;
    const resolved = transitionCombat(started, {
      type: 'player-action-resolved',
      result: { ...result, kind: 'magic', damageTaken: enemy.stats.health },
    });

    expect(resolved.state.phase).toBe('victory');
  });
});
