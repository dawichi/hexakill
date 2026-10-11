import { act, CombatEvent, CombatState, PlayerAction, startCombat } from './combat';
import { healAmount } from './combat-rules';
import { generateEnemy } from './enemies';
import { CharacterId } from './game-types';
import {
  applyPowerUp,
  applyVictory,
  createPlayer,
  hasRelic,
  heal,
  PlayerState,
  PowerUpType,
  VictoryReward,
  victoryReward,
} from './player';
import { createRng, Rng } from './random';
import { RELICS, RelicId } from './relics';
import {
  BOSS_ROOMS,
  bossIndexForRoom,
  createRouteGraph,
  FINAL_ROOM,
  REST_HEAL,
  RouteGraph,
  RouteNode,
  routeFrontier,
} from './route-map';
import { buyPotions, buyRelic, generateRelicOffers, PotionOfferId } from './store';

export type RunScreen = 'map' | 'combat' | 'store' | 'game-over' | 'run-complete';

export interface RunState {
  readonly seed: number;
  /** ISO date of the daily challenge, or null for a regular run. */
  readonly daily: string | null;
  /** The seeded random source's state, so a reload resumes the same sequence. */
  readonly rngState: number;
  readonly player: PlayerState;
  readonly screen: RunScreen;
  /** Route node ids in the order they were entered. */
  readonly visited: readonly string[];
  readonly combat: CombatState | null;
  readonly reward: VictoryReward | null;
  readonly storeOffers: readonly RelicId[];
}

export type RunNotice =
  | { readonly type: 'rest'; readonly healed: number }
  | { readonly type: 'purchase'; readonly purchased: boolean; readonly message: string };

export interface RunStep {
  readonly run: RunState;
  readonly events: readonly CombatEvent[];
  readonly notice: RunNotice | null;
}

const graphs = new Map<number, RouteGraph>();

/** Route graphs are pure functions of the seed; memoise the latest few. */
export function routeGraph(run: Pick<RunState, 'seed'>): RouteGraph {
  let graph = graphs.get(run.seed);
  if (!graph) {
    if (graphs.size > 8) graphs.clear();
    graph = createRouteGraph(run.seed);
    graphs.set(run.seed, graph);
  }
  return graph;
}

export function createRun(
  seed: number,
  name: string,
  characterId: CharacterId,
  daily: string | null = null,
): RunState {
  return {
    seed: seed >>> 0,
    daily,
    rngState: seed >>> 0,
    player: createPlayer(name.trim(), characterId),
    screen: 'map',
    visited: [],
    combat: null,
    reward: null,
    storeOffers: [],
  };
}

/** The room the player is in, or is about to choose (1-based). */
export function currentRoom(run: RunState): number {
  return run.screen === 'map' ? run.visited.length + 1 : run.visited.length;
}

/** Rooms fully cleared; a room in progress does not count. */
export function roomsCleared(run: RunState): number {
  if (run.screen === 'map') return run.visited.length;
  if (run.screen === 'run-complete') return FINAL_ROOM;
  if (run.screen === 'combat' && run.combat?.phase === 'victory') return run.visited.length;
  if (run.screen === 'store') return run.visited.length;
  return Math.max(0, run.visited.length - 1);
}

export function frontier(run: RunState): readonly RouteNode[] {
  const reveal = hasRelic(run.player, 'travelers-compass')
    ? RELICS['travelers-compass'].params.reveal
    : 0;
  return routeFrontier(routeGraph(run), run.visited, reveal);
}

function step(
  run: RunState,
  rng: Rng,
  changes: Partial<RunState>,
  extra: Partial<RunStep> = {},
): RunStep {
  return {
    run: { ...run, ...changes, rngState: rng.state },
    events: extra.events ?? [],
    notice: extra.notice ?? null,
  };
}

function unchanged(run: RunState): RunStep {
  return { run, events: [], notice: null };
}

