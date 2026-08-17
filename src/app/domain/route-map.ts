export type RouteNodeKind = 'battle' | 'elite' | 'store' | 'rest';

export interface RouteNode {
  readonly id: string;
  readonly kind: RouteNodeKind;
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
  ['rest', 'battle', 'elite'],
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
    description: 'Trade your gold for potions and equipment.',
    reward: 'Shop · recover your supplies',
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

  return {
    floor,
    nodes: pattern.map((kind, index) => ({
      id: `floor-${floor}-${index + 1}`,
      kind,
      ...NODE_COPY[kind],
    })),
  };
}

export function findRouteNode(map: RouteMapState, nodeId: string): RouteNode | undefined {
  return map.nodes.find((node) => node.id === nodeId);
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
        typeof candidate['title'] === 'string' &&
        typeof candidate['description'] === 'string' &&
        typeof candidate['reward'] === 'string'
      );
    })
  );
}
