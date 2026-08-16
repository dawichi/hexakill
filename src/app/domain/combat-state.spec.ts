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
    expect(transition.state.enemy?.definition.name).toBe('Adventurer');
  });

  it('moves to the enemy turn after a player potion', () => {
    const spawned = transitionCombat(INITIAL_COMBAT_STATE, { type: 'enemy-spawned', enemy });
    const potion = transitionCombat(spawned.state, { type: 'player-potion-used' });

    expect(potion.accepted).toBe(true);
    expect(potion.state.phase).toBe('enemy-turn');
  });

  it('moves to the enemy turn when speed gives the enemy the opening action', () => {
    const spawned = transitionCombat(INITIAL_COMBAT_STATE, { type: 'enemy-spawned', enemy });
    const opening = transitionCombat(spawned.state, { type: 'enemy-turn-started' });

    expect(opening.accepted).toBe(true);
    expect(opening.state.phase).toBe('enemy-turn');
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

  it('rejects an unknown player action before storing it in state', () => {
    const transition = transitionCombat(activeState(), {
      type: 'player-action-started',
      kind: 'unknown' as never,
    });

    expect(transition.accepted).toBe(false);
    if (transition.accepted) throw new Error('Expected the transition to be rejected.');
    expect(transition.reason).toContain('not available');
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

  it('rejects invalid numeric payloads from an enemy resolution', () => {
    const started = transitionCombat(activeState(), {
      type: 'player-action-started',
      kind: 'attack',
    }).state;
    const enemyTurn = transitionCombat(started, {
      type: 'player-action-resolved',
      result,
    }).state;

    for (const payload of [
      { playerDamageTaken: -1, playerHealth: 200 },
      { playerDamageTaken: Number.NaN, playerHealth: 200 },
      { playerDamageTaken: 1, playerHealth: 0 },
    ]) {
      const transition = transitionCombat(enemyTurn, {
        type: 'enemy-action-resolved',
        ...payload,
      });

      expect(transition.accepted).toBe(false);
      if (transition.accepted) throw new Error('Expected invalid payload to be rejected.');
      expect(transition.reason).toContain('valid player health');
    }

    const alreadyDamagedEnemyTurn = { ...enemyTurn, playerDamageTaken: 12 };
    for (const payload of [
      { playerDamageTaken: 11, playerHealth: 200 },
      { playerDamageTaken: 201, playerHealth: 200 },
    ]) {
      const transition = transitionCombat(alreadyDamagedEnemyTurn, {
        type: 'enemy-action-resolved',
        ...payload,
      });

      expect(transition.accepted).toBe(false);
      if (transition.accepted)
        throw new Error('Expected an incoherent damage total to be rejected.');
      expect(transition.reason).toContain('valid player health');
    }
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

  it('rejects player actions and potions after combat reaches a terminal phase', () => {
    const victory = transitionCombat(
      transitionCombat(
        transitionCombat(activeState(), { type: 'player-action-started', kind: 'magic' }).state,
        {
          type: 'player-action-resolved',
          result: { ...result, kind: 'magic', damageTaken: enemy.stats.health },
        },
      ).state,
      { type: 'player-action-started', kind: 'attack' },
    );
    const defeat = transitionCombat(
      transitionCombat(
        transitionCombat(activeState(), { type: 'player-action-started', kind: 'attack' }).state,
        { type: 'player-action-resolved', result },
      ).state,
      { type: 'enemy-action-resolved', playerDamageTaken: 200, playerHealth: 200 },
    ).state;

    expect(victory.accepted).toBe(false);
    expect(transitionCombat(defeat, { type: 'player-potion-used' }).accepted).toBe(false);
  });

  it('rejects malformed player damage results at the transition boundary', () => {
    const started = transitionCombat(activeState(), {
      type: 'player-action-started',
      kind: 'attack',
    }).state;

    for (const malformed of [
      { ...result, rawDamage: -1 },
      { ...result, damageAfterResistance: Number.NaN },
      { ...result, critical: 'yes' as never },
      { ...result, damageTaken: -1 },
      { ...result, damageTaken: enemy.stats.health + 1 },
    ]) {
      const transition = transitionCombat(started, {
        type: 'player-action-resolved',
        result: malformed,
      });

      expect(transition.accepted).toBe(false);
      if (transition.accepted) throw new Error('Expected malformed damage to be rejected.');
      expect(transition.reason).toContain('valid damage result');
    }
  });

  it('rejects an active-combat spawn and resets to the idle boundary', () => {
    const active = activeState();
    const rejected = transitionCombat(active, { type: 'enemy-spawned', enemy });

    expect(rejected.accepted).toBe(false);
    expect(transitionCombat(active, { type: 'reset' }).state).toEqual(INITIAL_COMBAT_STATE);
  });

  it('requires coherent live and defeated enemy boundaries', () => {
    const defeatedEnemy = { ...enemy, damageTaken: enemy.stats.health };
    const malformedIdle = { ...INITIAL_COMBAT_STATE, enemy };
    const malformedAwaiting = { ...activeState(), enemy: defeatedEnemy };
    const victory = transitionCombat(
      transitionCombat(activeState(), { type: 'player-action-started', kind: 'magic' }).state,
      {
        type: 'player-action-resolved',
        result: { ...result, kind: 'magic', damageTaken: enemy.stats.health },
      },
    ).state;

    expect(transitionCombat(malformedIdle, { type: 'enemy-spawned', enemy }).accepted).toBe(false);
    expect(
      transitionCombat(malformedAwaiting, { type: 'player-action-started', kind: 'attack' })
        .accepted,
    ).toBe(false);
    expect(transitionCombat(victory, { type: 'enemy-spawned', enemy }).accepted).toBe(true);
  });
});
