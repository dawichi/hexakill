import { DamageKind, DamageModifiers } from './combat-rules';
import { findRelic, hasRelic, RELIC_CATALOG, relicsOfQuality } from './relics';
import { ItemState, PlayerState, RelicQuality, Stats } from './game-types';

export const STORE_ITEMS: readonly ItemState[] = RELIC_CATALOG;

export const STORE_POTIONS = [
  { id: 'potion', name: 'Potion', quantity: 1, price: 100 },
  { id: 'potion-pack', name: '5 Potions pack', quantity: 5, price: 400 },
] as const;

export type PurchaseResult =
  | { readonly purchased: true; readonly player: PlayerState; readonly message: string }
  | { readonly purchased: false; readonly player: PlayerState; readonly reason: string };

export interface StoreOfferOptions {
  readonly floor: number;
  readonly random: () => number;
}

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
    throw new RangeError('Player inventory must contain unique known relics.');
  }
}

function shuffle<T>(values: readonly T[], random: () => number): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.min(index, Math.floor(random() * (index + 1)));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function offerCount(floor: number, player: PlayerState): number {
  const base = floor < 5 ? 4 : floor < 10 ? 6 : 8;
  return base + (hasRelic(player, 'salvagers-map') ? 1 : 0);
}

function chooseQuality(random: () => number): RelicQuality {
  return random() < 0.75 ? 'rare' : 'epic';
}

function takeRandom(
  pool: readonly ItemState[],
  ownedIds: ReadonlySet<string>,
  random: () => number,
): ItemState | undefined {
  const available = pool.filter((item) => !ownedIds.has(item.id));
  if (!available.length) return undefined;
  return available[Math.min(available.length - 1, Math.floor(random() * available.length))];
}

export function generateStoreOffers(
  player: PlayerState,
  options: StoreOfferOptions,
): readonly ItemState[] {
  assertStorePlayer(player);
  if (!Number.isSafeInteger(options.floor) || options.floor < 1) {
    throw new RangeError('Store offer floor must be a positive safe integer.');
  }
  if (typeof options.random !== 'function')
    throw new TypeError('Store offer random source is required.');

  const count = offerCount(options.floor, player);
  const ownedIds = new Set(player.inventory.map((item) => item.id));
  const offers: ItemState[] = [];
  const add = (item: ItemState | undefined): void => {
    if (!item || offers.some((offer) => offer.id === item.id)) return;
    offers.push(item);
    ownedIds.add(item.id);
  };

  const normalPool = relicsOfQuality('normal');
  const specialPool = [...relicsOfQuality('rare'), ...relicsOfQuality('epic')];
  const guaranteedNormal = Math.min(Math.floor(count / 2), normalPool.length);
  for (let index = 0; index < guaranteedNormal; index += 1) {
    add(takeRandom(normalPool, ownedIds, options.random));
  }
  while (offers.length < count) {
    const quality = chooseQuality(options.random);
    const candidate = takeRandom(relicsOfQuality(quality), ownedIds, options.random);
    add(candidate ?? takeRandom(specialPool, ownedIds, options.random));
    if (!candidate && offers.length >= RELIC_CATALOG.length - player.inventory.length) break;
  }

  return shuffle(offers, options.random);
}

function immediateRelicStats(player: PlayerState, item: ItemState): Stats {
  if (item.effect.kind !== 'stat-bonus') return player.stats;
  return {
    ...player.stats,
    [item.effect.stat]: player.stats[item.effect.stat] + item.effect.amount,
  };
}

export function purchaseItem(player: PlayerState, itemId: string): PurchaseResult {
  assertStorePlayer(player);
  const item = findRelic(itemId);
  if (!item) return { purchased: false, player, reason: 'That relic is not available.' };
  if (hasRelic(player, item.id)) {
    return { purchased: false, player, reason: 'That relic has already been purchased.' };
  }
  if (player.gold < item.price) {
    return { purchased: false, player, reason: 'You cannot afford that relic.' };
  }

  return {
    purchased: true,
    player: {
      ...player,
      stats: immediateRelicStats(player, item),
      gold: player.gold - item.price,
      inventory: [...player.inventory, item],
      relicCharges:
        item.id === 'phoenix-feather'
          ? { ...player.relicCharges, 'phoenix-feather': 1 }
          : player.relicCharges,
    },
    message: `${item.name} acquired. Its passive effect is active.`,
  };
}

function relicAmount(player: PlayerState, id: string): number {
  const relic = findRelic(id);
  return relic && hasRelic(player, id) && relic.effect.kind === 'trigger' ? relic.effect.amount : 0;
}

export function relicDamageModifiers(player: PlayerState, kind: DamageKind): DamageModifiers {
  const relic = kind === 'attack' ? findRelic('honed-edge') : findRelic('apprentices-codex');
  return {
    damageMultiplier:
      hasRelic(player, relic?.id ?? '') && relic?.effect.kind === 'multiplier'
        ? 1 + relic.effect.amount
        : 1,
  };
}

export function relicGuardBreakMultiplier(_player: PlayerState): number {
  return 1;
}

export function relicGuardBlockMultiplier(_player: PlayerState): number {
  return 1;
}

export function relicGuardBonus(player: PlayerState): number {
  return relicAmount(player, 'guarders-buckler');
}

export function relicHexMultiplier(player: PlayerState): number {
  return hasRelic(player, 'hexglass-prism') ? 1.8 : 1;
}

export function relicIncomingDamageModifiers(_player: PlayerState): DamageModifiers {
  return { receivedDamageMultiplier: 1 };
}

export function relicPotionHealingFraction(player: PlayerState): number {
  return hasRelic(player, 'alchemists-crown') ? 0.5 : 0.25;
}

export function relicPotionConsumesTurn(player: PlayerState, firstPotion: boolean): boolean {
  return !(firstPotion && hasRelic(player, 'alchemists-crown'));
}

export function relicVictoryHealAmount(player: PlayerState): number {
  const percentage =
    relicAmount(player, 'bandage-roll') + (hasRelic(player, 'dungeon-heart') ? 0.1 : 0);
  return Math.trunc(player.stats.health * percentage);
}

export function relicVictoryGoldMultiplier(player: PlayerState): number {
  return (
    1 + (hasRelic(player, 'coin-purse') ? 0.2 : 0) + (hasRelic(player, 'kings-seal') ? 0.5 : 0)
  );
}

export function relicVictoryExperienceMultiplier(
  player: PlayerState,
  enemyArchetype: string,
): number {
  return hasRelic(player, 'kings-seal') && (enemyArchetype === 'elite' || enemyArchetype === 'boss')
    ? 1.5
    : 1;
}

export function purchasePotions(player: PlayerState, offerId: string): PurchaseResult {
  assertStorePlayer(player);
  const offer = STORE_POTIONS.find((candidate) => candidate.id === offerId);
  if (!offer) return { purchased: false, player, reason: 'That potion offer is not available.' };
  if (player.gold < offer.price) {
    return { purchased: false, player, reason: 'You cannot afford that potion offer.' };
  }

  const nextPotions = player.potions + offer.quantity;
  if (!Number.isSafeInteger(nextPotions)) throw new RangeError('Player potions must remain safe.');
  return {
    purchased: true,
    player: { ...player, gold: player.gold - offer.price, potions: nextPotions },
    message: `${offer.name} purchased.`,
  };
}
