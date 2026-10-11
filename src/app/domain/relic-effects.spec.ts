import { describe, expect, it } from 'vitest';
import {
  act,
  CombatEvent,
  CombatState,
  playerDamagePreview,
  playerGuardBlock,
  startCombat,
} from './combat';
import { EnemyState } from './enemies';
import { Stats } from './game-types';
import { applyVictory, createPlayer, PlayerState, remainingHealth, victoryReward } from './player';
import { Rng } from './random';
import { RELIC_IDS, RelicId } from './relics';
import { createRun, frontier } from './run';
import { buyRelic, relicOfferCount } from './store';

function scripted(...rolls: number[]): Rng {
  let index = 0;
  return {
    next: () => rolls[Math.min(index++, rolls.length - 1)] ?? 0.5,
    get state() {
      return index;
    },
  };
}

function player(relics: RelicId[] = [], overrides: Partial<PlayerState> = {}): PlayerState {
  return { ...createPlayer('Tester', 'wizard'), ...overrides, relics };
}

function enemy(statChanges: Partial<Stats> = {}, overrides: Partial<EnemyState> = {}): EnemyState {
  return {
    id: 'adventurer',
    level: 4,
    stats: { health: 10_000, ad: 20, ap: 20, armor: 20, mr: 20, speed: 1, ...statChanges },
    damageTaken: 0,
    potions: 0,
    gold: 100,
    elite: false,
    ...overrides,
  };
}

function combatFor(
  fighter: PlayerState,
  foe = enemy(),
  changes: Partial<CombatState> = {},
): CombatState {
  return { ...startCombat(scripted(0.5), fighter, foe).combat, ...changes };
}

function use(
  fighter: PlayerState,
  combat: CombatState,
  action: 'attack' | 'magic' | 'guard' | 'potion',
  ...rolls: number[]
) {
  return act(scripted(...rolls), fighter, combat, action);
}

function playerHitEvents(events: readonly CombatEvent[]): Extract<CombatEvent, { type: 'hit' }>[] {
  return events.filter(
    (event): event is Extract<CombatEvent, { type: 'hit' }> =>
      event.type === 'hit' && event.target === 'player',
  );
}

