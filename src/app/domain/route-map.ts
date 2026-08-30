export type RouteNodeKind = 'battle' | 'elite' | 'store' | 'rest' | 'boss';
export type RouteLane = 'left' | 'center' | 'right';
export type RouteRisk = 'safe' | 'steady' | 'dangerous' | 'milestone';
// Future room type: add 'event' once event rules and its resolution UI are defined.

export const BOSS_ROOMS = [10, 20, 30] as const;
export const FINAL_ROOM = 30;

export interface RouteNode {
  readonly id: string;
  readonly kind: RouteNodeKind;
  readonly hidden?: boolean;
  readonly title: string;
  readonly description: string;
  readonly reward: string;
  /** New maps use a stable lane so the route can be read as a connected graph. */
  readonly lane?: RouteLane;
  /** The graph edges that become available after this room is completed. */
  readonly nextNodeIds?: readonly string[];
  /** A privacy-safe forecast for the next layer, used by the route cards. */
  readonly nextKinds?: readonly RouteNodeKind[];
  readonly risk?: RouteRisk;
}

export interface RouteLayer {
  readonly floor: number;
  readonly nodes: readonly RouteNode[];
}

export interface RouteMapState {
  /** The room whose choices are currently presented. */
  readonly floor: number;
  /** Reachable nodes from the player's current position. */
  readonly nodes: readonly RouteNode[];
  /** Full run graph. Optional only for compatibility with pre-graph saves/fixtures. */
  readonly layers?: readonly RouteLayer[];
  readonly visitedNodeIds?: readonly string[];
}

const ROUTE_PATTERNS: readonly (readonly RouteNodeKind[])[] = [
  ['battle', 'rest', 'store'],
  ['battle', 'elite', 'store'],
  ['battle', 'rest', 'elite'],
  ['battle', 'store', 'battle'],
];

const LANES: readonly RouteLane[] = ['left', 'center', 'right'];

const NODE_COPY: Readonly<Record<RouteNodeKind, Omit<RouteNode, 'id' | 'kind'>>> = {
  battle: {
    title: 'Skirmish',
    description: 'A fair fight to keep your run moving.',
    reward: 'Gold · experience · chance to level up',
    risk: 'steady',
  },
  elite: {
    title: 'Elite foe',
    description: 'A stronger enemy guards a richer reward.',
    reward: 'More dangerous · more gold',
    risk: 'dangerous',
  },
  store: {
    title: 'Merchant',
    description: 'Trade your gold for potions and passive relics.',
    reward: 'Relics · potions · build power',
    risk: 'safe',
  },
  rest: {
    title: 'Campfire',
    description: 'Take a breath and restore part of your health.',
    reward: 'Recover 30% of damage taken',
    risk: 'safe',
  },
  boss: {
    title: 'Gold Slime',
    description: 'A milestone guardian blocks the path forward.',
    reward: 'Defeat the guardian to continue',
    risk: 'milestone',
  },
};

function assertFloor(floor: number): void {
  if (!Number.isSafeInteger(floor) || floor < 1 || floor > FINAL_ROOM) {
    throw new RangeError(`Route floors must be safe integers from 1 to ${FINAL_ROOM}.`);
  }
}

function assertRoll(roll: number): void {
  if (!Number.isFinite(roll) || roll < 0 || roll >= 1) {
    throw new RangeError('Route rolls must be in the range [0, 1).');
  }
}

function isBossRoom(floor: number): boolean {
  return BOSS_ROOMS.includes(floor as (typeof BOSS_ROOMS)[number]);
}

function laneIndex(lane: RouteLane): number {
  return LANES.indexOf(lane);
}

/** A tiny deterministic mixer keeps the full graph stable without storing random calls. */
function mixedRoll(seed: number, floor: number, lane: number): number {
  const value = Math.sin((seed + 0.031 * floor + 0.071 * lane) * 12_345.6789) * 43_758.5453;
  return value - Math.floor(value);
}

