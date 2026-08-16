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

  it('preserves the legacy strict critical thresholds for physical and magic damage', () => {
    const physicalAtThreshold = resolveDamage({ stats: attackerStats }, defender, 'attack', {
      damageRoll: 0.5,
      chanceRoll: 0.9,
    });
    const physicalAboveThreshold = resolveDamage({ stats: attackerStats }, defender, 'attack', {
      damageRoll: 0.5,
      chanceRoll: 0.9001,
    });
    const magicAtThreshold = resolveDamage({ stats: attackerStats }, defender, 'magic', {
      damageRoll: 0.5,
      chanceRoll: 0.6,
    });
    const magicAboveThreshold = resolveDamage({ stats: attackerStats }, defender, 'magic', {
      damageRoll: 0.5,
      chanceRoll: 0.6001,
    });

    expect(physicalAtThreshold.critical).toBe(false);
    expect(physicalAboveThreshold.critical).toBe(true);
    expect(magicAtThreshold.critical).toBe(false);
    expect(magicAboveThreshold.critical).toBe(true);
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

  it('preserves strict legacy miss thresholds for physical and magic damage', () => {
    const physicalAtThreshold = resolveDamage({ stats: attackerStats }, defender, 'attack', {
      damageRoll: 0.5,
      chanceRoll: 0.1,
    });
    const physicalBelowThreshold = resolveDamage({ stats: attackerStats }, defender, 'attack', {
      damageRoll: 0.5,
      chanceRoll: 0.0999,
    });
    const magicAtThreshold = resolveDamage({ stats: attackerStats }, defender, 'magic', {
      damageRoll: 0.5,
      chanceRoll: 0.25,
    });
    const magicBelowThreshold = resolveDamage({ stats: attackerStats }, defender, 'magic', {
      damageRoll: 0.5,
      chanceRoll: 0.2499,
    });

    expect(physicalAtThreshold.missed).toBe(false);
    expect(physicalBelowThreshold.missed).toBe(true);
    expect(magicAtThreshold.missed).toBe(false);
    expect(magicBelowThreshold.missed).toBe(true);
  });

  it('rejects non-finite random rolls at the combat boundary', () => {
    expect(() =>
      resolveDamage({ stats: attackerStats }, defender, 'attack', {
        damageRoll: Number.NaN,
        chanceRoll: 0.5,
      }),
    ).toThrow(RangeError);
    expect(() =>
      resolveDamage({ stats: attackerStats }, defender, 'attack', {
        damageRoll: 0.5,
        chanceRoll: Number.NaN,
      }),
    ).toThrow(RangeError);
    expect(() =>
      resolveDamage({ stats: attackerStats }, defender, 'attack', {
        damageRoll: Number.POSITIVE_INFINITY,
        chanceRoll: 0.5,
      }),
    ).toThrow(RangeError);
    expect(() => reduceDamage(-1, 100)).toThrow(RangeError);
    expect(() => reduceDamage(100, Number.NaN)).toThrow(RangeError);
    expect(() =>
      resolveDamage({ stats: { ...attackerStats, ad: Number.NaN } }, defender, 'attack', {
        damageRoll: 0.5,
        chanceRoll: 0.5,
      }),
    ).toThrow(RangeError);
    expect(() =>
      resolveDamage(
        { stats: attackerStats },
        { ...defender, damageTaken: defender.stats.health + 1 },
        'attack',
        {
          damageRoll: 0.5,
          chanceRoll: 0.5,
        },
      ),
    ).toThrow(RangeError);
  });

  it('rejects an unknown damage kind at the runtime boundary', () => {
    expect(() =>
      resolveDamage({ stats: attackerStats }, defender, 'unknown' as never, {
        damageRoll: 0.5,
        chanceRoll: 0.5,
      }),
    ).toThrow(RangeError);
  });
});
