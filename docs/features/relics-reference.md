# Relic reference

**Source of truth:** `src/app/domain/relics.ts`, as accepted in
[ADR-0009](../adr/0009-catalog-driven-relic-effects.md). Names, icons, prices, descriptions, and
numeric effects are read from the same typed catalog. Prices and effects are provisional balance
values.

## Normal relics

| Relic | Icon | Price | Effect |
| --- | --- | ---: | --- |
| Honed Edge | `Sword` | 350 | Attack deals 10% more damage. |
| Apprentice's Codex | `BookOpen` | 350 | Magic deals 10% more damage. |
| Guarder's Buckler | `Shield` | 400 | Guard grants 25% more Block. |
| Swiftstep Anklet | `Footprints` | 400 | Gain 5 Speed. |
| Vitality Moss | `HeartPlus` | 450 | Gain 100 maximum Health; current damage is unchanged. |
| Soot Charm | `Flame` | 400 | At each enemy turn, deal effect damage equal to 0.75% of enemy maximum Health. |
| Bandage Roll | `HeartPulse` | 350 | After victory, restore 5% of maximum Health. |
| Coin Purse | `Coins` | 350 | Earn 30% more gold from victories. |
| Traveler's Compass | `Compass` | 450 | Each fork reveals one additional hidden path. |
| Potion Satchel | `FlaskConical` | 400 | The first Potion each combat also grants Block equal to 50% of the Health it restores. |

## Rare relics

| Relic | Icon | Price | Effect |
| --- | --- | ---: | --- |
| Thornmail | `ShieldAlert` | 800 | When Block absorbs damage, deal 30% of the absorbed damage back. |
| Hexglass Prism | `Sparkles` | 850 | Arcane mark adds 50% Attack damage instead of 25%; applying it grants Block equal to 25% of Magic damage. |
| Echoing Blade | `Swords` | 850 | Every third Attack in a combat deals 50% bonus damage. |
| Blood Ledger | `ScrollText` | 750 | Once per combat, when a hit leaves you below 35% Health, restore 10% maximum Health. |
| Ritual Bell | `BellRing` | 800 | Start combat with Block equal to 8% of maximum Health; your first damaging action deals 10% less damage. |
| Arcane Battery | `BatteryCharging` | 800 | The first Magic that hits each combat grants Block equal to 50% of its damage. |
| War Drums | `Drum` | 800 | If you act first, your first damaging action deals 30% more damage. |
| Venom Vial | `FlaskRound` | 850 | Magic hits apply 5 Venom. Venom damages the enemy at turn start and decreases by one. |
| Salvager's Map | `Map` | 700 | Merchants offer one additional relic. |
| Emberheart | `HeartCrack` | 900 | Below 50% Health, Attack and Magic deal 15% more damage. |

## Epic relics

| Relic | Icon | Price | Effect |
| --- | --- | ---: | --- |
| Phoenix Feather | `Feather` | 1,400 | The first lethal hit leaves you at 1 Health, restores 20% maximum Health, and consumes the relic. |
| The Hourglass | `Hourglass` | 1,300 | The first three actions each combat deal 25% more Attack or Magic damage. |
| Mirror of Night | `MoonStar` | 1,500 | Reflect 25% of damage dealt to you by enemy Magic. |
| Crown of Thorns | `Crown` | 1,400 | When one enemy action is blocked by at least 5% of maximum Health, reflect 50% of the absorbed amount and apply 3 Venom. |
| Infinite Edge | `Infinity` | 1,350 | Every fourth Attack or Magic deals 35% more damage. |
| Dungeon Heart | `Heart` | 1,600 | After victory, gain 60 maximum Health and restore 5% maximum Health. |
| Void Lantern | `LampDesk` | 1,350 | The first enemy Attack or Magic each combat deals 50% less damage. |
| Oath of First Strike | `Crosshair` | 1,450 | If you act first, your first damaging action cannot miss and deals 50% more damage. |
| Alchemist's Crown | `Crown` | 1,350 | Potions restore 35% maximum Health; the first Potion each combat does not end your turn. |
| King's Seal | `BadgeDollarSign` | 1,500 | Elite and boss victories grant 50% more gold and experience. |

## Rules shared by the catalog

- Relic effects are passive; one-time relics cannot be purchased twice. A consumed Phoenix Feather
  stays consumed after reload.
- Guard Block is temporary. Each incoming hit consumes its share independently; it does not carry
  into a new room.
- Vitality Moss and Dungeon Heart increase maximum Health without clearing existing damage.
- Venom deals damage at the start of the enemy turn and loses one stack after its tick.
- Salvager's Map adds a tier-rolled offer; Epic relics can appear in the first merchant.
- The catalog and simulator do not establish media rights. Icon glyphs are Lucide UI icons; bundled
  art and audio origins and license terms remain unverified as described in the
  [README credits note](../../README.md#asset-credits-and-licensing).