function nodeId(floor: number, lane: RouteLane): string {
  return isBossRoom(floor) ? `floor-${floor}-boss` : `floor-${floor}-${laneIndex(lane) + 1}`;
}

function routeKinds(floor: number, seed: number): readonly RouteNodeKind[] {
  if (isBossRoom(floor)) return ['boss'];
  // A visible campfire before each guardian keeps route identity meaningful
  // without letting a bad early fork make the next milestone unrecoverable.
  if (floor === 8 || floor === 18 || floor === 28) return ['battle', 'rest', 'store'];
  const pattern = ROUTE_PATTERNS[Math.floor(mixedRoll(seed, floor, 9) * ROUTE_PATTERNS.length)];
  if (!pattern) throw new RangeError('Route pattern is missing for the requested roll.');
  return pattern;
}

function routeHidden(floor: number, lane: number, seed: number): boolean {
  if (isBossRoom(floor)) return false;
  if ((floor === 8 || floor === 18 || floor === 28) && lane === 1) return false;
  // Reveal one or two nodes up front. The graph stores the same visibility so a
  // forecast never leaks the identity of a hidden successor.
  const roll = mixedRoll(seed, floor, 13);
  const hiddenCount = roll < 0.5 ? 1 : 2;
  const firstHiddenIndex = 1 + (Math.floor(roll * 2) % 2);
  const hiddenIndexes = new Set<number>([firstHiddenIndex]);
  if (hiddenCount === 2) hiddenIndexes.add(firstHiddenIndex === 1 ? 2 : 1);
  return hiddenIndexes.has(lane);
}

function createLayer(floor: number, seed: number): RouteLayer {
  const kinds = routeKinds(floor, seed);
  const nodes = kinds.map((kind, index) => {
    const lane: RouteLane = isBossRoom(floor) ? 'center' : (LANES[index] ?? 'center');
    return {
      id: nodeId(floor, lane),
      kind,
      hidden: routeHidden(floor, index, seed),
      lane,
      ...NODE_COPY[kind],
    };
  });
  return { floor, nodes };
}

function connectLayers(layers: readonly RouteLayer[]): readonly RouteLayer[] {
  return layers.map((layer, layerIndex) => {
    const nextLayer = layers[layerIndex + 1];
    return {
      ...layer,
      nodes: layer.nodes.map((node) => {
        if (!nextLayer) return node;
        if (nextLayer.nodes.length === 1) {
          const next = nextLayer.nodes[0];
          return next ? { ...node, nextNodeIds: [next.id], nextKinds: ['boss'] } : node;
        }

        const currentLane = laneIndex(node.lane ?? 'center');
        const nextNodes = nextLayer.nodes.filter((candidate) => {
          const candidateLane = laneIndex(candidate.lane ?? 'center');
          return Math.abs(candidateLane - currentLane) <= 1;
        });
        const nextNodeIds = nextNodes.map((candidate) => candidate.id);
        const nextKinds = nextNodes
          .filter((candidate) => !candidate.hidden)
          .map((candidate) => candidate.kind);
        return { ...node, nextNodeIds, nextKinds };
      }),
    };
  });
}

function graphFor(seed: number): readonly RouteLayer[] {
  return connectLayers(
    Array.from({ length: FINAL_ROOM }, (_, index) => createLayer(index + 1, seed)),
  );
}

function currentNodesFor(layers: readonly RouteLayer[], floor: number): readonly RouteNode[] {
  return layers.find((layer) => layer.floor === floor)?.nodes ?? [];
}

