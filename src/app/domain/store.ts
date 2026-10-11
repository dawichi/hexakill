import { hasRelic, PlayerState } from './player';
import { pick, Rng, shuffle } from './random';
import { RELIC_IDS, RELICS, RelicId, relicsOfQuality } from './relics';

export const POTION_OFFERS = [
  { id: 'potion', name: 'Potion', quantity: 1, price: 100 },
  { id: 'potion-pack', name: '5 Potions pack', quantity: 5, price: 400 },
] as const;

export type PotionOfferId = (typeof POTION_OFFERS)[number]['id'];

export type PurchaseResult =
  | { readonly purchased: true; readonly player: PlayerState; readonly message: string }
  | { readonly purchased: false; readonly player: PlayerState; readonly message: string };

/** Early merchants stock 4 relics, then 6 from room 5 and 8 from room 10. */
export function relicOfferCount(room: number, player: PlayerState): number {
  const base = room < 5 ? 4 : room < 10 ? 6 : 8;
  const extra = hasRelic(player, 'salvagers-map') ? RELICS['salvagers-map'].params.offers : 0;
  return base + extra;
}

/** Half the offers are normal relics; the rest are rare (75%) or epic (25%). */
export function generateRelicOffers(rng: Rng, player: PlayerState, room: number): RelicId[] {
  const count = relicOfferCount(room, player);
  const taken = new Set<RelicId>(player.relics);
  const offers: RelicId[] = [];
  const take = (pool: readonly RelicId[]): boolean => {
    const available = pool.filter((id) => !taken.has(id));
    if (!available.length) return false;
    const id = pick(rng, available);
    taken.add(id);
    offers.push(id);
    return true;
  };

  const normals = Math.floor(count / 2);
  for (let index = 0; index < normals; index += 1) take(relicsOfQuality('normal'));
  while (offers.length < count) {
    const preferred = relicsOfQuality(rng.next() < 0.75 ? 'rare' : 'epic');
    if (!take(preferred) && !take(RELIC_IDS)) break;
  }
  return shuffle(rng, offers);
}

export function buyRelic(player: PlayerState, id: RelicId): PurchaseResult {
  const relic = RELICS[id];
  if (hasRelic(player, id)) {
    return { purchased: false, player, message: `You already carry ${relic.name}.` };
  }
  if (player.gold < relic.price) {
    return { purchased: false, player, message: `You cannot afford ${relic.name}.` };
  }
  const stats =
    id === 'vitality-moss'
      ? { ...player.stats, health: player.stats.health + RELICS[id].params.health }
      : id === 'swiftstep-anklet'
        ? { ...player.stats, speed: player.stats.speed + RELICS[id].params.speed }
        : player.stats;
  return {
    purchased: true,
    player: { ...player, stats, gold: player.gold - relic.price, relics: [...player.relics, id] },
    message: `${relic.name} acquired.`,
  };
}

export function buyPotions(player: PlayerState, offerId: PotionOfferId): PurchaseResult {
  const offer = POTION_OFFERS.find((candidate) => candidate.id === offerId);
  if (!offer) return { purchased: false, player, message: 'That offer is not available.' };
  if (player.gold < offer.price) {
    return { purchased: false, player, message: `You cannot afford the ${offer.name}.` };
  }
  return {
    purchased: true,
    player: {
      ...player,
      gold: player.gold - offer.price,
      potions: player.potions + offer.quantity,
    },
    message: `${offer.name} purchased.`,
  };
}
