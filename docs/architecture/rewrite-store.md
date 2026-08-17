# Provisional Store and Progression Contract

**Status:** Characterization only; product acceptance pending.

The legacy application exposes a store, but its completion and gameplay effects were not reliable enough to treat as an approved specification. This document records observed values and the narrower contract currently implemented in the active Angular app so future agents can distinguish evidence from decisions.

## Observed legacy offers

| Offer       | Price | Observed effect        |
| ----------- | ----: | ---------------------- |
| Potion      |   100 | +1 potion              |
| Potion pack |   400 | +5 potions             |
| Orb         |   500 | +1000 health bonus     |
| Sword       |   900 | +200 attack, +50 speed |
| Wand        |  2000 | +500 ability power     |

The legacy code displays and adds items, but the complete interaction between inventory bonuses, current/max health, combat calculations, restocking, and persistence is not established. Those are open product questions.

## Current Angular behavior

- The store is reachable from a ready run or between enemy turns.
- Potion offers are repeatable while the player has enough gold.
- Equipment offers are one-time per in-memory run.
- Purchases require sufficient gold and otherwise leave state unchanged.
- Equipment bonuses are applied immediately to player stats and the item is added to inventory.
- The store is entered from a merchant node on the route map; closing it returns to the next route map rather than directly to combat. Refreshing or starting a new run clears the in-memory store state.
- All purchase and reward rules are pure functions; Angular only coordinates them.

## Confirmed parity boundary

The current item-effect rule is a deliberate provisional choice, not a recovered legacy contract:

- The archived `CharacterModel.addItem` adds the item to `inventory.items` and recalculates `inventory.totalBonus`; it does not assign the bonus directly to the entity's `health`, `ad`, `ap`, `armor`, `mr`, or `speed` fields.
- The archived store removes a purchased equipment item from `shop.items`, while potion offers remain available. The archived UI separately renders the inventory's accumulated bonus values.
- The active Angular `purchaseItem` adds the item to the immutable inventory and applies its bonus immediately to `player.stats`; duplicate equipment is rejected by inventory identity.

Consequently, the active stat values after an equipment purchase must not be treated as legacy parity. The owner decision must define whether bonuses are derived display/inventory effects, direct combat-stat effects, or a new explicit maximum/current-health model before the store is production-ready.

## Unresolved before production migration

Decide whether equipment changes maximum/current health, whether item bonuses affect every combat formula, shop restocking and duplicate rules, persistence across runs, sell/refund behavior, final prices and balance, and user-facing failure feedback. Add browser journey tests and a durable ADR after those decisions.
