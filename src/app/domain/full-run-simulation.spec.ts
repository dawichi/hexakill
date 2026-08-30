import { describe, expect, it } from 'vitest';
import { CHARACTER_DEFINITIONS, createInitialPlayer } from './characters';
import { ROUTE_POLICIES, runFullRunReport, simulateFullRun } from './full-run-simulation';
import { createRouteMap, RouteMapState, RouteNode } from './route-map';

describe('full-run simulation', () => {
  it('replays the same route, combat, and economy with a fixed seed', () => {
    const options = {
      characterId: 'wizard' as const,
      combatPolicy: 'reactive' as const,
      routePolicy: 'balanced' as const,
      seed: 123,
      collectTrace: true,
    };

    expect(simulateFullRun(options)).toEqual(simulateFullRun(options));
  });

  it('does not let route policies inspect hidden door contents', () => {
    const player = createInitialPlayer('Tester', CHARACTER_DEFINITIONS[0]);
    const visibleBattle: RouteNode = {
      id: 'battle',
      kind: 'battle',
      title: 'Battle',
      description: '',
      reward: '',
    };
    const hiddenElite: RouteNode = {
      id: 'hidden-one',
      kind: 'elite',
      hidden: true,
      title: 'Unknown',
      description: '',
      reward: '',
    };
    const hiddenRest: RouteNode = {
      id: 'hidden-two',
      kind: 'rest',
      hidden: true,
      title: 'Unknown',
      description: '',
      reward: '',
    };
    const map: RouteMapState = { floor: 1, nodes: [visibleBattle, hiddenElite, hiddenRest] };
    const context = {
      player,
      playerDamageTaken: 0,
      map,
      nodes: map.nodes,
      randomChoice: () => 0,
    };
    const alteredMap: RouteMapState = {
      ...map,
      nodes: [visibleBattle, { ...hiddenElite, kind: 'rest' }, { ...hiddenRest, kind: 'elite' }],
    };

    expect(ROUTE_POLICIES.balanced(context).id).toBe(
      ROUTE_POLICIES.balanced({ ...context, map: alteredMap, nodes: alteredMap.nodes }).id,
    );
  });

  it('reports route policy and character cells', () => {
    const report = runFullRunReport({
      characters: ['wizard'],
      combatPolicies: ['reactive'],
      routePolicies: ['balanced', 'aggressive'],
      samplesPerCell: 4,
      maxRooms: 8,
      seed: 8,
    });

    expect(report.summaries).toHaveLength(2);
    expect(report.summaries.every((summary) => summary.samples === 4)).toBe(true);
    expect(report.summaries.every((summary) => summary.completionRate >= 0)).toBe(true);
  });

  it('stops the run when a combat reaches its turn cap', () => {
    const result = simulateFullRun({
      characterId: 'wizard',
      combatPolicy: 'class',
      routePolicy: 'balanced',
      seed: 42,
      maxCombatTurns: 1,
      collectTrace: true,
    });

    expect(result.result).toBe('draw');
    expect(result.trace.at(-1)?.result).toBe('draw');
    expect(result.roomsVisited).toBe(result.trace.length);
  });

  it('can seed a controlled full-run relic comparison', () => {
    const result = simulateFullRun({
      characterId: 'warrior',
      combatPolicy: 'reactive',
      routePolicy: 'safe',
      seed: 42,
      maxRooms: 1,
      startingRelicIds: ['swiftstep-anklet'],
    });

    expect(result.relics).toBe(1);
    expect(result.trace.length).toBe(1);
  });

  it('places boss rooms at the fixed run milestones', () => {
    expect(createRouteMap(9, 0).nodes).toHaveLength(3);
    expect(createRouteMap(10, 0).nodes.map((node) => node.kind)).toEqual(['boss']);
    expect(createRouteMap(20, 0).nodes.map((node) => node.kind)).toEqual(['boss']);
    expect(createRouteMap(30, 0).nodes.map((node) => node.kind)).toEqual(['boss']);
  });
});
