import { DamageKind, DamageModifiers } from './combat-rules';
import { ItemState, PlayerState } from './game-types';

export const STORE_ITEMS: readonly ItemState[] = [
  {
    id: 'whetstone',
    name: 'Whetstone',
    price: 450,
    description: 'Attack deals 15% more damage and breaks 50% more Guard.',
    effect: { kind: 'attack-damage', amount: 0.15 },
    asset: '/images/items/sword.png',
  },
  {
    id: 'arcane-lens',
    name: 'Arcane Lens',
    price: 550,
    description: 'Magic deals 15% more damage and makes Hex hit harder.',
    effect: { kind: 'magic-damage', amount: 0.15 },
    asset: '/images/items/wand.png',
  },
  {
    id: 'ironbark',
    name: 'Ironbark',
    price: 500,
    description: 'Take 15% less damage from enemy attacks.',
    effect: { kind: 'damage-reduction', amount: 0.15 },
    asset: '/images/items/orb.png',
  },
  {
    id: 'blood-chalice',
    name: 'Blood Chalice',
    price: 600,
    description: 'After victory, recover 12% of your maximum health.',
    effect: { kind: 'victory-heal', amount: 0.12 },
    asset: '/images/items/orb.png',
  },
  {
    id: 'gilded-eye',
    name: 'Gilded Eye',
    price: 500,
    description: 'Earn 25% more gold from defeated enemies.',
    effect: { kind: 'victory-gold', amount: 0.25 },
    asset: '/images/items/orb.png',
  },
  {
    id: 'alchemist-flask',
    name: 'Alchemist Flask',
    price: 450,
    description: 'Potions restore 50% more health.',
    effect: { kind: 'potion-heal', amount: 0.5 },
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

function assertPlayerStats(stats: PlayerState['stats']): void {
  if (
    !Object.values(stats).every((value) => Number.isFinite(value) && value >= 0) ||
    stats.health <= 0
  ) {
    throw new RangeError('Player stats must be finite and non-negative with positive health.');
  }
}

function assertStorePlayer(player: PlayerState): void {
  if (!Number.isSafeInteger(player.gold) || player.gold < 0) {
    throw new RangeError('Player gold must be a non-negative safe integer.');
  }
  if (!Number.isSafeInteger(player.potions) || player.potions < 0) {
    throw new RangeError('Player potions must be a non-negative safe integer.');
  }
  assertPlayerStats(player.stats);
  if (
    !Array.isArray(player.inventory) ||
    player.inventory.some(
      (item) =>
        !item ||
        !STORE_ITEMS.some((candidate) => candidate.id === item.id) ||
        !Number.isSafeInteger(item.price) ||
        item.price < 0,
    ) ||
    new Set(player.inventory.map((item) => item.id)).size !== player.inventory.length
  ) {
    throw new RangeError('Player inventory must contain unique known items.');
  }
}

export function purchaseItem(player: PlayerState, itemId: string): PurchaseResult {
  assertStorePlayer(player);
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
      inventory: [...player.inventory, item],
    },
    message: `${item.name} acquired. Its passive effect is active.`,
  };
}

function effectTotal(player: PlayerState, kind: ItemState['effect']['kind']): number {
  return player.inventory.reduce(
    (total, item) => total + (item.effect.kind === kind ? item.effect.amount : 0),
    0,
  );
}

export function relicDamageModifiers(player: PlayerState, kind: DamageKind): DamageModifiers {
  return {
    damageMultiplier: 1 + effectTotal(player, kind === 'attack' ? 'attack-damage' : 'magic-damage'),
  };
}

export function relicGuardBreakMultiplier(player: PlayerState): number {
  return player.inventory.some((item) => item.id === 'whetstone') ? 1.5 : 1;
}

export function relicGuardBlockMultiplier(player: PlayerState): number {
  return player.inventory.some((item) => item.id === 'ironbark') ? 1.25 : 1;
}

export function relicHexMultiplier(player: PlayerState): number {
  return player.inventory.some((item) => item.id === 'arcane-lens') ? 1.35 : 1;
}

export function relicIncomingDamageModifiers(player: PlayerState): DamageModifiers {
  return { receivedDamageMultiplier: Math.max(0.5, 1 - effectTotal(player, 'damage-reduction')) };
}

export function relicPotionHealingFraction(player: PlayerState): number {
  return Math.min(1, 0.25 * (1 + effectTotal(player, 'potion-heal')));
}

export function relicVictoryHealAmount(player: PlayerState): number {
  return Math.trunc(player.stats.health * effectTotal(player, 'victory-heal'));
}

export function relicVictoryGoldMultiplier(player: PlayerState): number {
  return 1 + effectTotal(player, 'victory-gold');
}

export function purchasePotions(player: PlayerState, offerId: string): PurchaseResult {
  assertStorePlayer(player);
  const offer = STORE_POTIONS.find((candidate) => candidate.id === offerId);
  if (!offer) return { purchased: false, player, reason: 'That potion offer is not available.' };
  if (player.gold < offer.price)
    return { purchased: false, player, reason: 'You cannot afford that potion offer.' };
  const nextPotions = player.potions + offer.quantity;
  if (!Number.isSafeInteger(nextPotions)) {
    throw new RangeError('Player potions must remain a non-negative safe integer.');
  }

  return {
    purchased: true,
    player: {
      ...player,
      gold: player.gold - offer.price,
      potions: nextPotions,
    },
    message: `${offer.name} purchased.`,
  };
}
