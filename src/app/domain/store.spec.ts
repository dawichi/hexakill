import { describe, expect, it } from 'vitest';
import { createPlayer } from './player';
import { createRng } from './random';
import { RELICS } from './relics';
import { buyPotions, buyRelic, generateRelicOffers, relicOfferCount } from './store';

describe('merchant', () => {
  const player = createPlayer('Hero', 'wizard');

  it('stocks unique relics the player does not own', () => {
    const owned = { ...player, relics: ['honed-edge' as const] };
    const offers = generateRelicOffers(createRng(5), owned, 12);
    expect(offers).toHaveLength(relicOfferCount(12, owned));
    expect(new Set(offers).size).toBe(offers.length);
    expect(offers).not.toContain('honed-edge');
  });

  it("adds an offer with Salvager's Map", () => {
    const mapped = { ...player, relics: ['salvagers-map' as const] };
    expect(relicOfferCount(1, mapped)).toBe(relicOfferCount(1, player) + 1);
  });

  it('charges gold, applies stat relics, and refuses duplicates or debt', () => {
    const bought = buyRelic(player, 'vitality-moss');
    expect(bought.purchased).toBe(true);
    expect(bought.player.gold).toBe(player.gold - RELICS['vitality-moss'].price);
    expect(bought.player.stats.health).toBe(player.stats.health + 100);
    expect(buyRelic(bought.player, 'vitality-moss').purchased).toBe(false);
    expect(buyRelic({ ...player, gold: 0 }, 'honed-edge').purchased).toBe(false);
  });

  it('sells potions', () => {
    const result = buyPotions(player, 'potion-pack');
    expect(result.player.potions).toBe(player.potions + 5);
    expect(buyPotions({ ...player, gold: 50 }, 'potion').purchased).toBe(false);
  });
});
