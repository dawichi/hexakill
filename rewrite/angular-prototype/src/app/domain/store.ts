import { ItemState, PlayerState, Stats } from './game-types';

const ZERO_BONUS: Stats = { health: 0, ad: 0, ap: 0, armor: 0, mr: 0, speed: 0 };

export const STORE_ITEMS: readonly ItemState[] = [
  {
    id: 'orb',
    name: 'Orb',
    price: 500,
    bonus: { ...ZERO_BONUS, health: 1000 },
    asset: '/images/items/orb.png',
  },
  {
    id: 'sword',
    name: 'Sword',
    price: 900,
    bonus: { ...ZERO_BONUS, ad: 200, speed: 50 },
    asset: '/images/items/sword.png',
  },
  {
    id: 'wand',
    name: 'Wand',
    price: 2000,
    bonus: { ...ZERO_BONUS, ap: 500 },
    asset: '/images/items/wand.png',
  },
];

export const STORE_POTIONS = [
  { id: 'potion', name: 'Potion', quantity: 1, price: 100 },
  { id: 'potion-pack', name: '5 Potions pack', quantity: 5, price: 400 },
] as const;

export type PurchaseResult =
  | { readonly purchased: true; readonly player: PlayerState; readonly message: string }
  | { readonly purchased: false; readonly player: PlayerState; readonly reason: string };

function addStats(stats: Stats, bonus: Stats): Stats {
  return {
    health: stats.health + bonus.health,
    ad: stats.ad + bonus.ad,
    ap: stats.ap + bonus.ap,
    armor: stats.armor + bonus.armor,
    mr: stats.mr + bonus.mr,
    speed: stats.speed + bonus.speed,
  };
}

export function purchaseItem(player: PlayerState, itemId: string): PurchaseResult {
  const item = STORE_ITEMS.find((candidate) => candidate.id === itemId);
  if (!item) return { purchased: false, player, reason: 'That item is not available.' };
  if (player.inventory.some((owned) => owned.id === item.id)) {
    return { purchased: false, player, reason: 'That item has already been purchased.' };
  }
  if (player.gold < item.price) {
    return { purchased: false, player, reason: 'You cannot afford that item.' };
  }

  return {
    purchased: true,
    player: {
      ...player,
      gold: player.gold - item.price,
      stats: addStats(player.stats, item.bonus),
      inventory: [...player.inventory, item],
    },
    message: `${item.name} purchased. Its stats are active immediately.`,
  };
}

export function purchasePotions(player: PlayerState, offerId: string): PurchaseResult {
  const offer = STORE_POTIONS.find((candidate) => candidate.id === offerId);
  if (!offer) return { purchased: false, player, reason: 'That potion offer is not available.' };
  if (player.gold < offer.price)
    return { purchased: false, player, reason: 'You cannot afford that potion offer.' };

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