export function chooseRouteNode(run: RunState, nodeId: string): RunStep {
  if (run.screen !== 'map' || run.player.pendingPowerUps > 0) return unchanged(run);
  const node = frontier(run).find((candidate) => candidate.id === nodeId);
  if (!node) return unchanged(run);
  const rng = createRng(run.rngState);
  const visited = [...run.visited, node.id];

  switch (node.kind) {
    case 'rest': {
      const healed = healAmount(run.player.damageTaken, run.player.stats.health, REST_HEAL);
      return step(
        run,
        rng,
        { visited, player: heal(run.player, healed) },
        {
          notice: { type: 'rest', healed },
        },
      );
    }
    case 'store':
      return step(run, rng, {
        visited,
        screen: 'store',
        storeOffers: generateRelicOffers(rng, run.player, node.room),
      });
    default: {
      const enemy = generateEnemy(
        rng,
        run.player.level,
        node.kind,
        Math.max(0, bossIndexForRoom(node.room)),
      );
      return resolveCombatStep(
        { ...run, visited, screen: 'combat', reward: null },
        rng,
        startCombat(rng, run.player, enemy),
      );
    }
  }
}

function resolveCombatStep(
  run: RunState,
  rng: Rng,
  outcome: { player: PlayerState; combat: CombatState; events: readonly CombatEvent[] },
): RunStep {
  const { combat, events } = outcome;
  let player = outcome.player;
  let screen: RunScreen = run.screen;
  let reward: VictoryReward | null = run.reward;
  if (combat.phase === 'victory') {
    reward = victoryReward(player, combat.enemy);
    player = applyVictory(player, combat.enemy);
    if (player.bossesDefeated >= BOSS_ROOMS.length) screen = 'run-complete';
  } else if (combat.phase === 'defeat') {
    screen = 'game-over';
  }
  return step(run, rng, { player, combat, screen, reward }, { events });
}

export function playerAction(run: RunState, action: PlayerAction): RunStep {
  if (run.screen !== 'combat' || !run.combat || run.combat.phase !== 'player-turn') {
    return unchanged(run);
  }
  const rng = createRng(run.rngState);
  return resolveCombatStep(run, rng, act(rng, run.player, run.combat, action));
}

export function choosePowerUp(run: RunState, type: PowerUpType): RunStep {
  if (run.player.pendingPowerUps <= 0) return unchanged(run);
  return { run: { ...run, player: applyPowerUp(run.player, type) }, events: [], notice: null };
}

/** Continue from a won fight to the route map once every power-up is spent. */
export function leaveCombat(run: RunState): RunStep {
  if (
    run.screen !== 'combat' ||
    run.combat?.phase !== 'victory' ||
    run.player.pendingPowerUps > 0
  ) {
    return unchanged(run);
  }
  return { run: { ...run, screen: 'map', combat: null, reward: null }, events: [], notice: null };
}

export function purchaseRelic(run: RunState, id: RelicId): RunStep {
  if (run.screen !== 'store' || !run.storeOffers.includes(id)) return unchanged(run);
  const result = buyRelic(run.player, id);
  return {
    run: {
      ...run,
      player: result.player,
      storeOffers: result.purchased
        ? run.storeOffers.filter((offer) => offer !== id)
        : run.storeOffers,
    },
    events: [],
    notice: { type: 'purchase', purchased: result.purchased, message: result.message },
  };
}

export function purchasePotions(run: RunState, offerId: PotionOfferId): RunStep {
  if (run.screen !== 'store') return unchanged(run);
  const result = buyPotions(run.player, offerId);
  return {
    run: { ...run, player: result.player },
    events: [],
    notice: { type: 'purchase', purchased: result.purchased, message: result.message },
  };
}

export function leaveStore(run: RunState): RunStep {
  if (run.screen !== 'store') return unchanged(run);
  return { run: { ...run, screen: 'map', storeOffers: [] }, events: [], notice: null };
}

export function isRunOver(run: RunState): boolean {
  return run.screen === 'game-over' || run.screen === 'run-complete';
}
