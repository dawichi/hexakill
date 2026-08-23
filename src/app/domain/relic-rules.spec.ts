import { describe, expect, it } from 'vitest';
import { CHARACTER_DEFINITIONS, createInitialPlayer } from './characters';
import {
  relicDamageRules,
  relicIncomingDamageMultiplier,
  relicMagicBlock,
  relicPotionBlock,
  relicStartEnemyDamage,
} from './relic-rules';
import { findRelic } from './relics';

const basePlayer = createInitialPlayer('Relic tester', CHARACTER_DEFINITIONS[0]);

function playerWith(...ids: string[]) {
  return {
    ...basePlayer,
    inventory: ids.flatMap((id) => {
      const relic = findRelic(id);
      return relic ? [relic] : [];
    }),
  };
}

function context(overrides: Partial<Parameters<typeof relicDamageRules>[2]> = {}) {
  return {
    playerHealth: 200,
    playerDamageTaken: 0,
    playerActions: 0,
    damagingActions: 0,
    attackCount: 0,
    magicActions: 0,
    potionUses: 0,
    enemyDamageActions: 0,
    openingActor: 'player' as const,
    ...overrides,
  };
}

describe('relic combat rules', () => {
  it('combines basic, timing, and low-health damage passives', () => {
    const player = playerWith('honed-edge', 'war-drums', 'emberheart', 'the-hourglass');
    const rules = relicDamageRules(player, 'attack', context({ playerDamageTaken: 110 }));

    expect(rules.damageMultiplier).toBeCloseTo(1.1 * 1.3 * 1.2 * 1.25);
  });

  it('marks the first strike as unable to miss and handles attack counters', () => {
    const player = playerWith('oath-of-first-strike', 'echoing-blade', 'infinite-edge');

    expect(relicDamageRules(player, 'attack', context()).guaranteedHit).toBe(true);
    expect(
      relicDamageRules(player, 'attack', context({ attackCount: 2, damagingActions: 3 }))
        .damageMultiplier,
    ).toBeCloseTo(1.75 * 1.35);
  });

  it('protects the opening enemy action and grows the Block engine', () => {
    const player = playerWith('void-lantern', 'potion-satchel', 'hexglass-prism', 'arcane-battery');

    expect(relicIncomingDamageMultiplier(player, context())).toBe(0.5);
    expect(relicPotionBlock(player, context())).toBe(6);
    expect(relicMagicBlock(player, context())).toBe(14);
    expect(relicStartEnemyDamage(player)).toBe(0);
  });

  it('keeps one-shot triggers from repeating after their counter is consumed', () => {
    const player = playerWith('void-lantern', 'arcane-battery', 'potion-satchel');
    const spent = context({
      enemyDamageActions: 1,
      magicActions: 1,
      potionUses: 1,
      relicFlags: { 'arcane-battery-used': true },
    });

    expect(relicIncomingDamageMultiplier(player, spent)).toBe(1);
    expect(relicMagicBlock(player, spent)).toBe(0);
    expect(relicPotionBlock(player, spent)).toBe(0);
  });
});