const RELIC_TRIGGER_CASES = {
  'honed-edge': () => {
    const fighter = player(['honed-edge']);
    const plain = player();
    expect(playerDamagePreview(fighter, combatFor(fighter), 'attack')[0]).toBeGreaterThan(
      playerDamagePreview(plain, combatFor(plain), 'attack')[0],
    );
  },
  'apprentices-codex': () => {
    const fighter = player(['apprentices-codex']);
    const plain = player();
    expect(playerDamagePreview(fighter, combatFor(fighter), 'magic')[0]).toBeGreaterThan(
      playerDamagePreview(plain, combatFor(plain), 'magic')[0],
    );
  },
  'guarders-buckler': () => {
    expect(playerGuardBlock(player(['guarders-buckler']))).toBeGreaterThan(
      playerGuardBlock(player()),
    );
  },
  'swiftstep-anklet': () => {
    const plain = player();
    const result = buyRelic(plain, 'swiftstep-anklet');
    expect(result.purchased).toBe(true);
    expect(result.player.stats.speed).toBeGreaterThan(plain.stats.speed);
  },
  'vitality-moss': () => {
    const plain = player([], { damageTaken: 120 });
    const result = buyRelic(plain, 'vitality-moss');
    expect(result.purchased).toBe(true);
    expect(result.player.stats.health).toBeGreaterThan(plain.stats.health);
    expect(result.player.damageTaken).toBe(plain.damageTaken);
  },
  'soot-charm': () => {
    const fighter = player(['soot-charm'], { damageTaken: 100 });
    const result = use(
      fighter,
      combatFor(fighter, enemy(), { intent: { kind: 'magic', hits: 1, multiplier: 1 } }),
      'potion',
    );
    expect(result.events).toContainEqual(
      expect.objectContaining({ type: 'effect-damage', source: 'soot-charm' }),
    );
  },
  'bandage-roll': () => {
    const plain = player([], { damageTaken: 500 });
    const fighter = player(['bandage-roll'], { damageTaken: 500 });
    expect(victoryReward(fighter, enemy()).healed).toBeGreaterThan(
      victoryReward(plain, enemy()).healed,
    );
  },
  'coin-purse': () => {
    const plain = victoryReward(player(), enemy());
    const boosted = victoryReward(player(['coin-purse']), enemy());
    expect(boosted.gold).toBeGreaterThan(plain.gold);
  },
  'travelers-compass': () => {
    const run = createRun(1, 'Tester', 'wizard');
    const visible = frontier(run).filter((node) => !node.hidden).length;
    const mapped = { ...run, player: player(['travelers-compass']) };
    expect(frontier(mapped).filter((node) => !node.hidden).length).toBe(visible + 1);
  },
  'potion-satchel': () => {
    const fighter = player(['potion-satchel'], { damageTaken: 300 });
    const result = use(
      fighter,
      combatFor(fighter, enemy(), { intent: { kind: 'magic', hits: 1, multiplier: 1 } }),
      'potion',
      0.5,
    );
    expect(result.events).toContainEqual(
      expect.objectContaining({ type: 'block', source: 'potion-satchel', amount: 100 }),
    );
  },
  thornmail: () => {
    const fighter = player(['thornmail']);
    const result = use(
      fighter,
      combatFor(fighter, enemy({ ad: 100 }), {
        playerBlock: 1_000,
        intent: { kind: 'attack', hits: 1, multiplier: 1 },
      }),
      'potion',
      0.5,
    );
    expect(result.events).toContainEqual(
      expect.objectContaining({ type: 'effect-damage', source: 'thornmail' }),
    );
  },
  'hexglass-prism': () => {
    const fighter = player(['hexglass-prism']);
    const result = use(fighter, combatFor(fighter), 'magic', 0.5, 0.5);
    expect(result.events).toContainEqual(
      expect.objectContaining({ type: 'block', source: 'hexglass-prism' }),
    );
    const marked = { ...result.combat, enemyHexed: true };
    const prism = playerDamagePreview(fighter, marked, 'attack')[0];
    const standardMark = playerDamagePreview(player(), marked, 'attack')[0];
    expect(prism).toBeGreaterThan(standardMark);
  },
  'echoing-blade': () => {
    const fighter = player(['echoing-blade']);
    const counters = { ...combatFor(fighter).counters, attacks: 2, damagingActions: 2 };
    const charged = combatFor(fighter, enemy(), { counters });
    const plain = player();
    expect(playerDamagePreview(fighter, charged, 'attack')[0]).toBeGreaterThan(
      playerDamagePreview(plain, charged, 'attack')[0],
    );
  },
  'blood-ledger': () => {
    const fighter = player(['blood-ledger'], {
      stats: { health: 1_000, ad: 50, ap: 100, armor: 0, mr: 0, speed: 18 },
      damageTaken: 600,
    });
    const result = use(
      fighter,
      combatFor(fighter, enemy({ ap: 100 }), {
        intent: { kind: 'magic', hits: 1, multiplier: 1 },
      }),
      'guard',
      0.5,
    );
    expect(result.events).toContainEqual(
      expect.objectContaining({ type: 'heal', source: 'blood-ledger' }),
    );
  },
  'ritual-bell': () => {
    const fighter = player(['ritual-bell']);
    const opened = startCombat(scripted(0.5), fighter, enemy());
    expect(opened.events).toContainEqual(
      expect.objectContaining({ type: 'block', source: 'ritual-bell' }),
    );
    const plain = player();
    expect(playerDamagePreview(fighter, opened.combat, 'attack')[0]).toBeLessThan(
      playerDamagePreview(plain, opened.combat, 'attack')[0],
    );
  },
  'arcane-battery': () => {
    const fighter = player(['arcane-battery']);
    const result = use(fighter, combatFor(fighter), 'magic', 0.5, 0.5);
    expect(result.events).toContainEqual(
      expect.objectContaining({ type: 'block', source: 'arcane-battery' }),
    );
  },
  'war-drums': () => {
    const fighter = player(['war-drums']);
    const plain = player();
    expect(playerDamagePreview(fighter, combatFor(fighter), 'attack')[0]).toBeGreaterThan(
      playerDamagePreview(plain, combatFor(plain), 'attack')[0],
    );
  },
  'venom-vial': () => {
    const fighter = player(['venom-vial']);
    const result = use(fighter, combatFor(fighter), 'magic', 0.5, 0.5);
    expect(result.events).toContainEqual(
      expect.objectContaining({ type: 'status', status: 'venom', amount: 5 }),
    );
  },
  'salvagers-map': () => {
    expect(relicOfferCount(1, player(['salvagers-map']))).toBe(relicOfferCount(1, player()) + 1);
  },
  emberheart: () => {
    const fighter = player(['emberheart'], { damageTaken: 500 });
    const plain = player([], { damageTaken: 500 });
    expect(playerDamagePreview(fighter, combatFor(fighter), 'attack')[0]).toBeGreaterThan(
      playerDamagePreview(plain, combatFor(plain), 'attack')[0],
    );
  },
  'phoenix-feather': () => {
    const fighter = player(['phoenix-feather'], {
      stats: { health: 1_000, ad: 50, ap: 100, armor: 0, mr: 0, speed: 18 },
      damageTaken: 999,
    });
    const result = use(
      fighter,
      combatFor(fighter, enemy({ ap: 1_000 }), {
        intent: { kind: 'magic', hits: 1, multiplier: 1 },
      }),
      'guard',
      0.5,
    );
    expect(result.player.relics).not.toContain('phoenix-feather');
    expect(remainingHealth(result.player)).toBeGreaterThan(1);
    expect(result.events).toContainEqual(
      expect.objectContaining({ type: 'heal', source: 'phoenix-feather' }),
    );
  },
  'the-hourglass': () => {
    const fighter = player(['the-hourglass']);
    const plain = player();
    expect(playerDamagePreview(fighter, combatFor(fighter), 'magic')[0]).toBeGreaterThan(
      playerDamagePreview(plain, combatFor(plain), 'magic')[0],
    );
  },
  'mirror-of-night': () => {
    const fighter = player(['mirror-of-night'], {
      stats: { health: 1_000, ad: 50, ap: 100, armor: 0, mr: 0, speed: 18 },
    });
    const result = use(
      fighter,
      combatFor(fighter, enemy({ ap: 100 }), {
        intent: { kind: 'magic', hits: 1, multiplier: 1 },
      }),
      'potion',
      0.5,
    );
    expect(result.events).toContainEqual(
      expect.objectContaining({ type: 'effect-damage', source: 'mirror-of-night' }),
    );
  },
  'crown-of-thorns': () => {
    const fighter = player(['crown-of-thorns'], {
      stats: { health: 10_000, ad: 50, ap: 100, armor: 0, mr: 0, speed: 18 },
    });
    const result = use(
      fighter,
      combatFor(fighter, enemy({ ad: 1_000 }), {
        playerBlock: 10_000,
        intent: { kind: 'attack', hits: 1, multiplier: 1 },
      }),
      'potion',
      0.5,
    );
    expect(result.events).toContainEqual(
      expect.objectContaining({ type: 'effect-damage', source: 'crown-of-thorns' }),
    );
    expect(result.events).toContainEqual(
      expect.objectContaining({ type: 'status', status: 'venom', amount: 3 }),
    );
  },
  'infinite-edge': () => {
    const fighter = player(['infinite-edge']);
    const counters = { ...combatFor(fighter).counters, damagingActions: 3 };
    const charged = combatFor(fighter, enemy(), { counters });
    const plain = player();
    expect(playerDamagePreview(fighter, charged, 'magic')[0]).toBeGreaterThan(
      playerDamagePreview(plain, charged, 'magic')[0],
    );
  },
  'dungeon-heart': () => {
    const fighter = player(['dungeon-heart'], { damageTaken: 100 });
    const recovered = applyVictory(fighter, enemy({}, { level: 1 }));
    expect(recovered.stats.health).toBe(fighter.stats.health + 60);
    expect(recovered.damageTaken).toBeLessThan(fighter.damageTaken);
  },
  'void-lantern': () => {
    const fighter = player(['void-lantern']);
    const plain = player();
    const intent = { kind: 'attack', hits: 1, multiplier: 1 } as const;
    const withLantern = use(
      fighter,
      combatFor(fighter, enemy({ ad: 100 }), { intent }),
      'potion',
      0.5,
    );
    const withoutLantern = use(
      plain,
      combatFor(plain, enemy({ ad: 100 }), { intent }),
      'potion',
      0.5,
    );
    const protectedHit = playerHitEvents(withLantern.events)[0];
    const plainHit = playerHitEvents(withoutLantern.events)[0];
    expect(protectedHit?.amount ?? 0).toBeLessThan(plainHit?.amount ?? 0);
  },
  'oath-of-first-strike': () => {
    const fighter = player(['oath-of-first-strike']);
    const result = use(fighter, combatFor(fighter), 'attack', 0.5, 0);
    const hit = result.events.find((event) => event.type === 'hit' && event.target === 'enemy');
    expect(hit?.type === 'hit' && hit.missed).toBe(false);
  },
  'alchemists-crown': () => {
    const fighter = player(['alchemists-crown'], { damageTaken: 400 });
    const plain = player([], { damageTaken: 400 });
    expect(playerGuardBlock(fighter)).toBe(playerGuardBlock(plain));
    const result = use(fighter, combatFor(fighter), 'potion', 0.5);
    expect(result.events.some((event) => event.type === 'action' && event.actor === 'enemy')).toBe(
      false,
    );
    expect(result.player.damageTaken).toBeLessThan(fighter.damageTaken);
  },
  'kings-seal': () => {
    const elite = enemy({}, { elite: true });
    const plain = victoryReward(player(), elite);
    const sealed = victoryReward(player(['kings-seal']), elite);
    expect(sealed.gold).toBeGreaterThan(plain.gold);
    expect(sealed.experience).toBeGreaterThan(plain.experience);
  },
} satisfies Record<RelicId, () => void>;

describe('catalog relic effects', () => {
  it('keeps a behavioral trigger case for every catalog relic', () => {
    expect(Object.keys(RELIC_TRIGGER_CASES).sort()).toEqual([...RELIC_IDS].sort());
  });

  for (const id of RELIC_IDS) {
    it(`${id} triggers its documented effect`, () => RELIC_TRIGGER_CASES[id]());
  }
});
