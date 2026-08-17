import { BASE_STATS } from './characters';
import { relicVictoryGoldMultiplier } from './store';
import { EnemyState, PlayerState, PowerUpType, Stats } from './game-types';

export const MAX_POWER_UPS = 24;
export const MAX_POWER_UPS_PER_STAT = 6;
const POWER_UP_TYPES: readonly PowerUpType[] = ['health', 'ad', 'ap', 'speed'];

function isSafeNonNegativeInteger(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}

export interface VictoryReward {
  readonly experience: number;
  readonly gold: number;
  readonly levelsGained: number;
  readonly powerUpsGranted: number;
}

function assertPowerUpState(player: PlayerState): void {
  const powerUps = player.powerUps;
  if (
    !powerUps ||
    typeof powerUps !== 'object' ||
    !powerUps.history ||
    typeof powerUps.history !== 'object'
  ) {
    throw new RangeError('Power-up state is malformed.');
  }

  const history = POWER_UP_TYPES.map((type) => powerUps.history[type]);
  if (
    !isSafeNonNegativeInteger(powerUps.pending) ||
    powerUps.pending > MAX_POWER_UPS ||
    history.some((count) => !isSafeNonNegativeInteger(count) || count > MAX_POWER_UPS_PER_STAT) ||
    powerUps.pending + history.reduce((sum, count) => sum + count, 0) > MAX_POWER_UPS
  ) {
    throw new RangeError('Power-up state exceeds its progression bounds.');
  }
}

function assertPlayerStats(player: PlayerState): void {
  if (
    !Object.values(player.stats).every((value) => Number.isFinite(value) && value >= 0) ||
    player.stats.health <= 0
  ) {
    throw new RangeError('Player stats must be finite and non-negative with positive health.');
  }
}

function assertProgressionInputs(player: PlayerState, enemy: EnemyState): void {
  if (!Number.isSafeInteger(player.level) || player.level < 1) {
    throw new RangeError('Player level must be a positive safe integer.');
  }
  if (
    !Number.isSafeInteger(player.experience) ||
    player.experience < 0 ||
    player.experience >= 100
  ) {
    throw new RangeError('Player experience must be an integer between 0 and 99.');
  }
  if (!Number.isSafeInteger(enemy.level) || enemy.level < 1) {
    throw new RangeError('Enemy level must be a positive safe integer.');
  }
  if (!isSafeNonNegativeInteger(enemy.gold)) {
    throw new RangeError('Enemy gold must be a non-negative integer.');
  }
  if (!isSafeNonNegativeInteger(player.bossesDefeated) || player.bossesDefeated > 3) {
    throw new RangeError('Boss progress must be between 0 and 3.');
  }
  if (!isSafeNonNegativeInteger(player.gold) || !isSafeNonNegativeInteger(player.potions)) {
    throw new RangeError('Player gold and potions must be non-negative safe integers.');
  }
  assertPlayerStats(player);

  assertPowerUpState(player);
}

export function calculateVictoryReward(player: PlayerState, enemy: EnemyState): VictoryReward {
  assertProgressionInputs(player, enemy);
  const experience = Number(((enemy.level / player.level) * 100).toFixed(0));
  if (!Number.isSafeInteger(experience) || experience < 0) {
    throw new RangeError('Victory experience must be a non-negative safe integer.');
  }
  const gold = Math.trunc(enemy.gold * relicVictoryGoldMultiplier(player));
  const totalExperience = player.experience + experience;
  if (!Number.isSafeInteger(totalExperience)) {
    throw new RangeError('Total experience must remain a safe integer.');
  }
  const levelsGained = Math.floor(totalExperience / 100);
  const nextLevel = player.level + levelsGained;
  if (!Number.isSafeInteger(nextLevel)) {
    throw new RangeError('Victory level must remain a safe integer.');
  }
  const usedPowerUps =
    player.powerUps.pending +
    Object.values(player.powerUps.history).reduce((sum, count) => sum + count, 0);
  const rawPowerUps =
    player.level % 2 !== 0 ? Math.trunc(levelsGained / 2) : Math.trunc(levelsGained / 2 + 0.5);
  const powerUpsGranted = Math.max(0, Math.min(rawPowerUps, MAX_POWER_UPS - usedPowerUps));

  return { experience, gold, levelsGained, powerUpsGranted };
}

function levelStats(player: PlayerState, levelsGained: number): Stats {
  const stats = { ...player.stats };

  (Object.keys(BASE_STATS) as (keyof Stats)[]).forEach((stat) => {
    const nextValue =
      stats[stat] + BASE_STATS[stat] * player.character.modifiers[stat] * levelsGained;
    if (!Number.isFinite(nextValue) || nextValue < 0) {
      throw new RangeError('Level-up stats must remain finite and non-negative.');
    }
    stats[stat] = nextValue;
  });

  return stats;
}

export function applyVictoryReward(player: PlayerState, enemy: EnemyState): PlayerState {
  const reward = calculateVictoryReward(player, enemy);
  const nextLevel = player.level + reward.levelsGained;
  const nextGold = player.gold + reward.gold;
  const nextBossesDefeated =
    player.bossesDefeated + (enemy.definition.archetype === 'boss' ? 1 : 0);
  if (!Number.isSafeInteger(nextLevel) || !Number.isSafeInteger(nextGold)) {
    throw new RangeError('Victory reward must keep player level and gold safe integers.');
  }
  if (!isSafeNonNegativeInteger(nextBossesDefeated) || nextBossesDefeated > 3) {
    throw new RangeError('Victory reward must keep boss progress between 0 and 3.');
  }
  const experience = (player.experience + reward.experience) % 100;

  return {
    ...player,
    level: nextLevel,
    experience,
    stats: levelStats(player, reward.levelsGained),
    gold: nextGold,
    powerUps: {
      ...player.powerUps,
      pending: player.powerUps.pending + reward.powerUpsGranted,
    },
    bossesDefeated: nextBossesDefeated,
    defeatedEnemies: [
      ...player.defeatedEnemies,
      { enemyId: enemy.definition.id, level: enemy.level },
    ],
  };
}

const POWER_UP_VALUES: Record<PowerUpType, number> = {
  health: 500,
  ad: 40,
  ap: 50,
  speed: 10,
};

export function powerUpValue(type: PowerUpType, currentCount: number): number {
  if (!Object.hasOwn(POWER_UP_VALUES, type)) {
    throw new RangeError('Unknown power-up type.');
  }
  if (
    !Number.isSafeInteger(currentCount) ||
    currentCount < 0 ||
    currentCount >= MAX_POWER_UPS_PER_STAT
  ) {
    throw new RangeError('Power-up count must be between 0 and 5.');
  }

  return Math.trunc(POWER_UP_VALUES[type] * 1.5 ** currentCount + 0.5);
}

export function applyPowerUp(player: PlayerState, type: PowerUpType): PlayerState {
  assertPlayerStats(player);
  assertPowerUpState(player);
  if (!Object.hasOwn(POWER_UP_VALUES, type)) {
    throw new RangeError('Unknown power-up type.');
  }
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
