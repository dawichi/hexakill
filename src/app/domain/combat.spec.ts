import { describe, expect, it } from 'vitest';
import { act, CombatState, chooseEnemyMove, playerGuardBlock, startCombat } from './combat';
import { guardBlock } from './combat-rules';
import { EnemyState, generateEnemy } from './enemies';
import { createPlayer, PlayerState, remainingHealth } from './player';
import { createRng, Rng } from './random';
import { RelicId } from './relics';

/** A source that replays fixed rolls, then repeats the last one. */
function scripted(...rolls: number[]): Rng {
  let index = 0;
  return {
    next: () => rolls[Math.min(index++, rolls.length - 1)] ?? 0.5,
    get state() {
      return index;
    },
  };
}

function enemy(overrides: Partial<EnemyState> = {}): EnemyState {
  return {
    id: 'adventurer',
    level: 4,
    stats: { health: 600, ad: 40, ap: 40, armor: 20, mr: 20, speed: 1 },
    damageTaken: 0,
    potions: 0,
    gold: 100,
    elite: false,
    ...overrides,
  };
}

function player(relics: RelicId[] = [], overrides: Partial<PlayerState> = {}): PlayerState {
  return { ...createPlayer('Tester', 'wizard'), relics, ...overrides };
}

function combatFor(p: PlayerState, e = enemy(), rng: Rng = scripted(0.5)): CombatState {
  return startCombat(rng, p, e).combat;
}

describe('startCombat', () => {
  it('lets the faster side open and reveals an intent', () => {
    const outcome = startCombat(scripted(0.5), player(), enemy());
    expect(outcome.combat.opening).toBe('player');
    expect(outcome.combat.phase).toBe('player-turn');
    expect(outcome.combat.intent).not.toBeNull();
    expect(outcome.events[0]?.type).toBe('combat-start');
  });

  it('resolves the enemy opening turn immediately when the enemy is faster', () => {
    const fast = enemy({ stats: { ...enemy().stats, speed: 999 } });
    const outcome = startCombat(scripted(0.3, 0.5, 0.5, 0.3), player(), fast);
    expect(outcome.combat.opening).toBe('enemy');
    expect(outcome.events.some((event) => event.type === 'action' && event.actor === 'enemy')).toBe(
      true,
    );
    expect(outcome.combat.turn).toBe(1);
  });

  it('gives the Samurai speed ties', () => {
    const samurai = { ...createPlayer('Tester', 'samurai') };
    const tied = enemy({ stats: { ...enemy().stats, speed: samurai.stats.speed } });
    expect(startCombat(scripted(0.5), samurai, tied).combat.opening).toBe('player');
  });
});

