import * as v from 'valibot';
import { isCharacterId } from '../domain/characters';
import { BOSSES, isBossId, isEnemyId } from '../domain/enemies';
import { CharacterId, STAT_KEYS } from '../domain/game-types';
import { MAX_POWER_UPS, MAX_POWER_UPS_PER_STAT, POWER_UP_TYPES } from '../domain/player';
import { NAME_MAX as NAME_MAX_LENGTH, NAME_MIN as NAME_MIN_LENGTH } from '../domain/player-name';
import { isRelicId, RelicId } from '../domain/relics';
import { BOSS_ROOMS, FINAL_ROOM, findRouteNode, isValidPath } from '../domain/route-map';
import { RunState, routeGraph } from '../domain/run';

const count = v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(Number.MAX_SAFE_INTEGER));
const uint32 = v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(0xffff_ffff));
const amount = v.pipe(v.number(), v.finite(), v.minValue(0));
const stats = v.object(
  Object.fromEntries(STAT_KEYS.map((stat) => [stat, amount])) as unknown as Record<
    (typeof STAT_KEYS)[number],
    typeof amount
  >,
);
const relicId = v.custom<RelicId>(isRelicId);
const enemyId = v.custom<string>(isEnemyId);

const playerSchema = v.object({
  name: v.pipe(v.string(), v.trim(), v.minLength(NAME_MIN_LENGTH), v.maxLength(NAME_MAX_LENGTH)),
  characterId: v.custom<CharacterId>(isCharacterId),
  level: v.pipe(count, v.minValue(1)),
  experience: v.pipe(count, v.maxValue(99)),
  stats: v.pipe(
    stats,
    v.check((value) => value.health > 0),
  ),
  damageTaken: amount,
  potions: count,
  gold: count,
  relics: v.pipe(
    v.array(relicId),
    v.check((ids) => new Set(ids).size === ids.length),
  ),
  pendingPowerUps: count,
  powerUps: v.object(
    Object.fromEntries(
      POWER_UP_TYPES.map((type) => [type, v.pipe(count, v.maxValue(MAX_POWER_UPS_PER_STAT))]),
    ) as unknown as Record<(typeof POWER_UP_TYPES)[number], typeof count>,
  ),
  bossesDefeated: v.pipe(count, v.maxValue(BOSS_ROOMS.length)),
  defeatedEnemies: v.array(v.object({ id: enemyId, level: v.pipe(count, v.minValue(1)) })),
});

const moveSchema = v.object({
  kind: v.picklist(['attack', 'magic', 'guard', 'heal', 'charge']),
  hits: v.pipe(count, v.minValue(1), v.maxValue(5)),
  multiplier: v.pipe(amount, v.maxValue(5)),
  label: v.optional(v.string()),
});

const combatSchema = v.object({
  phase: v.picklist(['player-turn', 'victory', 'defeat']),
  enemy: v.object({
    id: enemyId,
    level: v.pipe(count, v.minValue(1)),
    stats: v.pipe(
      stats,
      v.check((value) => value.health > 0),
    ),
    damageTaken: amount,
    potions: count,
    gold: count,
    elite: v.boolean(),
  }),
  opening: v.picklist(['player', 'enemy']),
  turn: count,
  intent: v.nullable(moveSchema),
  playerBlock: amount,
  enemyBlock: amount,
  enemyHexed: v.boolean(),
  enemyVenom: count,
  enemyCharged: v.boolean(),
  counters: v.object({
    playerActions: count,
    damagingActions: count,
    attacks: count,
    potionUses: count,
    enemyDamageActions: count,
  }),
  arcaneBatteryUsed: v.boolean(),
  bloodLedgerUsed: v.boolean(),
});

const rewardSchema = v.object({
  experience: count,
  gold: count,
  levelsGained: count,
  powerUpsGranted: count,
  healed: amount,
  maxHealthGained: amount,
});

