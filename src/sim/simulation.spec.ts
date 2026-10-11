import { describe, expect, it } from 'vitest';
import { classWinRates, runReport, simulateRun } from './simulation';

describe('balance lab', () => {
  it('is deterministic per seed', () => {
    const options = {
      characterId: 'samurai',
      combatPolicy: 'class',
      routePolicy: 'balanced',
      seed: 9,
    } as const;
    expect(simulateRun(options)).toEqual(simulateRun(options));
  });

  // Floors catch accidental balance regressions; widen them deliberately when tuning.
  it('keeps every class winnable and none trivial', () => {
    const rates = classWinRates(runReport({ samples: 60, seed: 42 }));
    for (const rate of Object.values(rates)) {
      expect(rate).toBeGreaterThan(0.3);
      expect(rate).toBeLessThan(0.85);
    }
    const spread = Math.max(...Object.values(rates)) - Math.min(...Object.values(rates));
    expect(spread).toBeLessThan(0.25);
  }, 15_000);
});
