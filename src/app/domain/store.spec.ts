import { describe, expect, it } from 'vitest';
import { CHARACTER_DEFINITIONS, createInitialPlayer } from './characters';
import { purchaseItem, purchasePotions } from './store';

const player = createInitialPlayer('David', CHARACTER_DEFINITIONS[0]);

describe('store rules', () => {
  it('purchases an item once and applies its bonus immediately', () => {
    const result = purchaseItem(player, 'sword');

    expect(result.purchased).toBe(true);
    if (!result.purchased) return;
    expect(result.player.gold).toBe(1100);
    expect(result.player.stats.ad).toBe(216);
    expect(result.player.stats.speed).toBe(54);
    expect(result.player.inventory).toHaveLength(1);
    expect(purchaseItem(result.player, 'sword').purchased).toBe(false);
  });

  it('rejects unaffordable purchases without changing the player', () => {
    const poorPlayer = { ...player, gold: 10 };
    const result = purchaseItem(poorPlayer, 'orb');

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
    expect(() => purchaseItem({ ...player, gold: -1 }, 'orb')).toThrow(RangeError);
    expect(() => purchasePotions({ ...player, potions: Number.NaN }, 'potion')).toThrow(RangeError);
    expect(() =>
      purchasePotions({ ...player, potions: Number.MAX_SAFE_INTEGER }, 'potion'),
    ).toThrow(RangeError);
    expect(() =>
      purchaseItem({ ...player, stats: { ...player.stats, ap: Number.NaN } }, 'orb'),
    ).toThrow(RangeError);
    expect(() =>
      purchaseItem({ ...player, inventory: [{ ...player.inventory[0], id: 'unknown' }] }, 'orb'),
    ).toThrow(RangeError);
  });
});
