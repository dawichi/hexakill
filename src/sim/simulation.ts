/**
 * Balance lab. Plays whole runs through the same pure run functions the game uses, with scripted
 * combat and route policies, so balance numbers always describe the shipped rules.
 */
import { CHARACTERS } from '../app/domain/characters';
import {
  CombatState,
  intentRange,
  PlayerAction,
  playerDamagePreview,
  potionHeal,
} from '../app/domain/combat';
import { CharacterId } from '../app/domain/game-types';
import {
  hasRelic,
  nextPowerUpValue,
  PlayerState,
  PowerUpType,
  remainingHealth,
} from '../app/domain/player';
import { createRng, Rng } from '../app/domain/random';
import { RELIC_IDS, RELICS, RelicId } from '../app/domain/relics';
import { RouteNode, RouteNodeKind } from '../app/domain/route-map';
import {
  choosePowerUp,
  chooseRouteNode,
  createRun,
  frontier,
  leaveCombat,
  leaveStore,
  playerAction,
  purchasePotions,
  purchaseRelic,
  RunState,
  roomsCleared,
} from '../app/domain/run';

export type CombatPolicyId = 'class' | 'reactive' | 'random';
export type RoutePolicyId = 'balanced' | 'aggressive' | 'safe' | 'random';

export const COMBAT_POLICY_IDS: readonly CombatPolicyId[] = ['class', 'reactive'];
export const ROUTE_POLICY_IDS: readonly RoutePolicyId[] = ['balanced', 'aggressive', 'safe'];

type CombatPolicy = (player: PlayerState, combat: CombatState, rng: Rng) => PlayerAction;
type RoutePolicy = (player: PlayerState, nodes: readonly RouteNode[], rng: Rng) => RouteNode;

function healthRatio(player: PlayerState): number {
  return remainingHealth(player) / player.stats.health;
}

/** Worst-case damage of the enemy's next move, before Block. */
function incomingThreat(player: PlayerState, combat: CombatState): number {
  const intent = combat.intent;
  if (!intent || (intent.kind !== 'attack' && intent.kind !== 'magic')) return 0;
  return intentRange(intent, combat.enemy, player)[1] * intent.hits;
}

function bestStrike(player: PlayerState, combat: CombatState): PlayerAction {
  const mean = (kind: 'attack' | 'magic') => {
    const [low, high] = playerDamagePreview(player, combat, kind);
    return low + high;
  };
  return mean('magic') > mean('attack') ? 'magic' : 'attack';
}

const classPolicy: CombatPolicy = (player, combat) => {
  if (player.potions > 0 && potionHeal(player) > 0 && healthRatio(player) <= 0.35) return 'potion';
  if (
    player.characterId === 'warrior' &&
    incomingThreat(player, combat) > remainingHealth(player) * 0.5
  ) {
    return 'guard';
  }
  return bestStrike(player, combat);
};

const reactivePolicy: CombatPolicy = (player, combat, rng) => {
  const threat = incomingThreat(player, combat);
  if (player.potions > 0 && healthRatio(player) <= 0.32 && potionHeal(player) >= threat * 0.6) {
    return 'potion';
  }
  if (threat > remainingHealth(player) * 0.22 && threat > combat.playerBlock) return 'guard';
  return classPolicy(player, combat, rng);
};

const COMBAT_POLICIES: Readonly<Record<CombatPolicyId, CombatPolicy>> = {
  class: classPolicy,
  reactive: reactivePolicy,
  random: (player, _combat, rng) => {
    const actions: PlayerAction[] = ['attack', 'magic', 'guard'];
    if (player.potions > 0) actions.push('potion');
    return actions[Math.floor(rng.next() * actions.length)] ?? 'attack';
  },
};

function visible(nodes: readonly RouteNode[], kind: RouteNodeKind): RouteNode | undefined {
  return nodes.find((node) => !node.hidden && node.kind === kind);
}

