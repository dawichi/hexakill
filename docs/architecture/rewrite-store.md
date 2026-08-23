# Relic Shop and Consumable Contract

**Status:** Implemented gameplay contract; balance remains subject to manual play review.

Hexakill now uses two different kinds of run resources:

- **Relics** are one-time purchases with passive effects. They never inflate the player's raw
  health, attack, magic, armor, resistance, or speed stats.
- **Potions** are repeatable consumables. They restore a percentage of missing health and spend the
  player's turn in combat.

## Relic pool

| Relic | Price | Passive |
| --- | ---: | --- |
| Whetstone | 450 | Attack deals 15% more damage and breaks 50% more Guard. |
| Arcane Lens | 550 | Magic deals 15% more damage and makes Arcane marks hit harder. |
| Ironbark | 500 | Incoming enemy damage is reduced by 15%; Guard grants 25% more Block. |
| Blood Chalice | 600 | Recover 12% of maximum health after victory. |
| Gilded Eye | 500 | Earn 25% more gold from defeated enemies. |
| Alchemist Flask | 450 | Potions restore 50% more health. |

The current merchant presents the full pool, disables already-owned relics, and keeps potion
offers repeatable. The pool can later become a rotating three-offer selection once route identity
and merchant rarity are established.

## Health and timing

Health damage persists between encounters. A new enemy inherits the player's current damage, so
route choices matter:

- A potion restores 25% of maximum health, capped at missing health, then yields the enemy turn.
- Alchemist Flask raises that amount to 37.5%.
- A campfire restores 30% of maximum health.
- Blood Chalice restores 12% of maximum health immediately after victory.

## Implementation boundary

`ItemState.effect` contains a typed passive effect. `purchaseItem` only spends gold and adds the
relic to inventory. Combat, progression, and healing rules read the owned effects through pure
helpers; no purchase mutates the player's base stats.

Older Orb, Sword, and Wand stat-bonus offers are intentionally removed from the active contract.
Existing saved sessions containing those identifiers are rejected by the current restore
validation and should be restarted.
