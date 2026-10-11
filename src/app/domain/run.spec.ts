import { describe, expect, it } from 'vitest';
import { applyVictory, createPlayer } from './player';
import { validatePlayerName } from './player-name';
import { BOSS_ROOMS, createRouteGraph, FINAL_ROOM, isValidPath, routeFrontier } from './route-map';
import {
  chooseRouteNode,
  createRun,
  currentRoom,
  frontier,
  leaveCombat,
  leaveStore,
  playerAction,
  purchasePotions,
  RunState,
  roomsCleared,
} from './run';

function enterFirstFight(run: RunState): RunState {
  const node = frontier(run).find((candidate) => candidate.kind === 'battle');
  if (!node) throw new Error('Room 1 always offers a battle.');
  return chooseRouteNode(run, node.id).run;
}

describe('runs', () => {
  it('validates player names', () => {
    expect(validatePlayerName('ab')).not.toBeNull();
    expect(validatePlayerName('  Hero  ')).toBeNull();
    expect(validatePlayerName('x'.repeat(15))).not.toBeNull();
  });

  it('starts on the map of room 1 with a seed-derived frontier', () => {
    const run = createRun(42, 'Hero', 'wizard');
    expect(run.screen).toBe('map');
    expect(currentRoom(run)).toBe(1);
    expect(frontier(run).length).toBe(3);
    expect(frontier(run)).toEqual(frontier(createRun(42, 'Other', 'samurai')));
  });

  it('replays an action identically from the persisted state (no reroll on reload)', () => {
    const fight = enterFirstFight(createRun(7, 'Hero', 'samurai'));
    const reloaded: RunState = JSON.parse(JSON.stringify(fight));
    expect(playerAction(reloaded, 'attack')).toEqual(playerAction(fight, 'attack'));
  });

  it('only accepts frontier nodes', () => {
    const run = createRun(42, 'Hero', 'wizard');
    expect(chooseRouteNode(run, 'room-5-0').run).toBe(run);
  });

  it('heals at campfires and records the visit', () => {
    let run: RunState = createRun(3, 'Hero', 'warrior');
    run = { ...run, player: { ...run.player, damageTaken: 500 } };
    // Walk the frontier (without fighting) until a campfire is offered.
    for (let room = 1; room < FINAL_ROOM; room += 1) {
      const nodes = frontier(run);
      const rest = nodes.find((node) => node.kind === 'rest');
      if (rest) {
        const step = chooseRouteNode(run, rest.id);
        expect(step.notice).toMatchObject({ type: 'rest' });
        expect(step.run.player.damageTaken).toBeLessThan(500);
        expect(step.run.visited.at(-1)).toBe(rest.id);
        return;
      }
      const next = nodes[0];
      if (!next) break;
      run = { ...run, visited: [...run.visited, next.id] };
    }
    throw new Error('No reachable campfire found.');
  });

  it('applies victory rewards in the same step that wins the fight', () => {
    let run = enterFirstFight(createRun(11, 'Hero', 'wizard'));
    const enemy = run.combat?.enemy;
    if (!enemy) throw new Error('Expected a fight.');
    run = {
      ...run,
      combat: run.combat && {
        ...run.combat,
        enemy: { ...enemy, damageTaken: enemy.stats.health - 1 },
      },
    };
    const step = playerAction(run, 'magic');
    if (step.run.combat?.phase === 'victory') {
      expect(step.run.player.gold).toBeGreaterThan(run.player.gold);
      expect(step.run.reward).not.toBeNull();
      expect(roomsCleared(step.run)).toBe(1);
      const back = leaveCombat(step.run).run;
      expect(back.screen).toBe(step.run.player.pendingPowerUps > 0 ? 'combat' : 'map');
    } else {
      // A miss is possible; the fight simply continues.
      expect(step.run.combat?.phase).toBe('player-turn');
    }
  });

  it('completes the run after the third boss', () => {
    const run = enterFirstFight(createRun(5, 'Hero', 'warrior'));
    const combat = run.combat;
    if (!combat) throw new Error('Expected a fight.');
    const boss = {
      ...combat.enemy,
      id: 'bringer-of-death',
      damageTaken: combat.enemy.stats.health - 1,
    };
    const almost = {
      ...run,
      player: { ...run.player, bossesDefeated: 2, stats: { ...run.player.stats, ap: 5000 } },
      combat: { ...combat, enemy: boss, enemyBlock: 0 },
    };
    const results = [0, 1, 2, 3, 4].map(
      (offset) => playerAction({ ...almost, rngState: almost.rngState + offset }, 'magic').run,
    );
    expect(results.some((result) => result.screen === 'run-complete')).toBe(true);
  });

  it('buys potions in the store and returns to the map', () => {
    const run: RunState = { ...createRun(1, 'Hero', 'wizard'), screen: 'store', storeOffers: [] };
    const bought = purchasePotions(run, 'potion').run;
    expect(bought.player.potions).toBe(run.player.potions + 1);
    expect(leaveStore(bought).run.screen).toBe('map');
  });
});

describe('route graph', () => {
  it('is deterministic per seed and has a boss at every milestone', () => {
    const graph = createRouteGraph(99);
    expect(createRouteGraph(99)).toEqual(graph);
    expect(graph).toHaveLength(FINAL_ROOM);
    for (const room of BOSS_ROOMS) {
      expect(graph[room - 1]?.map((node) => node.kind)).toEqual(['boss']);
    }
  });

  it('connects every node to at least one node in the next room', () => {
    const graph = createRouteGraph(1234);
    for (const layer of graph.slice(0, -1)) {
      for (const node of layer) {
        expect(node.nextIds.length).toBeGreaterThan(0);
      }
    }
  });

  it('validates paths and reveals hidden frontier nodes', () => {
    const graph = createRouteGraph(8);
    const first = graph[0]?.[0];
    const second = first && graph[1]?.find((node) => first.nextIds.includes(node.id));
    expect(first && second && isValidPath(graph, [first.id, second.id])).toBe(true);
    expect(isValidPath(graph, ['room-2-0'])).toBe(false);
    const hidden = routeFrontier(graph, []).filter((node) => node.hidden).length;
    const revealed = routeFrontier(graph, [], 1).filter((node) => node.hidden).length;
    expect(revealed).toBe(Math.max(0, hidden - 1));
  });
});

describe('progression', () => {
  it('levels up from victories and grants power-ups', () => {
    const player = createPlayer('Hero', 'wizard');
    const enemy = {
      id: 'adventurer',
      level: 20,
      stats: player.stats,
      damageTaken: player.stats.health,
      potions: 0,
      gold: 300,
      elite: false,
    };
    const next = applyVictory(player, enemy);
    expect(next.level).toBeGreaterThan(player.level);
    expect(next.stats.ap).toBeGreaterThan(player.stats.ap);
    expect(next.pendingPowerUps).toBeGreaterThan(0);
    expect(next.defeatedEnemies).toEqual([{ id: 'adventurer', level: 20 }]);
  });
});
