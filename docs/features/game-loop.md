# Gameplay Loop and Characterization Boundary

**Status:** The legacy behavior and active Angular behavior are recorded separately. The Angular rules remain provisional until product balance and persistence decisions are accepted.

## Active Angular journey

The root Angular application uses these screens:

1. `welcome` displays the entry point, an always-visible “How to play” field manual with shared stat chips, local personal records, and persistent audio controls.
2. `character-select` accepts a trimmed name of 3–14 characters, renders Wizard, Samurai, and Warrior idle art, presents the character modifier vocabulary through reusable icon-and-color stat chips, and starts a level-4 player.
3. `combat` begins immediately after character selection with a generated enemy. It displays both combatants' icon-only stat chips, idle/attack/hit/defeat art where an asset is characterized, color-coded health meters, the hero's experience progress, a live Pokémon-style battle callout, actions, and power-up choices. The detailed player/enemy combat logs remain internal state and are not rendered in the player-facing screen.
4. `map` presents three generated route branches after victory: a regular battle, an elite battle, a merchant, a campfire, or a combination of those choices. Selecting a battle begins the next encounter; selecting a merchant opens the store; selecting a campfire restores 25% of damage received and presents the next branch.
5. `store` is reachable only from a merchant route node. It displays repeatable potion offers and one-time passive relic offers. Owned relics and their effects remain visible in combat; closing the store returns to the route map.
6. `game-over` displays the defeat message, grouped defeated-enemy history, local personal records, and a new-run action.

The active UI relies on native buttons, inputs, and range controls. Legacy global keyboard shortcuts (`Space`, `P`, `A`, `S`, `D`, and power-up number keys) are not part of the current Angular contract; keyboard operation is currently characterized through native activation and browser journeys.

## Active combat sequencing

- `findEnemy` generates a regular enemy from the observed level range or the next Gold Slime boss at levels 10, 20, and 30.
- The active service compares player and enemy speed. The faster actor opens the encounter; enemy turns are scheduler-backed with a 1.1-second announce-to-resolution pause and a 0.9-second result hold before the next player action is enabled. Player damage persists when the route advances.
- Player Attack and Magic use bounded random ranges, lower miss rates, critical multipliers, and meaningful resistance reduction. Attack uses 85–115% power, 5% miss, and 1.5× criticals; Magic uses 75–125% power, 10% miss, and 1.75× criticals. Resistance uses `100 / (100 + resistance)`. Potion use restores 25% of maximum health, then gives the enemy a turn.
- Enemy actions use the observed attack/magic/heal policy. Damage actions select their typed attack or Magic animation; healing restores the enemy without presenting an attack strip. A non-miss enemy damage result selects the typed player hit-reaction strip when the chosen character has one; a non-miss player damage result selects the typed enemy hit-reaction strip when the enemy has one. Misses and unsupported mappings fall back to idle presentation. The pure combat transition rejects malformed player damage results before updating enemy damage or entering a terminal phase. The provisional animation reset is scheduler-backed through the injected `Clock` port.
- Combat feedback is presented through one atomic live callout that summarizes the latest action, with contextual Lucide icons for attacks, magic, healing, enemy turns, and victory. The player-facing screen hides the full combat log and keeps action selection grouped under an explicit turn indicator.
- Route choices are deterministic under the injected random source. Elite nodes strengthen the generated enemy's stats and gold by a provisional 30% and 50%; this is a pacing/progression prototype, not final balance. Campfires restore 30% of maximum health.
- Reset cancels pending delayed enemy work and guards stale callbacks with a run-generation token.
- Victory applies provisional experience, gold, level, boss, power-up, and defeated-enemy-history updates. Pending power-ups must be chosen before another enemy can be generated.
- Enemy levels use a tighter regular range from `floor(playerLevel / 2)` through `playerLevel + 1`; gold and experience retain their archived `toFixed(0)` rounding rules. These numeric boundaries have deterministic fixtures; broader balance acceptance remains open.
- Defeat writes a versioned local personal-record envelope and changes the screen to `game-over` after the enemy turn resolves.

## Active store behavior

- The store is reachable only through a merchant node on the route map, never as an in-combat navigation action.
- Relics are one-time purchases with typed passive effects. They remain represented in the player's inventory and are disabled in later store views; they never mutate the player's raw stats.
- Potion offers are repeatable while the player can afford them.
- Closing the store returns to the active `map` route.
- Store rotation, relic pricing, selling, and final balance remain open in [the relic shop contract](../architecture/rewrite-store.md).

## Legacy observations retained for comparison

- The archived Svelte journey used `welcome`, `champSelect`, `combat`, `store`, and `gameover` views, plus global keyboard handlers.
- The archived combat service used speed to choose the first actor, two-second delayed turns, mutable logs, and delayed defeat callbacks without explicit cancellation.
- The archived game created a level-4 character, generated regular enemies from player-level ranges, consumed Gold Slime bosses in sequence, wrote unversioned top-five records, and grouped defeated-enemy history by image.
- Archived formulas and configuration remain evidence in `legacy/svelte/src/lib/`; the Angular implementation is not assumed to be exact parity until each difference is classified.

## Product gaps to clarify

- Whether the prototype stat, relic, and reward values are accepted balance.
- Whether the accepted level-4 `level × base` initialization needs further combat and reward tuning; see [ADR-0002](../adr/0002-level-4-player-initialization.md).
- Whether the merchant should rotate a limited set of relic offers and gain rarity tiers.
- Whether all historical sprite sheets and animation sources should be mapped into gameplay or explicitly deferred.
- Whether personal records remain local-only or migrate from the legacy storage key/account-backed data.
- Whether legacy shortcut keys should become an intentional accessibility/product contract.
