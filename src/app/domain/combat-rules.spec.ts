import { describe, expect, it } from 'vitest';
import { reduceDamage, resolveDamage } from './combat-rules';
import { Stats } from './game-types';

const attackerStats: Stats = {
  health: 200,
  ad: 100,
  ap: 100,
  armor: 12,
  mr: 12,
  speed: 4,
};

const defender = {
  stats: { health: 500, ad: 16, ap: 20, armor: 100, mr: 50, speed: 4 },
  damageTaken: 0,
};

describe('combat rules', () => {
  it('reduces physical damage using armor', () => {
    expect(reduceDamage(1000, 100)).toBe(857);
    expect(reduceDamage(100, 100)).toBe(86);
  });

  it('resolves a normal attack and caps damage at remaining health', () => {
    const result = resolveDamage(
      { stats: attackerStats },
      { ...defender, damageTaken: 450 },
      'attack',
      { damageRoll: 0.5, chanceRoll: 0.5 },
    );

    expect(result.missed).toBe(false);
    expect(result.critical).toBe(false);
    expect(result.damageAfterResistance).toBeGreaterThan(0);
    expect(result.damageTaken).toBe(500);
  });

  it('resolves a critical magic hit', () => {
    const result = resolveDamage({ stats: attackerStats }, defender, 'magic', {
      damageRoll: 0.5,
      chanceRoll: 0.99,
    });

    expect(result.critical).toBe(true);
    expect(result.missed).toBe(false);
    expect(result.rawDamage).toBeGreaterThan(100);
  });

  it('resolves a missed attack without changing damage taken', () => {
    const result = resolveDamage({ stats: attackerStats }, defender, 'attack', {
      damageRoll: 0.5,
      chanceRoll: 0.01,
    });

    expect(result.missed).toBe(true);
    expect(result.rawDamage).toBe(0);
    expect(result.damageTaken).toBe(0);
  });
});
