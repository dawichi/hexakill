# Current Gameplay Loop

**Status:** Observed legacy implementation, not a complete product specification. The active Angular behavior is a provisional rewrite contract and may intentionally differ where documented.

## Journey

1. `welcome` renders the instructions. Start loads saved volume preferences and moves to `champSelect`.
2. `champSelect` accepts a name only when its length is 3–14 characters and offers Wizard, Samurai, or Warrior. Starting creates a level-4 `CharacterModel` and moves to `combat`.
3. `combat` can spawn an enemy, open the store, show entity stats, logs, items, power-ups, and action buttons.
4. A combat turn uses Attack, Magic, or Potion. Entity speed determines who acts first; the second action is delayed by two seconds. Defeat transitions are delayed again before the next state is visible.
5. Defeating an enemy grants experience and gold, records the enemy, and can grant power-ups. The player can return to the combat screen and spawn another enemy.
6. `store` displays two potion offers and the remaining item offers. Purchases mutate the character's gold, potions, or inventory and remove purchased items from the current session shop.
7. Player defeat writes a local personal record and moves to `gameover`. Retry resets most session state and repopulates the item shop, then returns to `champSelect`.

Keyboard shortcuts are currently implemented through window handlers: Space spawns a fight or retries, P opens/closes the store, A attacks, S uses magic, and D uses a potion. Power-up shortcuts use the number keys 1–4, but the handler does not guard unmapped keys.

## Current rules observed in code

- Character base level is 4.
- Archived base stats were defined in `legacy/svelte/src/lib/models/config.ts`.
- Archived character modifiers were defined in `legacy/svelte/src/lib/config/characters.ts`.
- Enemy levels are generated from the player level, except for boss entries at thresholds 10, 20, and 30.
- Attack and magic damage use random ranges, miss chances, critical chances, and resistance reduction.
- Potions heal a portion of damage received and are limited by the entity's potion count.
- Power-ups have four types and a maximum of six allocations per type in the UI.
- Personal records are sorted by level and truncated to five entries in local storage.

The values above are implementation facts, not a balanced or approved game design. The rewrite MUST first decide which rules are intentional, which are bugs, and which are obsolete.

The active Angular implementation currently preserves the defeat-record behavior at a safer boundary: it writes a versioned local top-five list using stable character IDs, displays it on welcome and game-over, and preserves it across run reset. This is a provisional characterization contract, not a decision that records must remain local-only; see [the persistence contract](../architecture/rewrite-persistence.md).

## Product gaps to clarify later

- Whether item bonuses are intended to affect effective combat stats; current code displays them but does not clearly apply them to combat calculations.
- Whether the store should restock, persist purchases across runs, or become a progression system.
- Whether bosses should be repeatable or consumed once per service instance.
- Whether the active versioned local run should survive a browser refresh or be intentionally ephemeral.
- Whether personal records should remain local-only or become account-backed.
- Whether keyboard controls and audio behavior are required accessibility/product contracts or legacy conveniences.
