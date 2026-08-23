import { ItemState, RelicQuality } from './game-types';

const normal = (
  id: string,
  name: string,
  icon: string,
  price: number,
  description: string,
  effect: ItemState['effect'],
): ItemState => ({ id, name, quality: 'normal', icon, price, description, effect });

const rare = (
  id: string,
  name: string,
  icon: string,
  price: number,
  description: string,
  effect: ItemState['effect'],
): ItemState => ({ id, name, quality: 'rare', icon, price, description, effect });

const epic = (
  id: string,
  name: string,
  icon: string,
  price: number,
  description: string,
  effect: ItemState['effect'],
): ItemState => ({ id, name, quality: 'epic', icon, price, description, effect });

export const RELIC_CATALOG: readonly ItemState[] = [
  normal('honed-edge', 'Honed Edge', 'Sword', 350, 'Attack deals 10% more damage.', {
    kind: 'multiplier',
    target: 'attack',
    amount: 0.1,
  }),
  normal(
    'apprentices-codex',
    "Apprentice's Codex",
    'BookOpen',
    350,
    'Magic deals 10% more damage.',
    {
      kind: 'multiplier',
      target: 'magic',
      amount: 0.1,
    },
  ),
  normal(
    'guarders-buckler',
    "Guarder's Buckler",
    'Shield',
    400,
    'Guard grants 8 additional Block.',
    {
      kind: 'block',
      trigger: 'start-of-player-turn',
      amount: 8,
    },
  ),
  normal(
    'swiftstep-anklet',
    'Swiftstep Anklet',
    'Footprints',
    400,
    'Gain +2 Speed, improving opening-turn priority.',
    {
      kind: 'stat-bonus',
      stat: 'speed',
      amount: 2,
    },
  ),
  normal(
    'vitality-moss',
    'Vitality Moss',
    'HeartPlus',
    450,
    'Gain +100 maximum Health. Current health is unchanged when acquired.',
    {
      kind: 'stat-bonus',
      stat: 'health',
      amount: 100,
    },
  ),
  normal(
    'soot-charm',
    'Soot Charm',
    'Flame',
    400,
    'At the start of each enemy turn, deal 4 effect damage to the enemy.',
    {
      kind: 'trigger',
      trigger: 'start-of-enemy-turn',
      amount: 4,
    },
  ),
  normal(
    'bandage-roll',
    'Bandage Roll',
    'HeartPulse',
    350,
    'After victory, restore 8% of maximum Health.',
    {
      kind: 'trigger',
      trigger: 'after-victory',
      amount: 0.08,
    },
  ),
  normal('coin-purse', 'Coin Purse', 'Coins', 350, 'Earn 20% more gold from victories.', {
    kind: 'multiplier',
    target: 'gold',
    amount: 0.2,
  }),
  normal(
    'travelers-compass',
    "Traveler's Compass",
    'Compass',
    450,
    'When a route map opens, reveal one additional hidden door.',
    {
      kind: 'trigger',
      trigger: 'route-map',
      amount: 1,
    },
  ),
  normal(
    'potion-satchel',
    'Potion Satchel',
    'FlaskConical',
    400,
    'The first Potion used in each combat also grants 6 Block.',
    {
      kind: 'block',
      trigger: 'first-time-each-combat',
      amount: 6,
    },
  ),

  rare(
    'thornmail',
    'Thornmail',
    'ShieldAlert',
    800,
    'Once per enemy action, when Block absorbs damage, deal 6 effect damage back.',
    {
      kind: 'trigger',
      trigger: 'after-block-absorbs',
      amount: 6,
    },
  ),
  rare(
    'hexglass-prism',
    'Hexglass Prism',
    'Sparkles',
    850,
    'Arcane mark empowers the next Attack by 45% instead of 25%; applying it grants 4 Block.',
    {
      kind: 'trigger',
      trigger: 'after-magic',
      amount: 4,
    },
  ),
  rare(
    'echoing-blade',
    'Echoing Blade',
    'Swords',
    850,
    'Every third Attack in a combat deals 75% bonus damage.',
    {
      kind: 'trigger',
      trigger: 'every-nth-action',
      amount: 0.75,
      counter: 3,
    },
  ),
  rare(
    'blood-ledger',
    'Blood Ledger',
    'ScrollText',
    750,
    'Once per combat below 40% Health, restore 12% maximum Health.',
    {
      kind: 'trigger',
      trigger: 'below-health-threshold',
      amount: 0.12,
      threshold: 0.4,
    },
  ),
  rare(
    'ritual-bell',
    'Ritual Bell',
    'BellRing',
    800,
    'Start combat with 14 Block; your first damaging action deals 10% less damage.',
    {
      kind: 'block',
      trigger: 'start-of-combat',
      amount: 14,
    },
  ),
  rare(
    'arcane-battery',
    'Arcane Battery',
    'BatteryCharging',
    800,
    'The first Magic that hits in each combat grants 10 Block.',
    {
      kind: 'block',
      trigger: 'after-magic',
      amount: 10,
    },
  ),
  rare(
    'war-drums',
    'War Drums',
    'Drum',
    800,
    'If you act first, your first damaging action deals 30% more damage.',
    {
      kind: 'trigger',
      trigger: 'first-time-each-combat',
      amount: 0.3,
    },
  ),
  rare(
    'venom-vial',
    'Venom Vial',
    'FlaskRound',
    850,
    'After Magic hits, apply 5 Venom. At the start of the enemy turn, Venom deals damage and decreases by 1.',
    {
      kind: 'trigger',
      trigger: 'after-magic',
      amount: 5,
    },
  ),
  rare('salvagers-map', "Salvager's Map", 'Map', 700, 'Stores offer one additional relic.', {
    kind: 'trigger',
    trigger: 'store',
    amount: 1,
  }),
  rare(
    'emberheart',
    'Emberheart',
    'HeartCrack',
    900,
    'Below 50% Health, Attack and Magic deal 20% more damage.',
    {
      kind: 'trigger',
      trigger: 'below-health-threshold',
      amount: 0.2,
      threshold: 0.5,
    },
  ),

  epic(
    'phoenix-feather',
    'Phoenix Feather',
    'Feather',
    1400,
    'The first lethal hit in a run leaves you at 1 Health, grants 30 Block, and consumes this relic.',
    {
      kind: 'trigger',
      trigger: 'first-time-each-combat',
      amount: 30,
    },
  ),
  epic(
    'the-hourglass',
    'The Hourglass',
    'Hourglass',
    1300,
    'For the first 3 player turns of each combat, damaging actions deal 25% more damage.',
    {
      kind: 'trigger',
      trigger: 'start-of-player-turn',
      amount: 0.25,
      counter: 3,
    },
  ),
  epic(
    'mirror-of-night',
    'Mirror of Night',
    'MoonStar',
    1500,
    'When enemy Magic deals health damage, reflect 25% of that damage back.',
    {
      kind: 'trigger',
      trigger: 'after-magic',
      amount: 0.25,
    },
  ),
  epic(
    'crown-of-thorns',
    'Crown of Thorns',
    'Crown',
    1400,
    'When Block absorbs 20+ damage from one enemy action, deal 20 effect damage and apply 3 Venom.',
    {
      kind: 'trigger',
      trigger: 'after-block-absorbs',
      amount: 20,
      threshold: 20,
    },
  ),
  epic(
    'infinite-edge',
    'Infinite Edge',
    'Infinity',
    1350,
    'Every fourth damaging action deals an additional 35% effect damage.',
    {
      kind: 'trigger',
      trigger: 'every-nth-action',
      amount: 0.35,
      counter: 4,
    },
  ),
  epic(
    'dungeon-heart',
    'Dungeon Heart',
    'Heart',
    1600,
    'After victory, gain +40 maximum Health and restore 10% maximum Health.',
    {
      kind: 'trigger',
      trigger: 'after-victory',
      amount: 0.1,
    },
  ),
  epic(
    'void-lantern',
    'Void Lantern',
    'LampDesk',
    1350,
    'The first enemy Attack or Magic action in each combat deals 50% less damage.',
    {
      kind: 'trigger',
      trigger: 'first-time-each-combat',
      amount: 0.5,
    },
  ),
  epic(
    'oath-of-first-strike',
    'Oath of First Strike',
    'Crosshair',
    1450,
    'If you act first, your first damaging action cannot miss and deals 50% bonus damage.',
    {
      kind: 'trigger',
      trigger: 'first-time-each-combat',
      amount: 0.5,
    },
  ),
  epic(
    'alchemists-crown',
    "Alchemist's Crown",
    'Crown',
    1350,
    'Potions restore 50% maximum Health; the first Potion each combat does not consume your turn.',
    {
      kind: 'multiplier',
      target: 'potion',
      amount: 1,
    },
  ),
  epic(
    'kings-seal',
    "King's Seal",
    'BadgeDollarSign',
    1500,
    'Elite and boss victories grant 50% more gold and experience.',
    {
      kind: 'multiplier',
      target: 'experience',
      amount: 0.5,
    },
  ),
];

export const RELIC_QUALITIES: readonly RelicQuality[] = ['normal', 'rare', 'epic'];

export function findRelic(id: string): ItemState | undefined {
  return RELIC_CATALOG.find((relic) => relic.id === id);
}

export function relicsOfQuality(quality: RelicQuality): readonly ItemState[] {
  return RELIC_CATALOG.filter((relic) => relic.quality === quality);
}

export function hasRelic(
  player: { readonly inventory: readonly ItemState[] },
  id: string,
): boolean {
  return player.inventory.some((relic) => relic.id === id);
}