function anyNode(nodes: readonly RouteNode[], rng: Rng): RouteNode {
  const hidden = nodes.filter((node) => node.hidden);
  const pool = hidden.length ? hidden : nodes;
  const node = pool[Math.floor(rng.next() * pool.length)];
  if (!node) throw new RangeError('A route policy needs at least one node.');
  return node;
}

function canAffordRelic(player: PlayerState): boolean {
  return RELIC_IDS.some((id) => !hasRelic(player, id) && player.gold >= RELICS[id].price);
}

const ROUTE_POLICIES: Readonly<Record<RoutePolicyId, RoutePolicy>> = {
  balanced: (player, nodes, rng) => {
    const health = healthRatio(player);
    return (
      (health <= 0.45 ? visible(nodes, 'rest') : undefined) ??
      (health >= 0.7 ? visible(nodes, 'elite') : undefined) ??
      visible(nodes, 'boss') ??
      visible(nodes, 'battle') ??
      visible(nodes, 'store') ??
      visible(nodes, 'rest') ??
      anyNode(nodes, rng)
    );
  },
  aggressive: (_player, nodes, rng) =>
    visible(nodes, 'elite') ??
    visible(nodes, 'boss') ??
    visible(nodes, 'battle') ??
    visible(nodes, 'store') ??
    visible(nodes, 'rest') ??
    anyNode(nodes, rng),
  safe: (player, nodes, rng) => {
    const health = healthRatio(player);
    return (
      (health < 0.9 ? visible(nodes, 'rest') : undefined) ??
      visible(nodes, 'boss') ??
      (canAffordRelic(player) ? visible(nodes, 'store') : undefined) ??
      visible(nodes, 'battle') ??
      visible(nodes, 'rest') ??
      visible(nodes, 'store') ??
      visible(nodes, 'elite') ??
      anyNode(nodes, rng)
    );
  },
  random: (_player, nodes, rng) =>
    nodes[Math.floor(rng.next() * nodes.length)] ?? anyNode(nodes, rng),
};

const POWER_UP_PREFERENCE: Readonly<Record<CharacterId, readonly PowerUpType[]>> = {
  wizard: ['ap', 'health', 'speed', 'mr', 'armor', 'ad'],
  samurai: ['ad', 'health', 'speed', 'armor', 'mr', 'ap'],
  warrior: ['health', 'ad', 'armor', 'mr', 'speed', 'ap'],
};

const RELIC_PREFERENCE: Readonly<Record<CharacterId, readonly RelicId[]>> = {
  wizard: [
    'apprentices-codex',
    'arcane-battery',
    'hexglass-prism',
    'alchemists-crown',
    'the-hourglass',
    'venom-vial',
    'potion-satchel',
    'vitality-moss',
  ],
  samurai: [
    'honed-edge',
    'echoing-blade',
    'oath-of-first-strike',
    'guarders-buckler',
    'war-drums',
    'swiftstep-anklet',
    'vitality-moss',
  ],
  warrior: [
    'guarders-buckler',
    'vitality-moss',
    'thornmail',
    'crown-of-thorns',
    'dungeon-heart',
    'potion-satchel',
    'honed-edge',
  ],
};

function spendPowerUps(run: RunState): RunState {
  let next = run;
  while (next.player.pendingPowerUps > 0) {
    const type = POWER_UP_PREFERENCE[next.player.characterId].find(
      (candidate) => nextPowerUpValue(next.player, candidate) !== null,
    );
    if (!type) break;
    next = choosePowerUp(next, type).run;
  }
  return next;
}

interface ShopResult {
  readonly run: RunState;
  readonly goldSpent: number;
}

function shop(run: RunState): ShopResult {
  let next = run;
  const startGold = run.player.gold;
  const preferred = RELIC_PREFERENCE[run.player.characterId].find(
    (id) => run.storeOffers.includes(id) && run.player.gold >= RELICS[id].price,
  );
  if (preferred) next = purchaseRelic(next, preferred).run;
  if (next.player.potions < 5) {
    if (next.player.gold >= 400) next = purchasePotions(next, 'potion-pack').run;
    else if (next.player.gold >= 100) next = purchasePotions(next, 'potion').run;
  }
  return { run: leaveStore(next).run, goldSpent: startGold - next.player.gold };
}

