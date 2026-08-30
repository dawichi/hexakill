import { describe, expect, it } from 'vitest';
import {
  advanceRouteMap,
  createRouteMap,
  findRouteNode,
  isRouteMapState,
  revealHiddenRouteNodes,
} from './route-map';

describe('route map', () => {
  it('creates three readable choices for a floor', () => {
    const map = createRouteMap(3, 0.5);

    expect(map.floor).toBe(3);
    expect(map.nodes).toHaveLength(3);
    expect(map.nodes.map((node) => node.kind)).toEqual(['battle', 'rest', 'elite']);
    expect(map.nodes.map((node) => node.hidden)).toEqual([false, true, true]);
    expect(map.nodes.every((node) => node.id.startsWith('floor-3-'))).toBe(true);
  });

  it('finds a selected branch by its stable id', () => {
    const map = createRouteMap(1, 0);
    const selectedNode = map.nodes[2];
    if (!selectedNode) throw new Error('Expected a third route node.');

    expect(findRouteNode(map, selectedNode.id)).toEqual(selectedNode);
    expect(findRouteNode(map, 'missing-node')).toBeUndefined();
  });

  it('creates a single visible boss door at rooms 10, 20, and 30', () => {
    for (const room of [10, 20, 30]) {
      const map = createRouteMap(room, 0.5);

      expect(map.nodes).toHaveLength(1);
      expect(map.nodes[0]?.kind).toBe('boss');
      expect(map.nodes[0]?.hidden).toBe(false);
      expect(isRouteMapState(map)).toBe(true);
    }
  });

  it('builds a connected full-run graph with fixed boss landmarks', () => {
    const map = createRouteMap(1, 0.37);

    expect(map.layers).toHaveLength(30);
    expect(
      map.layers?.filter((layer) => layer.nodes.length === 1).map((layer) => layer.floor),
    ).toEqual([10, 20, 30]);

    for (const layer of map.layers ?? []) {
      for (const node of layer.nodes) {
        if (layer.floor === 30) {
          expect(node.nextNodeIds ?? []).toHaveLength(0);
          continue;
        }
        expect(node.nextNodeIds?.length).toBeGreaterThan(0);
        for (const nextNodeId of node.nextNodeIds ?? []) {
          expect(
            map.layers?.[layer.floor]?.nodes.some((candidate) => candidate.id === nextNodeId),
          ).toBe(true);
        }
      }
    }
  });

  it('advances only through connected successors and reaches room 30', () => {
    let map = createRouteMap(1, 0.19);
    const visitedFloors: number[] = [];

    while (map.floor < 30) {
      visitedFloors.push(map.floor);
      const firstNode = map.nodes[0];
      if (!firstNode) throw new Error('Expected a reachable route node.');
      const next = advanceRouteMap(map, firstNode.id);
      if (!next) throw new Error(`Expected a successor after room ${map.floor}.`);
      expect(next.floor).toBe(map.floor + 1);
      expect(next.nodes.every((node) => firstNode.nextNodeIds?.includes(node.id))).toBe(true);
      map = next;
    }

    expect(visitedFloors).toHaveLength(29);
    expect(map.nodes.map((node) => node.kind)).toEqual(['boss']);
    const finalNode = map.nodes[0];
    if (!finalNode) throw new Error('Expected the final boss node.');
    expect(advanceRouteMap(map, finalNode.id)).toBeNull();
  });

  it('reveals a node in both the frontier and the persisted graph', () => {
    const map = createRouteMap(1, 0.75);
    const hidden = map.nodes.find((node) => node.hidden);
    if (!hidden) throw new Error('Expected a hidden route node.');

    const revealed = revealHiddenRouteNodes(map, 1);
    expect(revealed.nodes.find((node) => node.id === hidden.id)?.hidden).toBe(false);
    expect(
      revealed.layers?.flatMap((layer) => layer.nodes).find((node) => node.id === hidden.id)
        ?.hidden,
    ).toBe(false);
  });

  it('rejects a persisted graph with an edge that skips or leaves the run', () => {
    const map = createRouteMap(1, 0.37);
    const firstLayer = map.layers?.[0];
    const firstNode = firstLayer?.nodes[0];
    if (!firstLayer || !firstNode || !map.layers)
      throw new Error('Expected a complete route graph.');

    const malformedLayers = map.layers.map((layer, index) =>
      index === 0
        ? {
            ...layer,
            nodes: [{ ...firstNode, nextNodeIds: ['missing-room'] }, ...layer.nodes.slice(1)],
          }
        : layer,
    );
    expect(isRouteMapState({ ...map, layers: malformedLayers })).toBe(false);
  });

  it('rejects malformed persisted route maps', () => {
    const map = createRouteMap(1, 0.25);

    expect(isRouteMapState(map)).toBe(true);
    expect(isRouteMapState({ ...map, nodes: map.nodes.slice(0, 2) })).toBe(false);
    expect(isRouteMapState({ ...map, floor: 0 })).toBe(false);
    expect(isRouteMapState({ ...createRouteMap(10, 0), nodes: map.nodes })).toBe(false);
  });
});
