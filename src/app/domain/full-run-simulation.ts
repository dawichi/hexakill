import {
  createSeededRandom,
  PLAYER_POLICIES,
  PlayerPolicyId,
  simulateEncounter,
  strengthenElite,
} from './balance-simulation';
import { CHARACTER_DEFINITIONS, createInitialPlayer } from './characters';
import { resolveHeal } from './combat-actions';
import { generateEnemy } from './enemies';
import { CharacterId, PlayerState } from './game-types';
import { applyPowerUp, applyVictoryReward } from './progression';
import { relicVictoryMaxHealthBonus } from './relic-rules';
import {
  advanceRouteMap,
  BOSS_ROOMS,
  createRouteMap,
  FINAL_ROOM,
  RouteMapState,
  RouteNode,
  RouteNodeKind,
  revealHiddenRouteNodes,
} from './route-map';
import {
  generateStoreOffers,
  purchaseItem,
  purchasePotions,
  relicVictoryHealAmount,
  STORE_ITEMS,
} from './store';

export type RoutePolicyId = 'balanced' | 'aggressive' | 'safe' | 'random';

export interface RunDecisionContext {
  readonly player: PlayerState;
  readonly playerDamageTaken: number;
  readonly map: RouteMapState;
  readonly nodes: readonly RouteNode[];
  readonly randomChoice: () => number;
}

export type RoutePolicy = (context: RunDecisionContext) => RouteNode;

export interface FullRunSimulationOptions {
  readonly characterId: CharacterId;
  readonly combatPolicy: PlayerPolicyId;
  readonly routePolicy: RoutePolicyId;
  readonly seed: number;
  readonly maxRooms?: number;
  readonly maxCombatTurns?: number;
  readonly startingRelicIds?: readonly string[];
  readonly collectTrace?: boolean;
}

export interface RunTraceEvent {
  readonly room: number;
  readonly floor: number;
  readonly kind: RouteNodeKind;
  readonly result?: 'win' | 'loss' | 'draw';
  readonly enemy?: string;
  readonly enemyLevel?: number;
  readonly playerHealth?: number;
  readonly gold?: number;
  readonly relics?: number;
}

export interface FullRunSimulationResult {
  readonly result: 'win' | 'loss' | 'draw';
  readonly roomsVisited: number;
  readonly finalFloor: number;
  readonly finalLevel: number;
  readonly finalHealthRatio: number;
  readonly finalGold: number;
  readonly finalPotions: number;
  readonly relics: number;
  readonly combats: number;
  readonly combatWins: number;
  readonly eliteCombats: number;
  readonly eliteWins: number;
  readonly bossesDefeated: number;
  readonly storesVisited: number;
  readonly restsVisited: number;
  readonly goldSpent: number;
  readonly potionsPurchased: number;
  readonly routeCounts: Readonly<Record<RouteNodeKind, number>>;
  readonly trace: readonly RunTraceEvent[];
}

export interface FullRunSummary {
  readonly character: string;
  readonly combatPolicy: PlayerPolicyId;
  readonly routePolicy: RoutePolicyId;
  readonly samples: number;
  readonly wins: number;
  readonly losses: number;
  readonly draws: number;
  readonly completionRate: number;
  readonly averageRooms: number;
  readonly averageFinalFloor: number;
  readonly averageFinalLevel: number;
  readonly averageFinalHealth: number;
  readonly averageRelics: number;
  readonly averagePotions: number;
  readonly averageGold: number;
  readonly averageCombats: number;
  readonly averageEliteWins: number;
  readonly averageBossesDefeated: number;
  readonly averageStores: number;
  readonly averageRests: number;
  readonly averageGoldSpent: number;
  readonly routeRates: Readonly<Record<RouteNodeKind, number>>;
}

export interface FullRunReport {
  readonly seed: number;
  readonly samplesPerCell: number;
  readonly maxRooms: number;
  readonly summaries: readonly FullRunSummary[];
}

const DEFAULT_MAX_ROOMS = FINAL_ROOM;
const DEFAULT_MAX_COMBAT_TURNS = 100;
const ROUTE_KINDS: readonly RouteNodeKind[] = ['battle', 'elite', 'store', 'rest', 'boss'];
const EMPTY_ROUTE_COUNTS: Record<RouteNodeKind, number> = {
  battle: 0,
  elite: 0,
  store: 0,
  rest: 0,
  boss: 0,
};

