# Proposed Rewrite Architecture

**Status:** Proposed design, not current implementation and not an accepted framework decision.

## Design goals

-   Preserve intentional gameplay rules and assets while making them reviewable and testable.
-   Make invalid state transitions difficult to represent.
-   Keep random outcomes, clocks, audio, persistence, and browser APIs behind explicit adapters.
-   Allow the rules engine to run in unit tests without Svelte, Angular, a browser, timers, or local storage.
-   Make the store a first-class feature with an explicit product contract.
-   Make accessibility and critical journeys testable at the rendered UI boundary.
-   Leave room for a future backend without pretending that accounts or network play are requirements today.

## Proposed boundaries

```text
Angular UI framework
        |
presentation adapters and view models
        |
application session coordinator / command handling
        |
pure game domain (rules, entities, progression, store, run state)
        |
ports: random source, clock, audio, persistence, asset manifest
        |
browser adapters and optional future backend adapters
```

### Domain

Own immutable or controlled state transitions such as `startRun`, `chooseCharacter`, `spawnEnemy`, `chooseAction`, `resolveTurn`, `buyItem`, `buyPotion`, `allocatePowerUp`, `recordDefeat`, `endRun`, and `resetRun`. Use explicit result types for success, invalid command, and terminal states. Keep balancing data separate from algorithms and validate configuration at load time.

### Application

Own the run/session lifecycle and command sequencing. It should decide when a turn is pending, resolved, cancelled, or terminal. It should not know whether the UI is Svelte or Angular. Delays should be injected through a clock/scheduler port so tests can advance time deterministically.

### Presentation

Render view models and dispatch commands. Components should not mutate domain objects or reach directly into local storage. Keyboard controls, focus management, dialogs, responsive layout, audio controls, and animations belong at this boundary.

### Infrastructure adapters

-   `RandomSource` for seeded/random outcomes.
-   `Clock` or `Scheduler` for delayed combat transitions and run timers.
-   `AudioPlayer` for music/effects with browser lifecycle ownership.
-   `RunStorage` for versioned, validated local persistence.
-   `AssetManifest` for character/enemy/item media paths and metadata.
-   Optional future `RemoteRecords` or account adapters only after a product decision.

## Proposed state model

Replace the current mutable `GameDTO` class graph with explicit serializable state. A possible shape is:

-   `screen`: `welcome | character-select | combat-ready | combat-resolving | store | power-up | game-over`.
-   `run`: player, enemy, inventory, progression, shop, logs, defeated-enemy history.
-   `interaction`: selected action, pending command, scheduler token, focus target.
-   `preferences`: music/effects volume.
-   `persistence`: version, last-save status, migration result.

This is a design direction, not a claim about required field names. The exact model should be derived from characterization tests and accepted product rules.

## Proposed rewrite slices

1. Preserve and test the current pure-ish calculations with explicit fixtures, including known edge cases and intended versus accidental behavior.
2. Define the run and store contracts; decide whether item bonuses alter combat stats and how shop restocking works.
3. Implement the domain state machine with injected randomness and time.
4. Add versioned local-storage persistence with invalid-data recovery.
5. Build the welcome/character-select/combat-ready/combat vertical slice in Angular. The current prototype covers this slice with typed enemy generation and first actions.
6. Add victory rewards, progression, store, power-ups, game-over, audio playback, and complete asset mapping as separate slices; the prototype already contains provisional enemy turns and player defeat transitions.
7. Add application transition tests, browser critical-journey tests, accessibility checks, production build validation, and deployment configuration.
8. Retire the legacy Svelte implementation only after behavior and assets have an explicit migration/replacement record.

## Non-goals for the first rewrite slice

The first slice should not add multiplayer, accounts, payments, analytics, server persistence, a CMS, or a generalized design system. Those are product decisions, not automatic consequences of changing frameworks.
