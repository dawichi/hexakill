import { describe, expect, it } from 'vitest';
import {
  chooseEnemyAction,
  determineFirstActor,
  resolveAction,
  resolveHeal,
} from './combat-actions';
import { generateEnemy } from './enemies';
import { Stats } from './game-types';

const stats: Stats = { health: 200, ad: 16, ap: 20, armor: 12, mr: 12, speed: 4 };

describe('combat action policy', () => {
  it('uses speed to determine the first actor, with ties favoring the enemy', () => {
    expect(determineFirstActor(5, 4)).toBe('player');
    expect(determineFirstActor(4, 4)).toBe('enemy');
  });

  it('chooses attack or magic when the enemy is healthy', () => {
    const enemy = generateEnemy(4, 0, 0);
    expect(chooseEnemyAction(enemy, 0.5)).toBe('attack');
    expect(chooseEnemyAction(enemy, 0.51)).toBe('magic');
  });

  it('chooses healing below ten percent health when potions remain', () => {
    const enemy = { ...generateEnemy(4, 0, 0), damageTaken: 299, potions: 1 };
    expect(chooseEnemyAction(enemy, 0)).toBe('heal');
  });

  it('keeps the healthy threshold at sixty percent and uses the injured split below it', () => {
    const enemy = { ...generateEnemy(4, 0, 0), potions: 1 };
    expect(chooseEnemyAction({ ...enemy, damageTaken: 120 }, 0.5)).toBe('attack');
    expect(chooseEnemyAction({ ...enemy, damageTaken: 120 }, 0.51)).toBe('magic');
    expect(chooseEnemyAction({ ...enemy, damageTaken: 121 }, 0.33)).toBe('attack');
    expect(chooseEnemyAction({ ...enemy, damageTaken: 121 }, 0.34)).toBe('magic');
    expect(chooseEnemyAction({ ...enemy, damageTaken: 121 }, 0.67)).toBe('heal');
  });

  it('does not select healing when an injured enemy has no potions', () => {
    const enemy = { ...generateEnemy(4, 0, 0), damageTaken: 299, potions: 0 };
    expect(chooseEnemyAction(enemy, 0.5)).toBe('attack');
    expect(chooseEnemyAction(enemy, 0.51)).toBe('magic');
  });

  it('reduces damage taken by the legacy fixed twenty percent heal', () => {
    expect(resolveHeal(100)).toEqual({ action: 'heal', healed: 20, damageTaken: 80 });
  });

  it('resolves a damage action through the shared combat rules', () => {
    const result = resolveAction({ stats }, 0, { stats, damageTaken: 0 }, 'attack', {
      damageRoll: 0.5,
      chanceRoll: 0.5,
    });

    if ('action' in result) throw new Error('Expected a damage result.');
    expect(result.damageAfterResistance).toBeGreaterThan(0);
  });
});