const runSchema = v.object({
  version: v.literal(2),
  run: v.object({
    seed: uint32,
    daily: v.nullable(v.pipe(v.string(), v.isoDate())),
    rngState: uint32,
    player: playerSchema,
    screen: v.picklist(['map', 'combat', 'store', 'game-over', 'run-complete']),
    visited: v.array(v.string()),
    combat: v.nullable(combatSchema),
    reward: v.nullable(rewardSchema),
    storeOffers: v.pipe(
      v.array(relicId),
      v.check((ids) => new Set(ids).size === ids.length),
    ),
  }),
});

/** Structural checks the schema cannot express: graph paths and screen coherence. */
function isCoherent(run: RunState): boolean {
  const { player, combat, screen } = run;
  const powerUpsUsed = POWER_UP_TYPES.reduce((sum, type) => sum + player.powerUps[type], 0);
  if (player.pendingPowerUps + powerUpsUsed > MAX_POWER_UPS) return false;
  if (player.damageTaken > player.stats.health) return false;
  if (run.visited.length > FINAL_ROOM) return false;
  if (!isValidPath(routeGraph(run), run.visited)) return false;
  const lastId = run.visited.at(-1);
  const last = lastId === undefined ? undefined : findRouteNode(routeGraph(run), lastId);
  const fighting = last?.kind === 'battle' || last?.kind === 'elite' || last?.kind === 'boss';
  const expectedBoss =
    last?.kind === 'boss'
      ? BOSSES[BOSS_ROOMS.indexOf(last.room as (typeof BOSS_ROOMS)[number])]
      : undefined;
  const encounterMatches =
    !fighting ||
    (combat !== null &&
      (last.kind === 'boss'
        ? expectedBoss?.id === combat.enemy.id
        : !isBossId(combat.enemy.id) && combat.enemy.elite === (last.kind === 'elite')));
  if (run.storeOffers.some((id) => player.relics.includes(id))) return false;
  switch (screen) {
    case 'map':
      return (
        combat === null &&
        run.reward === null &&
        run.storeOffers.length === 0 &&
        run.visited.length < FINAL_ROOM &&
        player.pendingPowerUps === 0 &&
        player.damageTaken < player.stats.health
      );
    case 'store':
      return (
        last?.kind === 'store' &&
        combat === null &&
        run.reward === null &&
        player.pendingPowerUps === 0 &&
        player.damageTaken < player.stats.health
      );
    case 'combat':
      return (
        fighting &&
        encounterMatches &&
        combat !== null &&
        combat.phase !== 'defeat' &&
        (combat.phase === 'victory'
          ? combat.enemy.damageTaken === combat.enemy.stats.health && run.reward !== null
          : combat.enemy.damageTaken < combat.enemy.stats.health && run.reward === null) &&
        player.damageTaken < player.stats.health &&
        (last?.kind !== 'boss' ||
          player.bossesDefeated ===
            BOSS_ROOMS.indexOf(last.room as (typeof BOSS_ROOMS)[number]) +
              Number(combat.phase === 'victory'))
      );
    case 'game-over':
      return (
        fighting &&
        encounterMatches &&
        combat?.phase === 'defeat' &&
        run.reward === null &&
        player.damageTaken >= player.stats.health
      );
    case 'run-complete':
      return (
        last?.kind === 'boss' &&
        combat?.phase === 'victory' &&
        encounterMatches &&
        combat.enemy.damageTaken === combat.enemy.stats.health &&
        run.reward !== null &&
        run.visited.length === BOSS_ROOMS[BOSS_ROOMS.length - 1] &&
        player.bossesDefeated === BOSS_ROOMS.length
      );
  }
}

export function serializeRun(run: RunState): string {
  return JSON.stringify({ version: 2, run });
}

/** Restore a saved run, or null when the save is missing, malformed, or incoherent. */
export function parseRun(value: unknown): RunState | null {
  const result = v.safeParse(runSchema, value);
  if (!result.success) return null;
  const run = result.output.run as RunState;
  return isCoherent(run) ? run : null;
}
