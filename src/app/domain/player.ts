import {
  BASE_STATS,
  findCharacter,
  STARTING_GOLD,
  STARTING_LEVEL,
  STARTING_POTIONS,
  startingStats,
} from './characters';
import { healAmount } from './combat-rules';
import { EnemyState, findEnemyDefinition } from './enemies';
import { CharacterId, Stat, Stats, scaleStats } from './game-types';
import { RELICS, RelicId } from './relics';

export type PowerUpType = Stat;

export const POWER_UP_TYPES: readonly PowerUpType[] = [
  'health',
  'ad',
  'ap',
  'armor',
  'mr',
  'speed',
];
export const MAX_POWER_UPS = 24;
export const MAX_POWER_UPS_PER_STAT = 6;

const POWER_UP_VALUES: Readonly<Record<PowerUpType, number>> = {
  health: 350,
  ad: 40,
  ap: 50,
  armor: 24,
  mr: 24,
  speed: 10,
};

export interface DefeatedEnemy {
  readonly id: string;
  readonly level: number;
}

export interface PlayerState {
  readonly name: string;
  readonly characterId: CharacterId;
  readonly level: number;
  /** Experience towards the next level, from 0 to 99. */
  readonly experience: number;
  /** Maximum stats. Current health is `stats.health - damageTaken`. */
  readonly stats: Stats;
  readonly damageTaken: number;
  readonly potions: number;
  readonly gold: number;
  readonly relics: readonly RelicId[];
  readonly pendingPowerUps: number;
  readonly powerUps: Readonly<Record<PowerUpType, number>>;
  readonly bossesDefeated: number;
  readonly defeatedEnemies: readonly DefeatedEnemy[];
}

export function createPlayer(name: string, characterId: CharacterId): PlayerState {
  return {
    name,
    characterId,
    level: STARTING_LEVEL,
    experience: 0,
    stats: startingStats(findCharacter(characterId)),
    damageTaken: 0,
    potions: STARTING_POTIONS,
    gold: STARTING_GOLD,
    relics: [],
    pendingPowerUps: 0,
    powerUps: { health: 0, ad: 0, ap: 0, armor: 0, mr: 0, speed: 0 },
    bossesDefeated: 0,
    defeatedEnemies: [],
  };
}

export function remainingHealth(player: Pick<PlayerState, 'stats' | 'damageTaken'>): number {
  return Math.max(0, player.stats.health - player.damageTaken);
}

export function hasRelic(player: Pick<PlayerState, 'relics'>, id: RelicId): boolean {
  return player.relics.includes(id);
}

export function heal(player: PlayerState, amount: number): PlayerState {
  return { ...player, damageTaken: Math.max(0, player.damageTaken - amount) };
}

function usedPowerUps(player: PlayerState): number {
  return (
    player.pendingPowerUps + POWER_UP_TYPES.reduce((sum, type) => sum + player.powerUps[type], 0)
  );
}

/** The stat gained by the next power-up of `type`, or null once that stat is maxed. */
export function powerUpValue(type: PowerUpType, count: number): number | null {
  if (count >= MAX_POWER_UPS_PER_STAT) return null;
  return Math.trunc(POWER_UP_VALUES[type] * 1.5 ** count + 0.5);
}

export function nextPowerUpValue(player: PlayerState, type: PowerUpType): number | null {
  return powerUpValue(type, player.powerUps[type]);
}

export function applyPowerUp(player: PlayerState, type: PowerUpType): PlayerState {
  const value = nextPowerUpValue(player, type);
  if (player.pendingPowerUps <= 0 || value === null) return player;
  return {
    ...player,
    stats: { ...player.stats, [type]: player.stats[type] + value },
    pendingPowerUps: player.pendingPowerUps - 1,
    powerUps: { ...player.powerUps, [type]: player.powerUps[type] + 1 },
  };
}

export interface VictoryReward {
  readonly experience: number;
  readonly gold: number;
  readonly levelsGained: number;
  readonly powerUpsGranted: number;
  /** Health restored by victory relics. */
  readonly healed: number;
  /** Maximum health gained from Dungeon Heart. */
  readonly maxHealthGained: number;
}

function isEliteOrBoss(enemy: EnemyState): boolean {
  return enemy.elite || findEnemyDefinition(enemy.id).archetype === 'boss';
}

export function victoryReward(player: PlayerState, enemy: EnemyState): VictoryReward {
  const premium = isEliteOrBoss(enemy) && hasRelic(player, 'kings-seal');
  const sealBonus = premium ? RELICS['kings-seal'].params.bonus : 0;
  const purseBonus = hasRelic(player, 'coin-purse') ? RELICS['coin-purse'].params.bonus : 0;
  const experience = Math.round((enemy.level / player.level) * 100 * (1 + sealBonus));
  const gold = Math.trunc(enemy.gold * (1 + purseBonus + sealBonus));
  const levelsGained = Math.floor((player.experience + experience) / 100);
  // Odd levels round down and even levels round up, so two levels always grant one power-up.
  const rawPowerUps =
    player.level % 2 !== 0 ? Math.trunc(levelsGained / 2) : Math.trunc(levelsGained / 2 + 0.5);
  const powerUpsGranted = Math.max(0, Math.min(rawPowerUps, MAX_POWER_UPS - usedPowerUps(player)));

  const maxHealthGained = hasRelic(player, 'dungeon-heart')
    ? RELICS['dungeon-heart'].params.maxHealth
    : 0;
  const levelHealth = BASE_STATS.health * findCharacter(player.characterId).modifiers.health;
  const maxHealth = player.stats.health + levelHealth * levelsGained + maxHealthGained;
  const healFraction =
    (hasRelic(player, 'bandage-roll') ? RELICS['bandage-roll'].params.heal : 0) +
    (hasRelic(player, 'dungeon-heart') ? RELICS['dungeon-heart'].params.heal : 0);
  const healed = healAmount(player.damageTaken, maxHealth, healFraction);

  return { experience, gold, levelsGained, powerUpsGranted, healed, maxHealthGained };
}

export function applyVictory(player: PlayerState, enemy: EnemyState): PlayerState {
  const reward = victoryReward(player, enemy);
  const modifiers = findCharacter(player.characterId).modifiers;
  const leveled = scaleStats(
    player.stats,
    (stat, value) => value + BASE_STATS[stat] * modifiers[stat] * reward.levelsGained,
  );
  const boss = findEnemyDefinition(enemy.id).archetype === 'boss';
  return {
    ...player,
    level: player.level + reward.levelsGained,
    experience: (player.experience + reward.experience) % 100,
    stats: { ...leveled, health: leveled.health + reward.maxHealthGained },
    damageTaken: Math.max(0, player.damageTaken - reward.healed),
    gold: player.gold + reward.gold,
    pendingPowerUps: player.pendingPowerUps + reward.powerUpsGranted,
    bossesDefeated: player.bossesDefeated + (boss ? 1 : 0),
    defeatedEnemies: [...player.defeatedEnemies, { id: enemy.id, level: enemy.level }],
  };
}
