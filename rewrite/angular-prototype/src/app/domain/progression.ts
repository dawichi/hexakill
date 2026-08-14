import { BASE_STATS } from './characters';
import { EnemyState, PlayerState, PowerUpType, Stats } from './game-types';

export const MAX_POWER_UPS = 24;
export const MAX_POWER_UPS_PER_STAT = 6;

export interface VictoryReward {
  readonly experience: number;
  readonly gold: number;
  readonly levelsGained: number;
  readonly powerUpsGranted: number;
}

export function calculateVictoryReward(player: PlayerState, enemy: EnemyState): VictoryReward {
  const experience = Math.trunc((enemy.level / player.level) * 100);
  const gold = enemy.gold;
  let level = player.level;
  let remainingExperience = player.experience + experience;

  while (remainingExperience >= 100) {
    level += 1;
    remainingExperience -= 100;
  }

  const levelsGained = level - player.level;
  const usedPowerUps = Object.values(player.powerUps.history).reduce(
    (sum, count) => sum + count,
    0,
  );
  const rawPowerUps =
    player.level % 2 !== 0 ? Math.trunc(levelsGained / 2) : Math.trunc(levelsGained / 2 + 0.5);
  const powerUpsGranted = Math.max(0, Math.min(rawPowerUps, MAX_POWER_UPS - usedPowerUps));

  return { experience, gold, levelsGained, powerUpsGranted };
}

function levelStats(player: PlayerState, levelsGained: number): Stats {
  const stats = { ...player.stats };

  for (let level = 0; level < levelsGained; level += 1) {
    (Object.keys(BASE_STATS) as (keyof Stats)[]).forEach((stat) => {
      stats[stat] += BASE_STATS[stat] * player.character.modifiers[stat];
    });
  }

  return stats;
}

export function applyVictoryReward(player: PlayerState, enemy: EnemyState): PlayerState {
  const reward = calculateVictoryReward(player, enemy);
  let experience = player.experience + reward.experience;
  while (experience >= 100) experience -= 100;

  return {
    ...player,
    level: player.level + reward.levelsGained,
    experience,
    stats: levelStats(player, reward.levelsGained),
    gold: player.gold + reward.gold,
    powerUps: {
      ...player.powerUps,
      pending: player.powerUps.pending + reward.powerUpsGranted,
    },
  };
}

const POWER_UP_VALUES: Record<PowerUpType, number> = {
  health: 500,
  ad: 40,
  ap: 50,
  speed: 10,
};

export function powerUpValue(type: PowerUpType, currentCount: number): number {
  if (currentCount < 0 || currentCount >= MAX_POWER_UPS_PER_STAT) {
    throw new RangeError('Power-up count must be between 0 and 5.');
  }

  return Math.trunc(POWER_UP_VALUES[type] * 1.5 ** currentCount + 0.5);
}

export function applyPowerUp(player: PlayerState, type: PowerUpType): PlayerState {
  const count = player.powerUps.history[type];
  if (!player.powerUps.pending || count >= MAX_POWER_UPS_PER_STAT) return player;

  const stat = type as keyof Stats;
  const stats = { ...player.stats, [stat]: player.stats[stat] + powerUpValue(type, count) };
  return {
    ...player,
    stats,
    powerUps: {
      pending: player.powerUps.pending - 1,
      history: { ...player.powerUps.history, [type]: count + 1 },
    },
  };
}