describe('act', () => {
  it('resolves the player action and the enemy response in one step', () => {
    const p = player();
    const outcome = act(scripted(0.5), p, combatFor(p), 'attack');
    const actors = outcome.events.flatMap((event) =>
      event.type === 'action' ? [event.actor] : [],
    );
    expect(actors).toEqual(['player', 'enemy']);
    expect(outcome.combat.turn).toBe(1);
  });

  it('is deterministic for the same random state', () => {
    const p = player();
    const combat = combatFor(p);
    const first = act(createRng(1234), p, combat, 'magic');
    const second = act(createRng(1234), p, combat, 'magic');
    expect(second).toEqual(first);
  });

  it('marks the enemy with Magic and consumes the mark with the next Attack', () => {
    const p = player();
    const marked = act(scripted(0.5), p, combatFor(p), 'magic');
    expect(marked.combat.enemyHexed).toBe(true);
    expect(marked.events.some((e) => e.type === 'status' && e.status === 'hex')).toBe(true);

    const consumed = act(scripted(0.5), marked.player, marked.combat, 'attack');
    expect(consumed.combat.enemyHexed).toBe(false);
    expect(consumed.events.some((e) => e.type === 'status' && e.status === 'hex-consumed')).toBe(
      true,
    );
  });

  it('expires player Block after the enemy turn it protected', () => {
    const p = player();
    const outcome = act(scripted(0.5), p, combatFor(p), 'guard');
    const block = outcome.events.find((e) => e.type === 'block' && e.target === 'player');
    expect(block && block.type === 'block' ? block.amount : 0).toBe(playerGuardBlock(p));
    expect(outcome.combat.playerBlock).toBe(0);
  });

  it('spends a potion and heals', () => {
    const p = player([], { damageTaken: 300 });
    const outcome = act(scripted(0.5), p, combatFor(p), 'potion');
    expect(outcome.player.potions).toBe(p.potions - 1);
    expect(outcome.events.some((e) => e.type === 'heal' && e.target === 'player')).toBe(true);
  });

  it("does not end the turn on the first potion with Alchemist's Crown", () => {
    const p = player(['alchemists-crown'], { damageTaken: 300 });
    const outcome = act(scripted(0.5), p, combatFor(p), 'potion');
    expect(outcome.events.some((e) => e.type === 'action' && e.actor === 'enemy')).toBe(false);
    expect(outcome.combat.turn).toBe(0);
  });

  it('ends in victory when the enemy falls and ignores further actions', () => {
    const p = player();
    const weak = enemy({ damageTaken: 599 });
    const outcome = act(scripted(0.5), p, combatFor(p, weak), 'magic');
    expect(outcome.combat.phase).toBe('victory');
    expect(outcome.events.at(-1)?.type).toBe('victory');
    expect(act(scripted(0.5), outcome.player, outcome.combat, 'attack').events).toEqual([]);
  });

  it('ends in defeat when the player falls', () => {
    const p = player([], { damageTaken: p0().stats.health - 1 });
    const brute = enemy({ stats: { ...enemy().stats, ad: 900, ap: 900 } });
    const outcome = act(scripted(0.5), p, combatFor(p, brute), 'guard');
    expect(outcome.combat.phase).toBe('defeat');
    expect(remainingHealth(outcome.player)).toBe(0);
  });

  it('burns the Phoenix Feather on a lethal hit and keeps both messages as events', () => {
    const p = player(['phoenix-feather'], { damageTaken: p0().stats.health - 1 });
    const brute = enemy({ stats: { ...enemy().stats, ad: 900, ap: 900 } });
    const outcome = act(scripted(0.5), p, combatFor(p, brute), 'guard');
    expect(outcome.combat.phase).toBe('player-turn');
    expect(outcome.player.relics).not.toContain('phoenix-feather');
    const types = outcome.events.map((e) => e.type);
    expect(types).toContain('relic');
    expect(outcome.events.some((e) => e.type === 'heal' && e.source === 'phoenix-feather')).toBe(
      true,
    );
  });

  it('reports Venom and Soot Charm damage as separate events', () => {
    const p = player(['soot-charm', 'venom-vial']);
    const first = act(scripted(0.5), p, combatFor(p), 'magic');
    const second = act(scripted(0.5), first.player, first.combat, 'attack');
    const sources = second.events.flatMap((e) => (e.type === 'effect-damage' ? [e.source] : []));
    expect(sources).toEqual(expect.arrayContaining(['soot-charm', 'venom']));
  });

  it('snapshots the visible state after every event', () => {
    const p = player();
    const outcome = act(scripted(0.5), p, combatFor(p), 'attack');
    const hit = outcome.events.find((e) => e.type === 'hit' && e.target === 'enemy');
    expect(hit?.snapshot.enemyHealth).toBeLessThan(600);
    expect(outcome.events.at(-1)?.snapshot.intent).toEqual(outcome.combat.intent);
  });
});

describe('enemy moves', () => {
  it('drinks a potion when low on health', () => {
    const low = enemy({ potions: 1, damageTaken: 500 });
    expect(chooseEnemyMove(scripted(0.5), low, 0, false).kind).toBe('heal');
  });

  it('has the Fire Knight follow a charge with Inferno Strike', () => {
    const knight = generateEnemy(scripted(0.5), 8, 'boss', 0);
    expect(chooseEnemyMove(scripted(0.5), knight, 2, false).kind).toBe('charge');
    const strike = chooseEnemyMove(scripted(0.5), knight, 3, true);
    expect(strike.label).toBe('Inferno Strike');
    expect(strike.multiplier).toBeGreaterThan(2);
  });

  it('has the Water Priestess open Tidal Barrage as a three-hit Magic', () => {
    const priestess = generateEnemy(scripted(0.5), 12, 'boss', 1);
    const barrage = chooseEnemyMove(scripted(0.5), priestess, 1, false);
    expect(barrage).toMatchObject({ kind: 'magic', hits: 3, label: 'Tidal Barrage' });
  });

  it('guards with enemy Block that expires on its next turn', () => {
    const tank = enemy({ id: 'knight' });
    const p = player();
    let combat: CombatState = {
      ...combatFor(p, tank),
      intent: { kind: 'guard', hits: 1, multiplier: 1 },
    };
    const guarded = act(scripted(0.5), p, combat, 'guard');
    expect(guarded.combat.enemyBlock).toBe(guardBlock(tank.stats));
    combat = { ...guarded.combat, intent: { kind: 'attack', hits: 1, multiplier: 1 } };
    expect(act(scripted(0.5), guarded.player, combat, 'guard').combat.enemyBlock).toBe(0);
  });
});

function p0(): PlayerState {
  return player();
}
