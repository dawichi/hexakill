import { describe, expect, it } from 'vitest';
import { createRouteMap, findRouteNode, isRouteMapState } from './route-map';

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

  it('rejects malformed persisted route maps', () => {
    const map = createRouteMap(1, 0.25);

    expect(isRouteMapState(map)).toBe(true);
    expect(isRouteMapState({ ...map, nodes: map.nodes.slice(0, 2) })).toBe(false);
    expect(isRouteMapState({ ...map, floor: 0 })).toBe(false);
  });
});
