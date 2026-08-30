# Gameplay Loop and Characterization Boundary

**Status:** The compatibility baseline and active Angular behavior are recorded together. Gameplay rules remain provisional until product balance and persistence decisions are accepted.

## Active Angular journey

The root Angular application uses these screens:

1. `welcome` displays the entry point, an always-visible “How to play” field manual with shared stat chips, local personal records, and persistent audio controls.
2. `character-select` accepts a trimmed name of 3–14 characters, renders Wizard, Samurai, and Warrior idle art, presents the character modifier vocabulary through reusable icon-and-color stat chips, and starts a level-4 player.
3. `combat` begins immediately after character selection with a generated enemy. It displays both combatants' icon-only stat chips, idle/attack/hit/defeat art where an asset is characterized, color-coded health meters with delayed-damage trails, the player's experience progress, a live Pokémon-style battle callout, visible enemy intent, actions, and power-up choices. The detailed player/enemy combat logs remain internal state and are not rendered in the player-facing screen.
4. `map` presents three generated route branches after victory: a regular battle, an elite battle, a merchant, a campfire, or a combination of those choices. Rooms 10, 20, and 30 instead present one fixed Gold Slime boss door; room 30 is the fixed end of the run. Selecting a battle begins the next encounter; selecting a merchant opens the store; selecting a campfire restores 30% of maximum health, capped at missing health, and presents the next branch.
5. `store` is reachable only from a merchant route node. It displays repeatable potion offers and one-time passive relic offers. Owned relics and their effects remain visible in combat; closing the store returns to the route map.
6. `game-over` displays the defeat message, grouped defeated-enemy history, local personal records, and a new-run action. `run-complete` displays the successful room-30 completion state and a return-home action.

The active UI relies on native buttons, inputs, and range controls. Legacy global keyboard shortcuts (`Space`, `P`, `A`, `S`, `D`, and power-up number keys) are not part of the current Angular contract; keyboard operation is currently characterized through native activation and browser journeys.

## Active combat sequencing

- `findEnemy` generates a regular enemy from the observed level range, caps elite encounters at the current player level, or generates the fixed Gold Slime boss for rooms 10, 20, and 30.
- The active service compares player and enemy speed. The faster actor opens the encounter; player actions show a 320 ms action window, the enemy gets a 650 ms announce pause followed by a 360 ms resolution window, and the result remains presented for 700 ms before the next player action is enabled. Player damage persists when the route advances.
- Player Attack and Magic use bounded random ranges, lower miss rates, critical multipliers, and meaningful resistance reduction. Attack uses 85–115% power, 5% miss, and 1.5× criticals; Magic uses 75–125% power, 10% miss, and 1.75× criticals. Resistance uses `100 / (100 + resistance)`. Potion use restores 25% of maximum health, then gives the enemy a turn. Guard grants temporary Block based on Armor and Magic Resist.
- The enemy reveals an intent before each turn: Attack, Magic, Guard, or Heal. Patterned intent selection creates deliberate Guard and low-health Heal opportunities while damage intents expose their expected ranges. Magic applies an Arcane mark to the enemy; the next player Attack consumes the mark for bonus damage. Relic passives can amplify these interactions.
- Damage actions select their typed attack or Magic animation; healing and Guard remain visually idle. A non-miss enemy damage result selects the typed player hit-reaction strip when the chosen character has one; a non-miss player damage result selects the typed enemy hit-reaction strip when the enemy has one. Misses and unsupported mappings fall back to idle presentation. Health meters drop with a short current-health transition and retain a gray delayed-damage trail until the turn presentation settles. The pure combat transition rejects malformed player damage results before updating enemy damage or entering a terminal phase. The provisional animation reset is scheduler-backed through the injected `Clock` port.
- Combat feedback is presented through one atomic live callout plus contextual floating Lucide feedback for attacks, magic, healing, Guard, Block, misses, critical hits, and damage. The player-facing screen hides the full combat log and keeps action selection grouped under an explicit turn indicator.
- Route choices are deterministic under the injected random source. Elite nodes strengthen the generated enemy's stats and gold by a provisional 15% and 50%; this is a pacing/progression prototype, not final balance. Campfires restore 30% of maximum health.
- Reset cancels pending delayed enemy work and guards stale callbacks with a run-generation token.
- Victory applies provisional experience, gold, level, boss, power-up, and defeated-enemy-history updates. Pending power-ups must be chosen before another enemy can be generated. Defeating the room-30 boss changes the screen to `run-complete`.
- Regular enemy levels use a tighter range from `floor(playerLevel / 2)` through `playerLevel + 1`; elite encounters cap that range at the current player level. Gold and experience retain their archived `toFixed(0)` rounding rules. These numeric boundaries have deterministic fixtures; broader balance acceptance remains open.
- Fixed Gold Slime bosses currently use provisional levels 8, 12, and 16 at rooms 10, 20, and 30, with a moderated linear stat curve; regular rooms never request the boss schedule. The curve is subject to the full-run balance report and manual playtests.
- Defeat writes a versioned local personal-record envelope and changes the screen to `game-over` after the enemy turn resolves.

## Active store behavior

- The store is reachable only through a merchant node on the route map, never as an in-combat navigation action.
- Relics are one-time purchases with typed passive effects. They remain represented in the player's inventory and are disabled in later store views; they never mutate the player's raw stats.
- Potion offers are repeatable while the player can afford them.
- Closing the store returns to the active `map` route.
- Store rotation, relic pricing, selling, and final balance remain open in [the relic shop contract](../architecture/rewrite-store.md). Current relics can also modify Guard breaking, Guard block, and Arcane mark damage; the catalog remains a balance baseline rather than a final pool.

## Compatibility observations retained for comparison

- The previous journey used `welcome`, `champSelect`, `combat`, `store`, and `gameover` phases, plus global keyboard handlers.
- The previous combat service used speed to choose the first actor, delayed turns, mutable logs, and delayed defeat callbacks without explicit cancellation.
- The previous game created a level-4 character, generated regular enemies from player-level ranges, consumed Gold Slime bosses in sequence, wrote unversioned top-five records, and grouped defeated-enemy history by image.
- Compatibility formulas and configuration remain characterized in the active domain fixtures; the Angular implementation is not assumed to be exact parity until each difference is classified.

## Product gaps to clarify

- Whether the prototype stat, relic, and reward values are accepted balance.
- Whether the accepted level-4 `level × base` initialization needs further combat and reward tuning; see [ADR-0002](../adr/0002-level-4-player-initialization.md).
- Whether the merchant should rotate a limited set of relic offers and gain rarity tiers.
- Whether all historical sprite sheets and animation sources should be mapped into gameplay or explicitly deferred.
- Whether personal records remain local-only or migrate from the legacy storage key/account-backed data.
- Whether legacy shortcut keys should become an intentional accessibility/product contract.