export interface RunOptions {
  readonly characterId: CharacterId;
  readonly combatPolicy: CombatPolicyId;
  readonly routePolicy: RoutePolicyId;
  readonly seed: number;
  readonly startingRelics?: readonly RelicId[];
  readonly maxCombatTurns?: number;
}

export interface RunResult {
  readonly result: 'win' | 'loss' | 'stalled';
  readonly rooms: number;
  readonly level: number;
  readonly healthRatio: number;
  readonly relics: number;
  readonly bossesDefeated: number;
  readonly goldSpent: number;
  readonly routes: Readonly<Record<RouteNodeKind, number>>;
  /** The room where the run ended in defeat, if it did. */
  readonly deathRoom: number | null;
  /** Player level on entering each boss room reached. */
  readonly levelsAtBosses: readonly number[];
}

export function simulateRun(options: RunOptions): RunResult {
  const decisions = createRng(options.seed ^ 0x9e37_79b9);
  const combatPolicy = COMBAT_POLICIES[options.combatPolicy];
  const routePolicy = ROUTE_POLICIES[options.routePolicy];
  const maxTurns = options.maxCombatTurns ?? 150;
  let run = createRun(options.seed, 'Sim', options.characterId);
  for (const id of options.startingRelics ?? []) {
    const relicRun = { ...run, screen: 'store' as const, storeOffers: [id] };
    const bought = purchaseRelic(
      { ...relicRun, player: { ...run.player, gold: run.player.gold + RELICS[id].price } },
      id,
    ).run;
    run = { ...bought, screen: 'map', storeOffers: [] };
  }
  const routes: Record<RouteNodeKind, number> = { battle: 0, elite: 0, store: 0, rest: 0, boss: 0 };
  let goldSpent = 0;
  let turns = 0;
  const levelsAtBosses: number[] = [];

  for (let guard = 0; guard < 10_000; guard += 1) {
    switch (run.screen) {
      case 'map': {
        run = spendPowerUps(run);
        const node = routePolicy(run.player, frontier(run), decisions);
        routes[node.kind] += 1;
        if (node.kind === 'boss') levelsAtBosses.push(run.player.level);
        run = chooseRouteNode(run, node.id).run;
        turns = 0;
        break;
      }
      case 'combat': {
        const combat = run.combat;
        if (!combat) throw new Error('Combat screen without combat state.');
        if (combat.phase === 'victory') {
          run = leaveCombat(spendPowerUps(run)).run;
          break;
        }
        turns += 1;
        if (turns > maxTurns) return finish(run, 'stalled', routes, goldSpent, levelsAtBosses);
        run = playerAction(run, combatPolicy(run.player, combat, decisions)).run;
        break;
      }
      case 'store': {
        const result = shop(run);
        goldSpent += result.goldSpent;
        run = result.run;
        break;
      }
      case 'game-over':
        return finish(run, 'loss', routes, goldSpent, levelsAtBosses);
      case 'run-complete':
        return finish(run, 'win', routes, goldSpent, levelsAtBosses);
    }
  }
  return finish(run, 'stalled', routes, goldSpent, levelsAtBosses);
}

function finish(
  run: RunState,
  result: RunResult['result'],
  routes: Readonly<Record<RouteNodeKind, number>>,
  goldSpent: number,
  levelsAtBosses: readonly number[],
): RunResult {
  return {
    result,
    rooms: roomsCleared(run),
    level: run.player.level,
    healthRatio: healthRatio(run.player),
    relics: run.player.relics.length,
    bossesDefeated: run.player.bossesDefeated,
    goldSpent,
    routes,
    deathRoom: result === 'loss' ? run.visited.length : null,
    levelsAtBosses,
  };
}

/* ---------------------------------------------------------------- reports */

export interface RunSummary {
  readonly characterId: CharacterId;
  readonly combatPolicy: CombatPolicyId;
  readonly routePolicy: RoutePolicyId;
  readonly samples: number;
  readonly winRate: number;
  readonly rooms: number;
  readonly level: number;
  readonly healthRatio: number;
  readonly relics: number;
  readonly bosses: number;
  readonly goldSpent: number;
  /** Share of defeats at each boss room (10, 20, 30); the rest died elsewhere. */
  readonly bossDeaths: readonly [number, number, number];
}

