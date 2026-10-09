import { describe, expect, it } from 'vitest';
import { CHARACTER_DEFINITIONS, createInitialPlayer } from './characters';
import { RELIC_CATALOG, relicsOfQuality } from './relics';
import {
  generateStoreOffers,
  purchaseItem,
  purchasePotions,
  relicDamageModifiers,
  relicIncomingDamageModifiers,
  relicPotionHealingFraction,
  relicVictoryGoldMultiplier,
} from './store';

const player = createInitialPlayer('David', CHARACTER_DEFINITIONS[0]);

describe('store rules', () => {
  it('purchases a relic once and keeps its passive separate from base stats', () => {
    const result = purchaseItem(player, 'honed-edge');

    expect(result.purchased).toBe(true);
    if (!result.purchased) return;
    expect(result.player.gold).toBe(1650);
    expect(result.player.stats).toEqual(player.stats);
    expect(result.player.inventory).toHaveLength(1);
    const purchasedItem = result.player.inventory[0];
    if (!purchasedItem) throw new Error('Expected the purchased relic in the inventory.');
    expect(purchasedItem.description).toContain('10% more damage');
    expect(purchaseItem(result.player, 'honed-edge').purchased).toBe(false);
  });

  it('exposes passive effects to the combat and reward rules', () => {
    const honedEdge = purchaseItem(player, 'honed-edge');
    if (!honedEdge.purchased) return;
    const coinPurse = purchaseItem(honedEdge.player, 'coin-purse');
    if (!coinPurse.purchased) return;
    const crown = purchaseItem(coinPurse.player, 'alchemists-crown');

    expect(relicDamageModifiers(honedEdge.player, 'attack').damageMultiplier).toBe(1.1);
    expect(relicIncomingDamageModifiers(coinPurse.player).receivedDamageMultiplier).toBe(1);
    if (!crown.purchased) return;
    expect(relicPotionHealingFraction(crown.player)).toBe(0.5);
    expect(relicVictoryGoldMultiplier(coinPurse.player)).toBe(1.2);
  });

  it('keeps the catalog balanced across the three quality tiers', () => {
    expect(RELIC_CATALOG).toHaveLength(30);
    expect(relicsOfQuality('normal')).toHaveLength(10);
    expect(relicsOfQuality('rare')).toHaveLength(10);
    expect(relicsOfQuality('epic')).toHaveLength(10);
  });

  it('generates unique tiered offers and adds one offer at deeper floors', () => {
    const earlyOffers = generateStoreOffers(player, { floor: 1, random: () => 0 });
    const deepOffers = generateStoreOffers(player, { floor: 10, random: () => 0 });

    expect(earlyOffers).toHaveLength(4);
    expect(new Set(earlyOffers.map((item) => item.id)).size).toBe(4);
    expect(earlyOffers.filter((item) => item.quality === 'normal')).toHaveLength(2);
    expect(deepOffers).toHaveLength(8);
    expect(new Set(deepOffers.map((item) => item.id)).size).toBe(8);
  });

  it('rejects unaffordable purchases without changing the player', () => {
    const poorPlayer = { ...player, gold: 10 };
    const result = purchaseItem(poorPlayer, 'honed-edge');

    expect(result.purchased).toBe(false);
    expect(result.player).toBe(poorPlayer);
  });

  it('purchases potion offers with their configured quantity', () => {
    const result = purchasePotions(player, 'potion-pack');

    expect(result.purchased).toBe(true);
    if (!result.purchased) return;
    expect(result.player.gold).toBe(1600);
    expect(result.player.potions).toBe(10);
  });

  it('allows repeatable potion purchases while the player can afford them', () => {
    const first = purchasePotions(player, 'potion');
    if (!first.purchased) return;
    const second = purchasePotions(first.player, 'potion');

    expect(second.purchased).toBe(true);
    if (!second.purchased) return;
    expect(second.player.gold).toBe(1800);
    expect(second.player.potions).toBe(7);
  });

  it('rejects unknown item and potion offer identifiers without mutation', () => {
    const itemResult = purchaseItem(player, 'unknown-item');
    const potionResult = purchasePotions(player, 'unknown-offer');

    expect(itemResult.purchased).toBe(false);
    expect(itemResult.player).toBe(player);
    expect(potionResult.purchased).toBe(false);
    expect(potionResult.player).toBe(player);
  });

  it('rejects malformed player state at the store boundary', () => {
    expect(() => purchaseItem({ ...player, gold: -1 }, 'honed-edge')).toThrow(RangeError);
    expect(() => purchasePotions({ ...player, potions: Number.NaN }, 'potion')).toThrow(RangeError);
    expect(() =>
      purchasePotions({ ...player, potions: Number.MAX_SAFE_INTEGER }, 'potion'),
    ).toThrow(RangeError);
    expect(() =>
      purchaseItem({ ...player, stats: { ...player.stats, ap: Number.NaN } }, 'honed-edge'),
    ).toThrow(RangeError);
    expect(() =>
      purchaseItem(
        {
          ...player,
          inventory: [{ ...RELIC_CATALOG[0]!, id: 'unknown' }],
        },
        'honed-edge',
      ),
    ).toThrow(RangeError);
  });
});
