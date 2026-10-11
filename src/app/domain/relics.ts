export type RelicQuality = 'normal' | 'rare' | 'epic';

interface RelicDefinition<Params> {
  readonly name: string;
  readonly quality: RelicQuality;
  /** Lucide icon name rendered by the relic icon component. */
  readonly icon: string;
  readonly price: number;
  /** Every tunable number of the relic. Rules read these; descriptions are generated from them. */
  readonly params: Params;
  readonly describe: (params: Params) => string;
}

const relic = <Params>(definition: RelicDefinition<Params>): RelicDefinition<Params> => definition;
const percent = (fraction: number): string => `${Math.round(fraction * 100)}%`;

export const RELICS = {
  'honed-edge': relic({
    name: 'Honed Edge',
    quality: 'normal',
    icon: 'Sword',
    price: 350,
    params: { bonus: 0.1 },
    describe: (p) => `Attack deals ${percent(p.bonus)} more damage.`,
  }),
  'apprentices-codex': relic({
    name: "Apprentice's Codex",
    quality: 'normal',
    icon: 'BookOpen',
    price: 350,
    params: { bonus: 0.1 },
    describe: (p) => `Magic deals ${percent(p.bonus)} more damage.`,
  }),
  'guarders-buckler': relic({
    name: "Guarder's Buckler",
    quality: 'normal',
    icon: 'Shield',
    price: 400,
    params: { bonus: 0.25 },
    describe: (p) => `Guard grants ${percent(p.bonus)} more Block.`,
  }),
  'swiftstep-anklet': relic({
    name: 'Swiftstep Anklet',
    quality: 'normal',
    icon: 'Footprints',
    price: 400,
    params: { speed: 5 },
    describe: (p) => `Gain +${p.speed} Speed, improving your chance to act first.`,
  }),
  'vitality-moss': relic({
    name: 'Vitality Moss',
    quality: 'normal',
    icon: 'HeartPlus',
    price: 450,
    params: { health: 100 },
    describe: (p) => `Gain +${p.health} maximum Health. Current damage is unchanged.`,
  }),
  'soot-charm': relic({
    name: 'Soot Charm',
    quality: 'normal',
    icon: 'Flame',
    price: 400,
    params: { share: 0.0075 },
    describe: (p) =>
      `At the start of each enemy turn, deal effect damage equal to ${p.share * 100}% of the enemy's maximum Health.`,
  }),
  'bandage-roll': relic({
    name: 'Bandage Roll',
    quality: 'normal',
    icon: 'HeartPulse',
    price: 350,
    params: { heal: 0.05 },
    describe: (p) => `After victory, restore ${percent(p.heal)} of maximum Health.`,
  }),
  'coin-purse': relic({
    name: 'Coin Purse',
    quality: 'normal',
    icon: 'Coins',
    price: 350,
    params: { bonus: 0.3 },
    describe: (p) => `Earn ${percent(p.bonus)} more gold from victories.`,
  }),
  'travelers-compass': relic({
    name: "Traveler's Compass",
    quality: 'normal',
    icon: 'Compass',
    price: 450,
    params: { reveal: 1 },
    describe: (p) => `Each fork reveals ${p.reveal} additional hidden path.`,
  }),
  'potion-satchel': relic({
    name: 'Potion Satchel',
    quality: 'normal',
    icon: 'FlaskConical',
    price: 400,
    params: { share: 0.5 },
    describe: (p) =>
      `The first Potion used in each combat also grants Block equal to ${percent(p.share)} of the Health it restores.`,
  }),

  thornmail: relic({
    name: 'Thornmail',
    quality: 'rare',
    icon: 'ShieldAlert',
    price: 800,
    params: { share: 0.3 },
    describe: (p) =>
      `When Block absorbs damage, deal ${percent(p.share)} of the absorbed damage back.`,
  }),
  'hexglass-prism': relic({
    name: 'Hexglass Prism',
    quality: 'rare',
    icon: 'Sparkles',
    price: 850,
    params: { markBonus: 0.5, share: 0.25 },
    describe: (p) =>
      `Arcane mark empowers the next Attack by ${percent(p.markBonus)} instead of 25%; applying it grants Block equal to ${percent(p.share)} of the Magic damage.`,
  }),
  'echoing-blade': relic({
    name: 'Echoing Blade',
    quality: 'rare',
    icon: 'Swords',
    price: 850,
    params: { every: 3, bonus: 0.5 },
    describe: (p) =>
      `Every ${ordinal(p.every)} Attack in a combat deals ${percent(p.bonus)} bonus damage.`,
  }),
  'blood-ledger': relic({
    name: 'Blood Ledger',
    quality: 'rare',
    icon: 'ScrollText',
    price: 750,
    params: { threshold: 0.35, heal: 0.1 },
    describe: (p) =>
      `Once per combat, when a hit leaves you below ${percent(p.threshold)} Health, restore ${percent(p.heal)} of maximum Health.`,
  }),
  'ritual-bell': relic({
    name: 'Ritual Bell',
    quality: 'rare',
    icon: 'BellRing',
    price: 800,
    params: { block: 0.08, penalty: 0.1 },
    describe: (p) =>
      `Start combat with Block equal to ${percent(p.block)} of maximum Health; your first damaging action deals ${percent(p.penalty)} less damage.`,
  }),
  'arcane-battery': relic({
    name: 'Arcane Battery',
    quality: 'rare',
    icon: 'BatteryCharging',
    price: 800,
    params: { share: 0.5 },
    describe: (p) =>
      `The first Magic that hits in each combat grants Block equal to ${percent(p.share)} of its damage.`,
  }),
  'war-drums': relic({
    name: 'War Drums',
    quality: 'rare',
    icon: 'Drum',
    price: 800,
    params: { bonus: 0.3 },
    describe: (p) =>
      `If you act first, your first damaging action deals ${percent(p.bonus)} more damage.`,
  }),
  'venom-vial': relic({
    name: 'Venom Vial',
    quality: 'rare',
    icon: 'FlaskRound',
    price: 850,
    params: { venom: 5 },
    describe: (p) =>
      `After Magic hits, apply ${p.venom} Venom. At the start of the enemy turn, Venom deals its value as damage and decreases by 1.`,
  }),
  'salvagers-map': relic({
    name: "Salvager's Map",
    quality: 'rare',
    icon: 'Map',
    price: 700,
    params: { offers: 1 },
    describe: (p) => `Merchants offer ${p.offers} additional relic.`,
  }),
  emberheart: relic({
    name: 'Emberheart',
    quality: 'rare',
    icon: 'HeartCrack',
    price: 900,
    params: { threshold: 0.5, bonus: 0.15 },
    describe: (p) =>
      `Below ${percent(p.threshold)} Health, Attack and Magic deal ${percent(p.bonus)} more damage.`,
  }),

  'phoenix-feather': relic({
    name: 'Phoenix Feather',
    quality: 'epic',
    icon: 'Feather',
    price: 1400,
    params: { heal: 0.2 },
    describe: (p) =>
      `The first lethal hit leaves you at 1 Health, then restores ${percent(p.heal)} of maximum Health. The feather then burns away.`,
  }),
  'the-hourglass': relic({
    name: 'The Hourglass',
    quality: 'epic',
    icon: 'Hourglass',
    price: 1300,
    params: { turns: 3, bonus: 0.25 },
    describe: (p) =>
      `For your first ${p.turns} actions of each combat, Attack and Magic deal ${percent(p.bonus)} more damage.`,
  }),
  'mirror-of-night': relic({
    name: 'Mirror of Night',
    quality: 'epic',
    icon: 'MoonStar',
    price: 1500,
    params: { reflect: 0.25 },
    describe: (p) =>
      `When enemy Magic deals damage to you, reflect ${percent(p.reflect)} of it back.`,
  }),
  'crown-of-thorns': relic({
    name: 'Crown of Thorns',
    quality: 'epic',
    icon: 'Crown',
    price: 1400,
    params: { threshold: 0.05, share: 0.5, venom: 3 },
    describe: (p) =>
      `When Block absorbs at least ${percent(p.threshold)} of your maximum Health in one enemy action, deal ${percent(p.share)} of it back and apply ${p.venom} Venom.`,
  }),
  'infinite-edge': relic({
    name: 'Infinite Edge',
    quality: 'epic',
    icon: 'Infinity',
    price: 1350,
    params: { every: 4, bonus: 0.35 },
    describe: (p) =>
      `Every ${ordinal(p.every)} Attack or Magic deals ${percent(p.bonus)} more damage.`,
  }),
  'dungeon-heart': relic({
    name: 'Dungeon Heart',
    quality: 'epic',
    icon: 'Heart',
    price: 1600,
    params: { maxHealth: 60, heal: 0.05 },
    describe: (p) =>
      `After victory, gain +${p.maxHealth} maximum Health and restore ${percent(p.heal)} of maximum Health.`,
  }),
  'void-lantern': relic({
    name: 'Void Lantern',
    quality: 'epic',
    icon: 'LampDesk',
    price: 1350,
    params: { reduction: 0.5 },
    describe: (p) =>
      `The first enemy Attack or Magic in each combat deals ${percent(p.reduction)} less damage.`,
  }),
  'oath-of-first-strike': relic({
    name: 'Oath of First Strike',
    quality: 'epic',
    icon: 'Crosshair',
    price: 1450,
    params: { bonus: 0.5 },
    describe: (p) =>
      `If you act first, your first damaging action cannot miss and deals ${percent(p.bonus)} more damage.`,
  }),
  'alchemists-crown': relic({
    name: "Alchemist's Crown",
    quality: 'epic',
    icon: 'Crown',
    price: 1350,
    params: { heal: 0.35 },
    describe: (p) =>
      `Potions restore ${percent(p.heal)} of maximum Health; the first Potion each combat does not end your turn.`,
  }),
  'kings-seal': relic({
    name: "King's Seal",
    quality: 'epic',
    icon: 'BadgeDollarSign',
    price: 1500,
    params: { bonus: 0.5 },
    describe: (p) => `Elite and boss victories grant ${percent(p.bonus)} more gold and experience.`,
  }),
} as const;

export type RelicId = keyof typeof RELICS;

export const RELIC_IDS = Object.keys(RELICS) as readonly RelicId[];

export interface RelicView {
  readonly id: RelicId;
  readonly name: string;
  readonly quality: RelicQuality;
  readonly icon: string;
  readonly price: number;
  readonly description: string;
}

function ordinal(value: number): string {
  return value === 2 ? 'second' : value === 3 ? 'third' : value === 4 ? 'fourth' : `${value}th`;
}

export function isRelicId(value: unknown): value is RelicId {
  return typeof value === 'string' && Object.hasOwn(RELICS, value);
}

export function relicView(id: RelicId): RelicView {
  const definition = RELICS[id] as RelicDefinition<unknown>;
  return {
    id,
    name: definition.name,
    quality: definition.quality,
    icon: definition.icon,
    price: definition.price,
    description: definition.describe(definition.params),
  };
}

export function relicsOfQuality(quality: RelicQuality): readonly RelicId[] {
  return RELIC_IDS.filter((id) => RELICS[id].quality === quality);
}
