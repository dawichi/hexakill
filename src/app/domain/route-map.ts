import { BOSSES } from './enemies';
import { createRng, Rng, shuffle } from './random';

export type RouteNodeKind = 'battle' | 'elite' | 'store' | 'rest' | 'boss';
export type RouteRisk = 'safe' | 'steady' | 'dangerous' | 'milestone';

export const BOSS_ROOMS = [10, 20, 30] as const;
export const FINAL_ROOM = 30;
/** Rooms right before each boss always offer a visible campfire. */
const CAMPFIRE_ROOMS = [8, 18, 28] as const;
export const REST_HEAL = 0.3;

export interface RouteNode {
  readonly id: string;
  readonly room: number;
  /** 0 = left, 1 = center, 2 = right. */
  readonly lane: number;
  readonly kind: RouteNodeKind;
  readonly hidden: boolean;
  readonly nextIds: readonly string[];
}

export type RouteGraph = readonly (readonly RouteNode[])[];

export interface RouteNodeCopy {
  readonly title: string;
  readonly description: string;
  readonly reward: string;
  readonly risk: RouteRisk;
}

const ROUTE_PATTERNS: readonly (readonly RouteNodeKind[])[] = [
  ['battle', 'rest', 'store'],
  ['battle', 'elite', 'store'],
  ['battle', 'rest', 'elite'],
  ['battle', 'store', 'battle'],
];

const NODE_COPY: Readonly<Record<Exclude<RouteNodeKind, 'boss'>, RouteNodeCopy>> = {
  battle: {
    title: 'Skirmish',
    description: 'A fair fight to keep your run moving.',
    reward: 'Gold · experience',
    risk: 'steady',
  },
  elite: {
    title: 'Elite foe',
    description: 'A stronger enemy, at least your level, guards a richer reward.',
    reward: '+50% gold · more experience',
    risk: 'dangerous',
  },
  store: {
    title: 'Merchant',
    description: 'Trade your gold for potions and passive relics.',
    reward: 'Relics · potions',
    risk: 'safe',
  },
  rest: {
    title: 'Campfire',
    description: 'Take a breath before the next fight.',
    reward: `Restore up to ${REST_HEAL * 100}% of max Health`,
    risk: 'safe',
  },
};

export function bossIndexForRoom(room: number): number {
  return BOSS_ROOMS.indexOf(room as (typeof BOSS_ROOMS)[number]);
}

export function routeNodeCopy(node: Pick<RouteNode, 'kind' | 'room'>): RouteNodeCopy {
  if (node.kind !== 'boss') return NODE_COPY[node.kind];
  const boss = BOSSES[bossIndexForRoom(node.room)];
  return {
    title: boss?.name ?? 'Guardian',
    description: boss?.title ?? 'A guardian blocks the path forward.',
    reward: 'Defeat the guardian to continue',
    risk: 'milestone',
  };
}

function layerKinds(rng: Rng, room: number): readonly RouteNodeKind[] {
  if (bossIndexForRoom(room) >= 0) return ['boss'];
  if ((CAMPFIRE_ROOMS as readonly number[]).includes(room)) return ['battle', 'rest', 'store'];
  const pattern =
    ROUTE_PATTERNS[Math.floor(rng.next() * ROUTE_PATTERNS.length)] ?? ROUTE_PATTERNS[0];
  return shuffle(rng, pattern ?? []);
}

/** The whole 30-room graph is derived from the run seed, so saves only store visited ids. */
export function createRouteGraph(seed: number): RouteGraph {
  const rng = createRng(seed ^ 0x5eed_0a7e);
  const kinds = Array.from({ length: FINAL_ROOM }, (_, index) => layerKinds(rng, index + 1));
  const layers = kinds.map((layer, index) => {
    const room = index + 1;
    const boss = layer.length === 1;
    const campfire = (CAMPFIRE_ROOMS as readonly number[]).includes(room);
    const hiddenCount = boss ? 0 : rng.next() < 0.5 ? 1 : 2;
    const candidates = layer
      .map((kind, lane) => ({ kind, lane }))
      .filter(({ kind }) => !(campfire && kind === 'rest'));
    const hiddenLanes = new Set(
      shuffle(rng, candidates)
        .slice(0, hiddenCount)
        .map((c) => c.lane),
    );
    return layer.map((kind, lane) => ({
      room,
      lane: boss ? 1 : lane,
      kind,
      hidden: hiddenLanes.has(lane),
      id: boss ? `room-${room}-boss` : `room-${room}-${lane}`,
    }));
  });
  return layers.map((layer, index) => {
    const next = layers[index + 1] ?? [];
    return layer.map((node) => ({
      ...node,
      nextIds: next
        .filter((candidate) => next.length === 1 || Math.abs(candidate.lane - node.lane) <= 1)
        .map((candidate) => candidate.id),
    }));
  });
}

export function findRouteNode(graph: RouteGraph, id: string): RouteNode | undefined {
  for (const layer of graph) {
    const node = layer.find((candidate) => candidate.id === id);
    if (node) return node;
  }
  return undefined;
}

/**
 * The nodes the player can choose next. `reveal` hidden nodes are uncovered (Traveler's Compass).
 */
export function routeFrontier(
  graph: RouteGraph,
  visited: readonly string[],
  reveal = 0,
): readonly RouteNode[] {
  const lastId = visited.at(-1);
  const last = lastId === undefined ? undefined : findRouteNode(graph, lastId);
  const nodes = last
    ? (graph[last.room] ?? []).filter((node) => last.nextIds.includes(node.id))
    : (graph[0] ?? []);
  let remaining = reveal;
  return nodes.map((node) => {
    if (!node.hidden || remaining <= 0) return node;
    remaining -= 1;
    return { ...node, hidden: false };
  });
}

/** A path is valid when it starts in room 1 and every step follows a graph edge. */
export function isValidPath(graph: RouteGraph, visited: readonly string[]): boolean {
  return visited.every((id, index) => {
    const node = findRouteNode(graph, id);
    if (!node || node.room !== index + 1) return false;
    const previousId = visited[index - 1];
    if (previousId === undefined) return true;
    return findRouteNode(graph, previousId)?.nextIds.includes(id) ?? false;
  });
}
