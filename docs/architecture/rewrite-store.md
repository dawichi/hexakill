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
- Closing the store returns to the ready or active combat screen; refreshing or starting a new run clears the in-memory store state.
- All purchase and reward rules are pure functions; Angular only coordinates them.

## Unresolved before production migration

Decide whether equipment changes maximum/current health, whether item bonuses affect every combat formula, shop restocking and duplicate rules, persistence across runs, sell/refund behavior, final prices and balance, and user-facing failure feedback. Add browser journey tests and a durable ADR after those decisions.