export interface ReportOptions {
  readonly samples?: number;
  readonly seed?: number;
  readonly characters?: readonly CharacterId[];
  readonly combatPolicies?: readonly CombatPolicyId[];
  readonly routePolicies?: readonly RoutePolicyId[];
  readonly startingRelics?: readonly RelicId[];
}

const average = (values: readonly number[]): number =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

export function summarizeRuns(
  options: Omit<RunOptions, 'seed'> & { readonly samples: number; readonly seed: number },
): RunSummary {
  const results = Array.from({ length: options.samples }, (_, index) =>
    simulateRun({ ...options, seed: (options.seed + index * 7919) >>> 0 }),
  );
  const losses = results.filter((result) => result.result === 'loss');
  const deathShare = (room: number) =>
    losses.length ? losses.filter((result) => result.deathRoom === room).length / losses.length : 0;
  return {
    characterId: options.characterId,
    combatPolicy: options.combatPolicy,
    routePolicy: options.routePolicy,
    samples: options.samples,
    winRate: results.filter((result) => result.result === 'win').length / results.length,
    rooms: average(results.map((result) => result.rooms)),
    level: average(results.map((result) => result.level)),
    healthRatio: average(results.map((result) => result.healthRatio)),
    relics: average(results.map((result) => result.relics)),
    bosses: average(results.map((result) => result.bossesDefeated)),
    goldSpent: average(results.map((result) => result.goldSpent)),
    bossDeaths: [deathShare(10), deathShare(20), deathShare(30)],
  };
}

export function runReport(options: ReportOptions = {}): RunSummary[] {
  const samples = options.samples ?? 200;
  const seed = options.seed ?? 42;
  const characters = options.characters ?? CHARACTERS.map((character) => character.id);
  return characters.flatMap((characterId) =>
    (options.combatPolicies ?? COMBAT_POLICY_IDS).flatMap((combatPolicy) =>
      (options.routePolicies ?? ROUTE_POLICY_IDS).map((routePolicy) =>
        summarizeRuns({
          characterId,
          combatPolicy,
          routePolicy,
          samples,
          seed,
          ...(options.startingRelics ? { startingRelics: options.startingRelics } : {}),
        }),
      ),
    ),
  );
}

const pct = (value: number): string => `${(value * 100).toFixed(1)}%`;

export function formatReport(summaries: readonly RunSummary[]): string {
  const header = [
    'Character'.padEnd(9),
    'Combat'.padEnd(9),
    'Route'.padEnd(11),
    'Win'.padStart(7),
    'Rooms'.padStart(6),
    'Level'.padStart(6),
    'HP left'.padStart(8),
    'Relics'.padStart(7),
    'Bosses'.padStart(7),
    'Deaths at boss 1/2/3',
  ].join(' ');
  const rows = summaries.map((summary) =>
    [
      summary.characterId.padEnd(9),
      summary.combatPolicy.padEnd(9),
      summary.routePolicy.padEnd(11),
      pct(summary.winRate).padStart(7),
      summary.rooms.toFixed(1).padStart(6),
      summary.level.toFixed(1).padStart(6),
      pct(summary.healthRatio).padStart(8),
      summary.relics.toFixed(2).padStart(7),
      summary.bosses.toFixed(2).padStart(7),
      summary.bossDeaths.map(pct).join(' / '),
    ].join(' '),
  );
  return [header, ...rows].join('\n');
}

/** Win rate of each character across every policy pair, for regression floors. */
export function classWinRates(
  summaries: readonly RunSummary[],
): Readonly<Record<CharacterId, number>> {
  const rate = (id: CharacterId) =>
    average(summaries.filter((summary) => summary.characterId === id).map((s) => s.winRate));
  return { wizard: rate('wizard'), samurai: rate('samurai'), warrior: rate('warrior') };
}