function legacyCurrentLayer(floor: number, routeRoll: number): RouteLayer {
  if (isBossRoom(floor)) {
    return {
      floor,
      nodes: [
        {
          id: `floor-${floor}-boss`,
          kind: 'boss',
          hidden: false,
          lane: 'center',
          ...NODE_COPY.boss,
        },
      ],
    };
  }
  const pattern =
    floor === 8 || floor === 18 || floor === 28
      ? (['battle', 'rest', 'store'] as const)
      : ROUTE_PATTERNS[Math.floor(routeRoll * ROUTE_PATTERNS.length)];
  if (!pattern) throw new RangeError('Route pattern is missing for the requested roll.');
  if (pattern.length !== 3) throw new RangeError('A regular route requires three path lanes.');
  const hiddenCount = routeRoll < 0.5 ? 1 : 2;
  const firstHiddenIndex = 1 + (Math.floor(routeRoll * 2) % 2);
  const hiddenIndexes = new Set<number>([firstHiddenIndex]);
  if (hiddenCount === 2) hiddenIndexes.add(firstHiddenIndex === 1 ? 2 : 1);
  return {
    floor,
    nodes: pattern.map((kind, index) => ({
      id: `floor-${floor}-${index + 1}`,
      kind,
      hidden:
        (floor === 8 || floor === 18 || floor === 28) && index === 1
          ? false
          : hiddenIndexes.has(index),
      lane: LANES[index],
      ...NODE_COPY[kind],
    })),
  };
}

/**
 * Create a complete 30-room graph while keeping the requested floor as the
 * visible frontier. The route roll is the run seed for deterministic replay.
 */
export function createRouteMap(floor: number, routeRoll: number): RouteMapState {
  assertFloor(floor);
  assertRoll(routeRoll);
  const generatedLayers = graphFor(routeRoll);
  const currentLayer = legacyCurrentLayer(floor, routeRoll);
  const layers = generatedLayers.map((layer) => (layer.floor === floor ? currentLayer : layer));
  const connectedLayers = connectLayers(layers);
  return {
    floor,
    nodes: currentNodesFor(connectedLayers, floor),
    layers: connectedLayers,
    visitedNodeIds: [],
  };
}

export function findRouteNode(map: RouteMapState, nodeIdValue: string): RouteNode | undefined {
  return map.nodes.find((node) => node.id === nodeIdValue);
}

export function revealHiddenRouteNodes(map: RouteMapState, count: number): RouteMapState {
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new RangeError('The number of route nodes to reveal must be a non-negative integer.');
  }
  let remaining = count;
  const revealedIds = new Set<string>();
  const nodes = map.nodes.map((node) => {
    if (!node.hidden || remaining === 0) return node;
    remaining -= 1;
    revealedIds.add(node.id);
    return { ...node, hidden: false };
  });
  const layers = map.layers?.map((layer) => ({
    ...layer,
    nodes: layer.nodes.map((node) =>
      revealedIds.has(node.id) ? { ...node, hidden: false } : node,
    ),
  }));
  return { ...map, nodes, ...(layers ? { layers } : {}) };
}

/** Advance the frontier to the selected node's connected successors. */
export function advanceRouteMap(map: RouteMapState, selectedNodeId: string): RouteMapState | null {
  const selected = findRouteNode(map, selectedNodeId);
  const layers = map.layers;
  if (!selected || !layers || !selected.nextNodeIds?.length) return null;
  const nextFloor = map.floor + 1;
  if (nextFloor > FINAL_ROOM) return null;
  const nextIds = new Set(selected.nextNodeIds);
  const nextNodes = currentNodesFor(layers, nextFloor).filter((node) => nextIds.has(node.id));
  if (!nextNodes.length) return null;
  return {
    floor: nextFloor,
    nodes: nextNodes,
    layers,
    visitedNodeIds: [...(map.visitedNodeIds ?? []), selectedNodeId],
  };
}

export function isRouteNodeKind(value: unknown): value is RouteNodeKind {
  return (
    value === 'battle' ||
    value === 'elite' ||
    value === 'store' ||
    value === 'rest' ||
    value === 'boss'
  );
}

function isRouteLane(value: unknown): value is RouteLane {
  return value === 'left' || value === 'center' || value === 'right';
}

function isRouteRisk(value: unknown): value is RouteRisk {
  return value === 'safe' || value === 'steady' || value === 'dangerous' || value === 'milestone';
}