function remainingHealth(player: PlayerState, damageTaken: number): number {
  return Math.max(0, player.stats.health - damageTaken);
}

function healthRatio(player: PlayerState, damageTaken: number): number {
  return player.stats.health > 0 ? remainingHealth(player, damageTaken) / player.stats.health : 0;
}

function average(values: readonly number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function percent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function fixed(value: number): string {
  return value.toFixed(2);
}

function visibleNodes(context: RunDecisionContext, kind: RouteNodeKind): RouteNode[] {
  return context.nodes.filter((node) => !node.hidden && node.kind === kind);
}

function chooseFirst(
  nodes: readonly RouteNode[],
  context: RunDecisionContext,
): RouteNode | undefined {
  if (nodes.length) return nodes[0];
  const hidden = context.nodes.filter((node) => node.hidden);
  if (hidden.length) {
    return hidden[Math.min(hidden.length - 1, Math.floor(context.randomChoice() * hidden.length))];
  }
  return context.nodes[0];
}

function canBuyRelic(context: RunDecisionContext): boolean {
  return STORE_ITEMS.some(
    (item) =>
      context.player.gold >= item.price &&
      !context.player.inventory.some((owned) => owned.id === item.id),
  );
}

function balancedRoutePolicy(context: RunDecisionContext): RouteNode {
  const currentHealth = healthRatio(context.player, context.playerDamageTaken);
  if (currentHealth <= 0.45) {
    const rest = chooseFirst(visibleNodes(context, 'rest'), context);
    if (rest) return rest;
  }

  if (currentHealth >= 0.7) {
    const elite = chooseFirst(visibleNodes(context, 'elite'), context);
    if (elite) return elite;
  }

  const firstNode = context.nodes[0];
  if (!firstNode) throw new RangeError('A route policy requires at least one node.');
  return (
    chooseFirst(visibleNodes(context, 'battle'), context) ??
    chooseFirst(visibleNodes(context, 'store'), context) ??
    chooseFirst(visibleNodes(context, 'rest'), context) ??
    firstNode
  );
}

function aggressiveRoutePolicy(context: RunDecisionContext): RouteNode {
  const firstNode = context.nodes[0];
  if (!firstNode) throw new RangeError('A route policy requires at least one node.');
  return (
    chooseFirst(visibleNodes(context, 'elite'), context) ??
    chooseFirst(visibleNodes(context, 'battle'), context) ??
    chooseFirst(visibleNodes(context, 'store'), context) ??
    chooseFirst(visibleNodes(context, 'rest'), context) ??
    firstNode
  );
}

function safeRoutePolicy(context: RunDecisionContext): RouteNode {
  const currentHealth = healthRatio(context.player, context.playerDamageTaken);
  if (currentHealth < 0.9) {
    const rest = chooseFirst(visibleNodes(context, 'rest'), context);
    if (rest) return rest;
  }
  const firstNode = context.nodes[0];
  if (!firstNode) throw new RangeError('A route policy requires at least one node.');
  return (
    chooseFirst(visibleNodes(context, 'battle'), context) ??
    (currentHealth >= 0.95 && canBuyRelic(context)
      ? chooseFirst(visibleNodes(context, 'store'), context)
      : undefined) ??
    chooseFirst(visibleNodes(context, 'rest'), context) ??
    chooseFirst(visibleNodes(context, 'elite'), context) ??
    firstNode
  );
}

export const ROUTE_POLICIES: Readonly<Record<RoutePolicyId, RoutePolicy>> = {
  balanced: balancedRoutePolicy,
  aggressive: aggressiveRoutePolicy,
  safe: safeRoutePolicy,
  random: (context) =>
    context.nodes[
      Math.min(context.nodes.length - 1, Math.floor(context.randomChoice() * context.nodes.length))
    ] ??
    (() => {
      throw new RangeError('A route policy requires at least one node.');
    })(),
};

function powerUpPreference(player: PlayerState): readonly ('health' | 'ad' | 'ap' | 'speed')[] {
  if (player.character.id === 'wizard') return ['ap', 'health', 'speed', 'ad'];
  if (player.character.id === 'samurai') return ['ad', 'speed', 'health', 'ap'];
  return ['health', 'ad', 'speed', 'ap'];
}

function applyPendingPowerUps(player: PlayerState): PlayerState {
  let next = player;
  while (next.powerUps.pending > 0) {
    const type = powerUpPreference(next).find((candidate) => next.powerUps.history[candidate] < 6);
    if (!type) break;
    const before = next;
    next = applyPowerUp(next, type);
    if (next === before) break;
  }
  return next;
}

function relicPreference(player: PlayerState): readonly string[] {
  if (player.character.id === 'wizard') {
    return [
      'apprentices-codex',
      'arcane-battery',
      'hexglass-prism',
      'alchemists-crown',
      'the-hourglass',
      'potion-satchel',
    ];
  }
  if (player.character.id === 'samurai') {
    return [
      'honed-edge',
      'echoing-blade',
      'oath-of-first-strike',
      'guarders-buckler',
      'war-drums',
      'swiftstep-anklet',
    ];
  }
  return [
    'guarders-buckler',
    'vitality-moss',
    'thornmail',
    'dungeon-heart',
    'potion-satchel',
    'swiftstep-anklet',
  ];
}

function shopOnce(
  player: PlayerState,
  floor: number,
  random: () => number,
): {
  player: PlayerState;
  goldSpent: number;
  potionsBought: number;
} {
  let next = player;
  let goldSpent = 0;
  let potionsBought = 0;
  const offers = generateStoreOffers(next, { floor, random });
  const preferredItem = relicPreference(next)
    .map((id) => offers.find((item) => item.id === id))
    .find((item) => item && next.gold >= item.price);

  if (preferredItem) {
    const result = purchaseItem(next, preferredItem.id);
    if (result.purchased) {
      goldSpent += next.gold - result.player.gold;
      next = result.player;
    }
  }

  if (next.potions < 5) {
    const offer = next.gold >= 400 ? 'potion-pack' : next.gold >= 100 ? 'potion' : null;
    if (offer) {
      const result = purchasePotions(next, offer);
      if (result.purchased) {
        goldSpent += next.gold - result.player.gold;
        potionsBought += result.player.potions - next.potions;
        next = result.player;
      }
    }
  }

  return { player: next, goldSpent, potionsBought };
}

function applyStartingRelics(
  player: PlayerState,
  relicIds: readonly string[] | undefined,
): PlayerState {
  if (!relicIds?.length) return player;
  return relicIds.reduce((current, relicId) => {
    const relic = STORE_ITEMS.find((candidate) => candidate.id === relicId);
    if (!relic || current.inventory.some((item) => item.id === relic.id)) return current;
    const result = purchaseItem({ ...current, gold: current.gold + relic.price }, relic.id);
    return result.purchased ? result.player : current;
  }, player);
}

function openRouteMap(player: PlayerState, floor: number, routeRoll: number): RouteMapState {
  const map = createRouteMap(floor, routeRoll);
  return player.inventory.some((item) => item.id === 'travelers-compass')
    ? revealHiddenRouteNodes(map, 1)
    : map;
}

function advanceSimulationRoute(
  player: PlayerState,
  map: RouteMapState,
  node: RouteNode,
): RouteMapState | null {
  const next = advanceRouteMap(map, node.id);
  if (!next) return null;
  return player.inventory.some((item) => item.id === 'travelers-compass')
    ? revealHiddenRouteNodes(next, 1)
    : next;
}

function runEncounter(
  player: PlayerState,
  playerDamageTaken: number,
  routeKind: Extract<RouteNodeKind, 'battle' | 'elite' | 'boss'>,
  random: () => number,
  combatPolicy: PlayerPolicyId,
  maxCombatTurns: number,
): {
  player: PlayerState;
  playerDamageTaken: number;
  enemyName: string;
  enemyLevel: number;
  result: FullRunSimulationResult['result'];
  elite: boolean;
  boss: boolean;
} {
  const generated = generateEnemy(
    player.level,
    random(),
    random(),
    player.bossesDefeated,
    routeKind === 'boss',
    routeKind === 'elite' ? player.level : undefined,
  );
  const enemy = routeKind === 'elite' ? strengthenElite(generated) : generated;
  const encounter = simulateEncounter({
    player,
    enemy,
    seed: Math.floor(random() * 4_294_967_295) || 1,
    policy: PLAYER_POLICIES[combatPolicy],
    startingHealthRatio: healthRatio(player, playerDamageTaken),
    maxTurns: maxCombatTurns,
    collectTrace: false,
  });
  const playerAfterCombat = { ...player, potions: encounter.playerPotions };
  if (encounter.result !== 'win') {
    return {
      player: playerAfterCombat,
      playerDamageTaken: player.stats.health - encounter.playerHealth,
      enemyName: enemy.definition.name,
      enemyLevel: enemy.level,
      result: encounter.result,
      elite: routeKind === 'elite',
      boss: enemy.definition.archetype === 'boss',
    };
  }

  const damageBeforeVictoryHeal = Math.max(0, player.stats.health - encounter.playerHealth);
  const rewardedPlayerBase = applyVictoryReward(playerAfterCombat, enemy);
  const maxHealthBonus = relicVictoryMaxHealthBonus(rewardedPlayerBase);
  let rewardedPlayer =
    maxHealthBonus > 0
      ? {
          ...rewardedPlayerBase,
          stats: {
            ...rewardedPlayerBase.stats,
            health: rewardedPlayerBase.stats.health + maxHealthBonus,
          },
        }
      : rewardedPlayerBase;
  const victoryHeal = relicVictoryHealAmount(rewardedPlayer);
  let rewardedDamageTaken = Math.max(0, damageBeforeVictoryHeal - victoryHeal);
  rewardedPlayer = applyPendingPowerUps(rewardedPlayer);
  rewardedDamageTaken = Math.min(rewardedDamageTaken, rewardedPlayer.stats.health);
  return {
    player: rewardedPlayer,
    playerDamageTaken: rewardedDamageTaken,
    enemyName: enemy.definition.name,
    enemyLevel: enemy.level,
    result: 'win',
    elite: routeKind === 'elite',
    boss: enemy.definition.archetype === 'boss',
  };
}

export function simulateFullRun(options: FullRunSimulationOptions): FullRunSimulationResult {
  const maxRooms = options.maxRooms ?? DEFAULT_MAX_ROOMS;
  const maxCombatTurns = options.maxCombatTurns ?? DEFAULT_MAX_COMBAT_TURNS;
  if (!Number.isSafeInteger(maxRooms) || maxRooms < 1) {
    throw new RangeError('Full-run maxRooms must be a positive safe integer.');
  }
  if (!Number.isSafeInteger(maxCombatTurns) || maxCombatTurns < 1) {
    throw new RangeError('Full-run maxCombatTurns must be a positive safe integer.');
  }

  const character = CHARACTER_DEFINITIONS.find((candidate) => candidate.id === options.characterId);
  if (!character) throw new RangeError(`Unknown run character: ${options.characterId}`);
  let player = applyStartingRelics(
    createInitialPlayer('Simulation player', character),
    options.startingRelicIds,
  );
  let playerDamageTaken = 0;
  let map = openRouteMap(player, 1, createSeededRandom(options.seed)());
  const random = createSeededRandom(options.seed ^ 0x517cc1b7);
  const decisionRandom = createSeededRandom(options.seed ^ 0x9e3779b9);
  const routeCounts = { ...EMPTY_ROUTE_COUNTS };
  const trace: RunTraceEvent[] = [];
  let room = 0;
  let result: FullRunSimulationResult['result'] = 'draw';
  let finalFloor = map.floor;
  let combats = 0;
  let combatWins = 0;
  let eliteCombats = 0;
  let eliteWins = 0;
  let bossesDefeated = 0;
  let storesVisited = 0;
  let restsVisited = 0;
  let goldSpent = 0;
  let potionsPurchased = 0;

  while (room < maxRooms && result === 'draw' && player.bossesDefeated < BOSS_ROOMS.length) {
    const policyContext: RunDecisionContext = {
      player,
      playerDamageTaken,
      map,
      nodes: map.nodes,
      randomChoice: decisionRandom,
    };
    const node = ROUTE_POLICIES[options.routePolicy](policyContext);
    if (!node) {
      result = 'draw';
      break;
    }
    room += 1;
    finalFloor = map.floor;
    routeCounts[node.kind] += 1;

    if (node.kind === 'battle' || node.kind === 'elite' || node.kind === 'boss') {
      combats += 1;
      if (node.kind === 'elite') eliteCombats += 1;
      const encounter = runEncounter(
        player,
        playerDamageTaken,
        node.kind,
        random,
        options.combatPolicy,
        maxCombatTurns,
      );
      const encounterFailed = encounter.result !== 'win';
      player = encounter.player;
      playerDamageTaken = encounter.playerDamageTaken;
      if (encounter.result === 'win') {
        combatWins += 1;
        if (encounter.elite) eliteWins += 1;
        if (encounter.boss) bossesDefeated += 1;
      } else {
        result = encounter.result;
      }
      if (options.collectTrace ?? true) {
        trace.push({
          room,
          floor: map.floor,
          kind: node.kind,
          result: encounter.result,
          enemy: encounter.enemyName,
          enemyLevel: encounter.enemyLevel,
          playerHealth: remainingHealth(player, playerDamageTaken),
          gold: player.gold,
          relics: player.inventory.length,
        });
      }
      if (encounterFailed) break;
    } else if (node.kind === 'rest') {
      restsVisited += 1;
      const rest = resolveHeal(playerDamageTaken, player.stats.health, 0.3);
      playerDamageTaken = rest.damageTaken;
      if (options.collectTrace ?? true) {
        trace.push({
          room,
          floor: map.floor,
          kind: node.kind,
          playerHealth: remainingHealth(player, playerDamageTaken),
          gold: player.gold,
          relics: player.inventory.length,
        });
      }
    } else {
      storesVisited += 1;
      const shop = shopOnce(player, map.floor, random);
      player = shop.player;
      goldSpent += shop.goldSpent;
      potionsPurchased += shop.potionsBought;
      if (options.collectTrace ?? true) {
        trace.push({
          room,
          floor: map.floor,
          kind: node.kind,
          playerHealth: remainingHealth(player, playerDamageTaken),
          gold: player.gold,
          relics: player.inventory.length,
        });
      }
    }

    if (result !== 'draw') break;
    if (room >= maxRooms || player.bossesDefeated >= BOSS_ROOMS.length) break;
    map =
      advanceSimulationRoute(player, map, node) ?? openRouteMap(player, map.floor + 1, random());
  }

  if (result === 'draw' && player.bossesDefeated >= BOSS_ROOMS.length) result = 'win';
  return {
    result,
    roomsVisited: room,
    finalFloor,
    finalLevel: player.level,
    finalHealthRatio: healthRatio(player, playerDamageTaken),
    finalGold: player.gold,
    finalPotions: player.potions,
    relics: player.inventory.length,
    combats,
    combatWins,
    eliteCombats,
    eliteWins,
    bossesDefeated,
    storesVisited,
    restsVisited,
    goldSpent,
    potionsPurchased,
    routeCounts,
    trace,
  };
}

export interface FullRunReportOptions {
  readonly seed?: number;
  readonly samplesPerCell?: number;
  readonly maxRooms?: number;
  readonly maxCombatTurns?: number;
  readonly startingRelicIds?: readonly string[];
  readonly characters?: readonly CharacterId[];
  readonly combatPolicies?: readonly PlayerPolicyId[];
  readonly routePolicies?: readonly RoutePolicyId[];
}

function summarize(
  characterId: CharacterId,
  combatPolicy: PlayerPolicyId,
  routePolicy: RoutePolicyId,
  samples: number,
  seed: number,
  maxRooms: number,
  maxCombatTurns: number,
  startingRelicIds: readonly string[] | undefined,
): FullRunSummary {
  const results: FullRunSimulationResult[] = [];
  for (let sample = 0; sample < samples; sample += 1) {
    results.push(
      simulateFullRun({
        characterId,
        combatPolicy,
        routePolicy,
        seed: (seed + sample * 7_919) >>> 0,
        maxRooms,
        maxCombatTurns,
        startingRelicIds,
        collectTrace: false,
      }),
    );
  }
  const playerCharacter = CHARACTER_DEFINITIONS.find((candidate) => candidate.id === characterId);
  if (!playerCharacter) throw new RangeError(`Unknown run character: ${characterId}`);
  const wins = results.filter((run) => run.result === 'win').length;
  const losses = results.filter((run) => run.result === 'loss').length;
  const routeTotals = { ...EMPTY_ROUTE_COUNTS };
  results.forEach((run) => {
    ROUTE_KINDS.forEach((kind) => (routeTotals[kind] += run.routeCounts[kind]));
  });
  const rooms = Math.max(
    1,
    results.reduce((total, run) => total + run.roomsVisited, 0),
  );

  return {
    character: playerCharacter.name,
    combatPolicy,
    routePolicy,
    samples,
    wins,
    losses,
    draws: samples - wins - losses,
    completionRate: wins / samples,
    averageRooms: average(results.map((run) => run.roomsVisited)),
    averageFinalFloor: average(results.map((run) => run.finalFloor)),
    averageFinalLevel: average(results.map((run) => run.finalLevel)),
    averageFinalHealth: average(results.map((run) => run.finalHealthRatio)),
    averageRelics: average(results.map((run) => run.relics)),
    averagePotions: average(results.map((run) => run.finalPotions)),
    averageGold: average(results.map((run) => run.finalGold)),
    averageCombats: average(results.map((run) => run.combats)),
    averageEliteWins: average(results.map((run) => run.eliteWins)),
    averageBossesDefeated: average(results.map((run) => run.bossesDefeated)),
    averageStores: average(results.map((run) => run.storesVisited)),
    averageRests: average(results.map((run) => run.restsVisited)),
    averageGoldSpent: average(results.map((run) => run.goldSpent)),
    routeRates: Object.fromEntries(
      ROUTE_KINDS.map((kind) => [kind, routeTotals[kind] / rooms]),
    ) as Readonly<Record<RouteNodeKind, number>>,
  };
}

export function runFullRunReport(options: FullRunReportOptions = {}): FullRunReport {
  const seed = options.seed ?? 42;
  const samplesPerCell = options.samplesPerCell ?? 200;
  const maxRooms = options.maxRooms ?? DEFAULT_MAX_ROOMS;
  const maxCombatTurns = options.maxCombatTurns ?? DEFAULT_MAX_COMBAT_TURNS;
  const characters = options.characters ?? CHARACTER_DEFINITIONS.map((character) => character.id);
  const combatPolicies = options.combatPolicies ?? ['class', 'reactive'];
  const routePolicies = options.routePolicies ?? ['balanced', 'aggressive', 'safe'];
  if (!Number.isSafeInteger(samplesPerCell) || samplesPerCell < 1) {
    throw new RangeError('Full-run report samplesPerCell must be a positive safe integer.');
  }

  const summaries = characters.flatMap((characterId) =>
    combatPolicies.flatMap((combatPolicy) =>
      routePolicies.map((routePolicy) =>
        summarize(
          characterId,
          combatPolicy,
          routePolicy,
          samplesPerCell,
          seed,
          maxRooms,
          maxCombatTurns,
          options.startingRelicIds,
        ),
      ),
    ),
  );
  return { seed, samplesPerCell, maxRooms, summaries };
}

export function formatFullRunReport(report: FullRunReport): string {
  const lines = [
    `Hexakill full-run lab · ${report.samplesPerCell.toLocaleString()} samples/cell · seed ${report.seed}`,
    'Character  Combat    Route       Win     Rooms  Level  HP left  Relics  Bosses  Gold spent  Battle/Elite/Store/Rest',
  ];
  for (const summary of report.summaries) {
    const rates = summary.routeRates;
    lines.push(
      `${summary.character.padEnd(10)} ${summary.combatPolicy.padEnd(9)} ${summary.routePolicy.padEnd(11)} ${percent(summary.completionRate).padStart(6)} ${fixed(summary.averageRooms).padStart(7)} ${fixed(summary.averageFinalLevel).padStart(6)} ${percent(summary.averageFinalHealth).padStart(8)} ${fixed(summary.averageRelics).padStart(7)} ${fixed(summary.averageBossesDefeated).padStart(7)} ${fixed(summary.averageGoldSpent).padStart(11)} ${[rates.battle, rates.elite, rates.store, rates.rest].map(percent).join('/')}`,
    );
  }
  return lines.join('\n');
}

export const fullRunSimulationDefaults = {
  defaultMaxRooms: DEFAULT_MAX_ROOMS,
  defaultMaxCombatTurns: DEFAULT_MAX_COMBAT_TURNS,
  defaultSamples: 200,
} as const;

export { STORE_ITEMS };
