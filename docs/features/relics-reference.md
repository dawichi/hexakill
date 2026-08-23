# Relic reference list

**Status:** Proposed catalog — documentation only. These relics are not implemented yet.

Prices are initial hypotheses in gold. Icon names are Lucide suggestions for the first UI pass;
they are placeholders for future pixel-art item assets.

## Normal relics

Normal relics are dependable foundations. They should be useful immediately without being the
entire strategy of a run.

| Relic              | Icon           | Price | Effect                                                                     |
| ------------------ | -------------- | ----: | -------------------------------------------------------------------------- |
| Honed Edge         | `Sword`        |   350 | Your Attack deals **10% more damage**.                                     |
| Apprentice's Codex | `BookOpen`     |   350 | Your Magic deals **10% more damage**.                                      |
| Guarder's Buckler  | `Shield`       |   400 | Guard grants **8 additional Block**.                                       |
| Swiftstep Anklet   | `Footprints`   |   400 | Gain **+2 Speed**, improving opening-turn priority.                        |
| Vitality Moss      | `HeartPlus`    |   450 | Gain **+100 maximum Health**. Current health is unchanged when acquired.   |
| Soot Charm         | `Flame`        |   400 | At the start of each enemy turn, deal **4 effect damage** to the enemy.    |
| Bandage Roll       | `HeartPulse`   |   350 | After victory, restore **8% of maximum Health**, capped at missing health. |
| Coin Purse         | `Coins`        |   350 | Earn **20% more gold** from victories.                                     |
| Traveler's Compass | `Compass`      |   450 | When a route map opens, reveal **one additional hidden door**.             |
| Potion Satchel     | `FlaskConical` |   400 | The first Potion used in each combat also grants **6 Block**.              |

## Rare relics

Rare relics should encourage a recognizable build. Their value increases when the player commits
to the action or route pattern they support.

| Relic          | Icon              | Price | Effect                                                                                                             |
| -------------- | ----------------- | ----: | ------------------------------------------------------------------------------------------------------------------ |
| Thornmail      | `ShieldAlert`     |   800 | Once per enemy action, when Block absorbs damage, deal **6 effect damage** back to the attacker.                   |
| Hexglass Prism | `Sparkles`        |   850 | Arcane mark empowers the next Attack by **45% instead of 25%**. Applying the mark also grants **4 Block**.         |
| Echoing Blade  | `Swords`          |   850 | Every **third Attack** in a combat deals **75% bonus damage**. The counter resets between combats.                 |
| Blood Ledger   | `ScrollText`      |   750 | Once per combat, when you fall below **40% Health**, restore **12% maximum Health**.                               |
| Ritual Bell    | `BellRing`        |   800 | Start combat with **14 Block**. Your first damaging action deals **10% less damage**.                              |
| Arcane Battery | `BatteryCharging` |   800 | The first Magic that hits in each combat grants **10 Block**.                                                      |
| War Drums      | `Drum`            |   800 | If you act first, your first damaging action deals **30% more damage**.                                            |
| Venom Vial     | `FlaskRound`      |   850 | After Magic hits, apply **5 Venom**. At the start of the enemy turn, Venom deals effect damage and decreases by 1. |
| Salvager's Map | `Map`             |   700 | Stores offer **one additional relic**. The extra offer follows the store's normal tier roll.                       |
| Emberheart     | `HeartCrack`      |   900 | While below **50% Health**, your Attack and Magic deal **20% more damage**.                                        |

## Epic relics

Epic relics should be rare run-defining pivots. They may be powerful, but each one has a limit,
condition, or counterplay opportunity.

| Relic                | Icon              | Price | Effect                                                                                                              |
| -------------------- | ----------------- | ----: | ------------------------------------------------------------------------------------------------------------------- |
| Phoenix Feather      | `Feather`         | 1,400 | The first lethal hit in a run leaves you at **1 Health**, grants **30 Block**, and consumes this relic.             |
| The Hourglass        | `Hourglass`       | 1,300 | For the first **3 player turns** of each combat, your damaging actions deal **25% more damage**.                    |
| Mirror of Night      | `MoonStar`        | 1,500 | When an enemy Magic action deals health damage, reflect **25% of that damage** back to the enemy.                   |
| Crown of Thorns      | `Crown`           | 1,400 | When Block absorbs **20 or more damage** from one enemy action, deal **20 effect damage** and apply **3 Venom**.    |
| Infinite Edge        | `Infinity`        | 1,350 | Every **fourth damaging action** deals an additional **35% effect damage**. The counter resets between combats.     |
| Dungeon Heart        | `Heart`           | 1,600 | After victory, gain **+40 maximum Health** and restore **10% maximum Health**.                                      |
| Void Lantern         | `LampDesk`        | 1,350 | The first enemy Attack or Magic action in each combat deals **50% less damage**.                                    |
| Oath of First Strike | `Crosshair`       | 1,450 | If you act first, your first damaging action cannot miss and deals **50% bonus damage**.                            |
| Alchemist's Crown    | `Crown`           | 1,350 | Potions restore **50% maximum Health** instead of 25%, and the first Potion each combat does not consume your turn. |
| King's Seal          | `BadgeDollarSign` | 1,500 | Elite and boss victories grant **50% more gold and experience**.                                                    |

## Questions to resolve before implementation

- Should effect damage be reduced by resistance, Block, both, or neither by default?
- Does Block expire at the start of the owner's next turn, or immediately after the protected
  action resolves?
- Should `Vitality Moss` and `Dungeon Heart` increase current Health proportionally, leave it
  unchanged, or heal the difference?
- Should Venom stack additively, refresh its duration, or increase its damage?
- Does a relic that grants an extra store offer affect the guaranteed Normal row or add another
  tier-rolled slot?
- Should Epic relics be allowed in the first merchant, or only after a minimum route floor?
- Does the first lethal protection from Phoenix Feather count as a combat trigger or a run trigger?
