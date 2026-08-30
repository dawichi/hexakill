import { describe, expect, it } from 'vitest';
import {
  createSimulationFixture,
  DEFAULT_BALANCE_SCENARIOS,
  PLAYER_POLICIES,
  runBalanceReport,
  simulateEncounter,
  strengthenElite,
} from './balance-simulation';

describe('balance simulation', () => {
  it('replays the same encounter when the seed and policy are unchanged', () => {
    const scenario = DEFAULT_BALANCE_SCENARIOS[0];
    if (!scenario) throw new Error('Expected a default balance scenario.');
    const fixture = createSimulationFixture(scenario);
    const options = {
      ...fixture,
      seed: 1234,
      policy: PLAYER_POLICIES.reactive,
      collectTrace: true,
    } as const;

    expect(simulateEncounter(options)).toEqual(simulateEncounter(options));
  });

  it('keeps the policy decision stream separate from combat randomness', () => {
    const scenario = DEFAULT_BALANCE_SCENARIOS[0];
    if (!scenario) throw new Error('Expected a default balance scenario.');
    const fixture = createSimulationFixture(scenario);
    const randomResult = simulateEncounter({
      ...fixture,
      seed: 88,
      policy: PLAYER_POLICIES.random,
      collectTrace: true,
    });
    const reactiveResult = simulateEncounter({
      ...fixture,
      seed: 88,
      policy: PLAYER_POLICIES.reactive,
      collectTrace: true,
    });

    expect(randomResult.trace[0]?.actor).toBe(reactiveResult.trace[0]?.actor);
    expect(randomResult.seed).toBe(reactiveResult.seed);
  });

  it('never deals damage beyond the available health and terminates within the turn cap', () => {
    const scenario =
      DEFAULT_BALANCE_SCENARIOS.find((candidate) => candidate.elite) ??
      DEFAULT_BALANCE_SCENARIOS[0];
    if (!scenario) throw new Error('Expected a default balance scenario.');
    const fixture = createSimulationFixture(scenario);
    const result = simulateEncounter({
      ...fixture,
      seed: 99,
      policy: PLAYER_POLICIES.greedy,
      maxTurns: 20,
      collectTrace: true,
    });

    expect(['win', 'loss', 'draw']).toContain(result.result);
    expect(result.turns).toBeLessThanOrEqual(20);
    expect(result.playerHealth).toBeGreaterThanOrEqual(0);
    expect(result.playerPotions).toBeGreaterThanOrEqual(0);
    expect(result.enemyHealth).toBeGreaterThanOrEqual(0);
    expect(result.damageDealt).toBeGreaterThanOrEqual(0);
    expect(result.damageTaken).toBeGreaterThanOrEqual(0);
  });

  it('keeps the provisional elite premium survivable', () => {
    const scenario = DEFAULT_BALANCE_SCENARIOS[0];
    if (!scenario) throw new Error('Expected a default balance scenario.');
    const { enemy } = createSimulationFixture(scenario);
    const elite = strengthenElite(enemy);

    expect(elite.stats.health).toBe(Math.round(enemy.stats.health * 1.15));
    expect(elite.stats.ad).toBe(Math.round(enemy.stats.ad * 1.15));
    expect(elite.gold).toBe(Math.round(enemy.gold * 1.5));
    expect(elite.elite).toBe(true);
  });

  it('produces summaries for every scenario and selected policy', () => {
    const scenarios = DEFAULT_BALANCE_SCENARIOS.slice(0, 2);
    const report = runBalanceReport({
      scenarios,
      policies: ['class', 'reactive'],
      samplesPerCell: 5,
      seed: 7,
    });

    expect(report.summaries).toHaveLength(4);
    expect(report.summaries.every((summary) => summary.samples === 5)).toBe(true);
    expect(report.summaries.every((summary) => summary.winRate >= 0 && summary.winRate <= 1)).toBe(
      true,
    );
  });
});
