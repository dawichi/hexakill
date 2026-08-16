import { describe, expect, it } from 'vitest';
import { CHARACTER_DEFINITIONS, createInitialPlayer } from './characters';
import { generateEnemy } from './enemies';
import {
  applyPowerUp,
  applyVictoryReward,
  calculateVictoryReward,
  powerUpValue,
} from './progression';

const player = createInitialPlayer('David', CHARACTER_DEFINITIONS[0]);

describe('progression rules', () => {
  it('calculates experience and gold from the current legacy reward formula', () => {
    const enemy = generateEnemy(4, 0, 0);
    const reward = calculateVictoryReward(player, enemy);

    expect(reward.experience).toBe(50);
    expect(reward.gold).toBe(125);
    expect(reward.levelsGained).toBe(0);
  });

  it('rounds fractional experience using the legacy toFixed rule', () => {
    const enemy = generateEnemy(3, 0, 0.3);
    const lowerLevelPlayer = { ...player, level: 3 };

    expect(calculateVictoryReward(lowerLevelPlayer, enemy).experience).toBe(67);
  });

  it('levels up after crossing one hundred experience', () => {
    const enemy = generateEnemy(4, 0, 0);
    const leveledPlayer = applyVictoryReward({ ...player, experience: 75 }, enemy);

    expect(leveledPlayer.level).toBe(5);
    expect(leveledPlayer.experience).toBe(25);
    expect(leveledPlayer.stats.ap).toBe(60);
  });

  it('applies power-ups with increasing legacy values', () => {
    expect(powerUpValue('health', 0)).toBe(500);
    expect(powerUpValue('health', 1)).toBe(750);

    const poweredPlayer = applyPowerUp(
      { ...player, powerUps: { pending: 1, history: { health: 0, ad: 0, ap: 0, speed: 0 } } },
      'health',
    );

    expect(poweredPlayer.stats.health).toBe(700);
    expect(poweredPlayer.powerUps.pending).toBe(0);
    expect(poweredPlayer.powerUps.history.health).toBe(1);
  });

  it('rejects non-integer power-up counts', () => {
    expect(() => powerUpValue('unknown' as never, 0)).toThrow(RangeError);
    expect(() => powerUpValue('health', Number.NaN)).toThrow(RangeError);
    expect(() => powerUpValue('health', 1.5)).toThrow(RangeError);
    expect(() => powerUpValue('health', Number.POSITIVE_INFINITY)).toThrow(RangeError);
    expect(() => calculateVictoryReward({ ...player, level: 0 }, generateEnemy(4, 0, 0))).toThrow(
      RangeError,
    );
    expect(() =>
      calculateVictoryReward(
        { ...player, level: Number.MAX_SAFE_INTEGER + 1 },
        generateEnemy(4, 0, 0),
      ),
    ).toThrow(RangeError);
    expect(() =>
      calculateVictoryReward(player, {
        ...generateEnemy(4, 0, 0),
        level: Number.MAX_SAFE_INTEGER + 1,
      }),
    ).toThrow(RangeError);
    expect(() =>
      calculateVictoryReward({ ...player, experience: Number.NaN }, generateEnemy(4, 0, 0)),
    ).toThrow(RangeError);
    expect(() => powerUpValue('health', Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError);
    expect(() =>
      applyPowerUp(
        { ...player, powerUps: { pending: -1, history: { health: 0, ad: 0, ap: 0, speed: 0 } } },
        'health',
      ),
    ).toThrow(RangeError);
  });

  it('records sequential boss progress in the player run', () => {
    const boss = generateEnemy(10, 0, 0, 0);
    const bossPlayer = { ...player, level: 10 };
    const rewardedPlayer = applyVictoryReward(bossPlayer, boss);

    expect(rewardedPlayer.bossesDefeated).toBe(1);
  });

  it('grants the legacy even-level power-up count after multiple levels', () => {
    const boss = generateEnemy(10, 0, 0, 0);
    const leveledPlayer = { ...player, level: 10 };
    const reward = calculateVictoryReward(leveledPlayer, boss);

    expect(reward.experience).toBe(150);
    expect(reward.levelsGained).toBe(1);
    expect(reward.powerUpsGranted).toBe(1);
  });

  it('caps newly granted power-ups at the global legacy maximum', () => {
    const enemy = generateEnemy(10, 0, 0, 0);
    const nearlyCappedPlayer = {
      ...player,
      powerUps: {
        pending: 0,
        history: { health: 6, ad: 6, ap: 6, speed: 5 },
      },
    };

    expect(calculateVictoryReward(nearlyCappedPlayer, enemy).powerUpsGranted).toBe(1);

    const pendingNearlyCappedPlayer = {
      ...nearlyCappedPlayer,
      powerUps: { pending: 1, history: nearlyCappedPlayer.powerUps.history },
    };
    expect(calculateVictoryReward(pendingNearlyCappedPlayer, enemy).powerUpsGranted).toBe(0);
  });

  it('records the defeated enemy and level for the game-over history', () => {
    const enemy = generateEnemy(4, 0, 0);
    const rewardedPlayer = applyVictoryReward(player, enemy);

    expect(rewardedPlayer.defeatedEnemies).toEqual([{ enemyId: 'adventurer', level: 2 }]);
  });

  it('does not spend a pending power-up on a capped stat', () => {
    const cappedPlayer = {
      ...player,
      powerUps: { pending: 1, history: { health: 6, ad: 0, ap: 0, speed: 0 } },
    };

    expect(applyPowerUp(cappedPlayer, 'health')).toBe(cappedPlayer);
  });
});
