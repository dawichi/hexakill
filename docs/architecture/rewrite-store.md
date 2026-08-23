# Relic Shop and Consumable Contract

**Status:** Superseded by the implemented tiered relic catalog; balance remains subject to manual
play review.

> The active catalog and trigger contract are documented in the [relic system redesign plan](../features/relic-system-plan.md)
> and [relic reference list](../features/relics-reference.md).

Hexakill now uses two different kinds of run resources:

- **Relics** are one-time purchases with passive effects. They never inflate the player's raw
  health, attack, magic, armor, resistance, or speed stats.
- **Potions** are repeatable consumables. They restore a percentage of missing health and spend the
  player's turn in combat.

The merchant now creates a seeded offer set from the 30-item catalog. Early stores show four relics,
mid stores six, and late stores eight; half are guaranteed Normal slots and the rest roll Rare/Epic
at 75%/25%. Salvager's Map adds one slot. Owned relics never return, while potion offers remain
repeatable.

## Health and timing

Health damage persists between encounters. A new enemy inherits the player's current damage, so
route choices matter:

- A potion restores 25% of maximum health, capped at missing health, then yields the enemy turn.
- Alchemist's Crown raises that amount to 50% and makes the first potion in each combat free.
- A campfire restores 30% of maximum health.
- Bandage Roll restores 8% of maximum health after victory; Dungeon Heart adds 10% and increases maximum Health.

## Implementation boundary

`ItemState.effect` contains a typed passive effect. `purchaseItem` spends gold, adds the relic, and
applies intentional maximum-stat bonuses immediately; combat, progression, route, and healing
rules read the remaining effects through pure helpers. Phoenix charges are persisted separately
from the inventory so the consumed state survives a reload.

Older relic identifiers are intentionally removed from the active contract. Existing saved sessions
containing those identifiers are rejected by the current restore validation and should be restarted.
