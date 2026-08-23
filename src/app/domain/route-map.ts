export type RouteNodeKind = 'battle' | 'elite' | 'store' | 'rest';
// Future room type: add 'event' once event rules and its resolution UI are defined.

export interface RouteNode {
  readonly id: string;
  readonly kind: RouteNodeKind;
  readonly hidden?: boolean;
  readonly title: string;
  readonly description: string;
  readonly reward: string;
}

export interface RouteMapState {
  readonly floor: number;
  readonly nodes: readonly RouteNode[];
}

const ROUTE_PATTERNS: readonly (readonly RouteNodeKind[])[] = [
  ['battle', 'rest', 'store'],
  ['battle', 'elite', 'store'],
  ['battle', 'rest', 'elite'],
  ['battle', 'store', 'battle'],
];

const NODE_COPY: Readonly<Record<RouteNodeKind, Omit<RouteNode, 'id' | 'kind'>>> = {
  battle: {
    title: 'Skirmish',
    description: 'A fair fight to keep your run moving.',
    reward: 'Gold · experience · chance to level up',
  },
  elite: {
    title: 'Elite foe',
    description: 'A stronger enemy guards a richer reward.',
    reward: 'More dangerous · more gold',
  },
  store: {
    title: 'Merchant',
    description: 'Trade your gold for potions and passive relics.',
    reward: 'Relics · potions · build power',
  },
  rest: {
    title: 'Campfire',
    description: 'Take a breath and restore part of your health.',
    reward: 'Recover 25% of damage taken',
  },
};

function assertFloor(floor: number): void {
  if (!Number.isSafeInteger(floor) || floor < 1) {
    throw new RangeError('Route floors must be positive safe integers.');
  }
}

function assertRoll(roll: number): void {
  if (!Number.isFinite(roll) || roll < 0 || roll >= 1) {
    throw new RangeError('Route rolls must be in the range [0, 1).');
  }
}

export function createRouteMap(floor: number, routeRoll: number): RouteMapState {
  assertFloor(floor);
  assertRoll(routeRoll);
  const pattern = ROUTE_PATTERNS[Math.floor(routeRoll * ROUTE_PATTERNS.length)];
  if (!pattern) throw new RangeError('Route pattern is missing for the requested roll.');
  const hiddenCount = routeRoll < 0.5 ? 1 : 2;
  const firstHiddenIndex = 1 + (Math.floor(routeRoll * 2) % 2);
  const hiddenIndexes = new Set<number>([firstHiddenIndex]);
  if (hiddenCount === 2) hiddenIndexes.add(firstHiddenIndex === 1 ? 2 : 1);

  return {
    floor,
    nodes: pattern.map((kind, index) => ({
      id: `floor-${floor}-${index + 1}`,
      kind,
      hidden: hiddenIndexes.has(index),
      ...NODE_COPY[kind],
    })),
  };
}

export function findRouteNode(map: RouteMapState, nodeId: string): RouteNode | undefined {
  return map.nodes.find((node) => node.id === nodeId);
}

export function revealHiddenRouteNodes(map: RouteMapState, count: number): RouteMapState {
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new RangeError('The number of route nodes to reveal must be a non-negative integer.');
  }
  let remaining = count;
  return {
    ...map,
    nodes: map.nodes.map((node) => {
      if (!node.hidden || remaining === 0) return node;
      remaining -= 1;
      return { ...node, hidden: false };
    }),
  };
}

export function isRouteNodeKind(value: unknown): value is RouteNodeKind {
  return value === 'battle' || value === 'elite' || value === 'store' || value === 'rest';
}

export function isRouteMapState(value: unknown): value is RouteMapState {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  const nodes = record['nodes'];
  return (
    Number.isSafeInteger(record['floor']) &&
    Number(record['floor']) >= 1 &&
    Array.isArray(nodes) &&
    nodes.length === 3 &&
    nodes.every((node) => {
      if (typeof node !== 'object' || node === null) return false;
      const candidate = node as Record<string, unknown>;
      return (
        typeof candidate['id'] === 'string' &&
        isRouteNodeKind(candidate['kind']) &&
        (candidate['hidden'] === undefined || typeof candidate['hidden'] === 'boolean') &&
        typeof candidate['title'] === 'string' &&
        typeof candidate['description'] === 'string' &&
        typeof candidate['reward'] === 'string'
      );
    })
  );
}