function isRouteNode(value: unknown): value is RouteNode {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  const nextKinds = candidate['nextKinds'];
  const nextNodeIds = candidate['nextNodeIds'];
  return (
    typeof candidate['id'] === 'string' &&
    isRouteNodeKind(candidate['kind']) &&
    (candidate['hidden'] === undefined || typeof candidate['hidden'] === 'boolean') &&
    typeof candidate['title'] === 'string' &&
    typeof candidate['description'] === 'string' &&
    typeof candidate['reward'] === 'string' &&
    (candidate['lane'] === undefined || isRouteLane(candidate['lane'])) &&
    (candidate['risk'] === undefined || isRouteRisk(candidate['risk'])) &&
    (nextNodeIds === undefined ||
      (Array.isArray(nextNodeIds) && nextNodeIds.every((id) => typeof id === 'string'))) &&
    (nextKinds === undefined || (Array.isArray(nextKinds) && nextKinds.every(isRouteNodeKind)))
  );
}

function isRouteLayer(value: unknown): value is RouteLayer {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    Number.isSafeInteger(candidate['floor']) &&
    Number(candidate['floor']) >= 1 &&
    Number(candidate['floor']) <= FINAL_ROOM &&
    Array.isArray(candidate['nodes']) &&
    candidate['nodes'].every(isRouteNode)
  );
}

function hasValidGraph(value: unknown, floor: number, currentNodes: readonly RouteNode[]): boolean {
  if (!Array.isArray(value) || value.length !== FINAL_ROOM || !value.every(isRouteLayer)) {
    return false;
  }
  const layers = value as readonly RouteLayer[];
  if (layers.some((layer, index) => layer.floor !== index + 1)) return false;
  if (
    layers.some((layer) =>
      isBossRoom(layer.floor)
        ? layer.nodes.length !== 1 || layer.nodes[0]?.kind !== 'boss'
        : layer.nodes.length !== 3,
    )
  ) {
    return false;
  }
  const allIds = layers.flatMap((layer) => layer.nodes.map((node) => node.id));
  if (new Set(allIds).size !== allIds.length) return false;
  const currentLayer = layers[floor - 1];
  if (
    !currentLayer ||
    currentNodes.some((node) => !currentLayer.nodes.some((candidate) => candidate.id === node.id))
  ) {
    return false;
  }

  return layers.every((layer, index) => {
    const nextIds = new Set((layers[index + 1]?.nodes ?? []).map((node) => node.id));
    return layer.nodes.every((node) =>
      (node.nextNodeIds ?? []).every((nextNodeId) => nextIds.has(nextNodeId)),
    );
  });
}

export function isRouteMapState(value: unknown): value is RouteMapState {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  const nodes = record['nodes'];
  const floor = record['floor'];
  const isBoss = BOSS_ROOMS.includes(floor as (typeof BOSS_ROOMS)[number]);
  const layersValue = record['layers'];
  const layers = Array.isArray(layersValue) ? layersValue : null;
  const visitedNodeIds = record['visitedNodeIds'];
  const hasGraph = layers !== null;
  const hasAdvancedFrontier = Array.isArray(visitedNodeIds) && visitedNodeIds.length > 0;
  return (
    Number.isSafeInteger(floor) &&
    Number(floor) >= 1 &&
    Number(floor) <= FINAL_ROOM &&
    Array.isArray(nodes) &&
    (isBoss
      ? nodes.length === 1
      : hasGraph && hasAdvancedFrontier
        ? nodes.length >= 1 && nodes.length <= 3
        : nodes.length === 3) &&
    nodes.every(isRouteNode) &&
    (!isBoss || nodes[0]?.kind === 'boss') &&
    (layersValue === undefined ||
      hasValidGraph(layersValue, Number(floor), nodes as RouteNode[])) &&
    (visitedNodeIds === undefined ||
      (Array.isArray(visitedNodeIds) && visitedNodeIds.every((id) => typeof id === 'string')))
  );
}
