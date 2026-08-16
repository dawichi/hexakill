# Gameplay Loop and Characterization Boundary

**Status:** The legacy behavior and active Angular behavior are recorded separately. The Angular rules remain provisional until product balance and persistence decisions are accepted.

## Active Angular journey

The root Angular application uses these screens:

1. `welcome` displays the entry point, an always-visible “How to play” field manual with shared stat chips, local personal records, and persistent audio controls.
2. `character-select` accepts a trimmed name of 3–14 characters, renders Wizard, Samurai, and Warrior idle art, presents the character modifier vocabulary through reusable icon-and-color stat chips, and starts a level-4 player.
3. `combat` begins immediately after character selection with a generated enemy. It displays both combatants' icon-only stat chips, idle/attack/hit/defeat art where an asset is characterized, health, combat messages, a non-persistent player/enemy battle log, actions, power-ups, and reset/store controls.
4. `store` displays repeatable potion offers and one-time item offers. Purchased item art and bonuses are shown in the owned-equipment panel.
5. `game-over` displays the defeat message, grouped defeated-enemy history, local personal records, and a new-run action.

The active UI relies on native buttons, inputs, and range controls. Legacy global keyboard shortcuts (`Space`, `P`, `A`, `S`, `D`, and power-up number keys) are not part of the current Angular contract; keyboard operation is currently characterized through native activation and browser journeys.

## Active combat sequencing

- `findEnemy` generates a regular enemy from the observed level range or the next Gold Slime boss at levels 10, 20, and 30.
- The active service compares player and enemy speed. The faster actor opens the encounter; a delayed enemy turn is scheduler-backed and the action controls remain disabled while it resolves.
- Player Attack and Magic use the characterized random ranges, miss/critical rules, and resistance reduction. Critical thresholds preserve the archived strict comparisons: AD is critical only above `0.9`, and AP only above `0.6`; miss thresholds are strict below `0.1` for AD and `0.25` for AP. Exact threshold rolls are neither critical nor misses. Resistance reduction preserves the archived `toFixed(0)` rounding rule. Potion use heals the observed truncated 20% of damage received and then gives the enemy a turn.
- Enemy actions use the observed attack/magic/heal policy. Damage actions select their typed attack or Magic animation; healing restores the enemy without presenting an attack strip. A non-miss enemy damage result selects the typed player hit-reaction strip when the chosen character has one; a non-miss player damage result selects the typed enemy hit-reaction strip when the enemy has one. Misses and unsupported mappings fall back to idle presentation. The pure combat transition rejects malformed player damage results before updating enemy damage or entering a terminal phase. The provisional animation reset is scheduler-backed through the injected `Clock` port.
- Reset cancels pending delayed enemy work and guards stale callbacks with a run-generation token.
- Victory applies provisional experience, gold, level, boss, power-up, and defeated-enemy-history updates. Pending power-ups must be chosen before another enemy can be generated.
- Enemy level generation retains the archived fractional upper-bound calculation and normalizes the invalid level-1 lower bound to a positive enemy level, while gold and experience retain their archived `toFixed(0)` rounding rules. These numeric boundaries have deterministic fixtures; broader balance acceptance remains open.
- Defeat writes a versioned local personal-record envelope and changes the screen to `game-over` after the enemy turn resolves.

## Active store behavior

- The store is reachable while an active combat is awaiting the player's action.
- Items are one-time purchases and apply their provisional stat bonus immediately. The item remains represented in the player's inventory and is disabled in later store views.
- Potion offers are repeatable while the player can afford them.
- Closing the store returns to the active `combat` encounter.
- Store balance, item timing, health semantics, restocking, selling, and final acceptance remain open in [the provisional store contract](../architecture/rewrite-store.md).

## Legacy observations retained for comparison

- The archived Svelte journey used `welcome`, `champSelect`, `combat`, `store`, and `gameover` views, plus global keyboard handlers.
- The archived combat service used speed to choose the first actor, two-second delayed turns, mutable logs, and delayed defeat callbacks without explicit cancellation.
- The archived game created a level-4 character, generated regular enemies from player-level ranges, consumed Gold Slime bosses in sequence, wrote unversioned top-five records, and grouped defeated-enemy history by image.
- Archived formulas and configuration remain evidence in `legacy/svelte/src/lib/`; the Angular implementation is not assumed to be exact parity until each difference is classified.

## Product gaps to clarify

- Whether the provisional stat and reward values are accepted balance.
- Whether level-4 player initialization should preserve the archived `level × base` stats or retain the current Angular prototype's unscaled base-stat baseline; see [TODO-016](../TODO.md#todo-016-high-resolve-initial-player-stat-parity).
- Whether item bonuses should change maximum/current health and every combat formula.
- Whether the store should restock, persist purchases across runs, or become a progression system.
- Whether all historical sprite sheets and animation sources should be mapped into gameplay or explicitly deferred.
- Whether personal records remain local-only or migrate from the legacy storage key/account-backed data.
- Whether legacy shortcut keys should become an intentional accessibility/product contract.
