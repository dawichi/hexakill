# ADR-0002: Scale level-4 player initialization

## Status

Accepted — 2026-08-17

## Decision

New runs initialize the selected player at level 4 and set every stat to `4 × BASE_STATS[stat]`.

The resulting baseline is:

```txt
health 800 · attack 64 · magic 80 · armor 48 · magic resist 48 · speed 16
```

Character modifiers remain part of the level-up progression rule and are not applied a second time during initial construction.

## Context

The Angular application displayed level 4 while storing the unscaled base row (`200 / 16 / 20 / 12 / 12 / 4`). Regular enemies were generated from the player level and therefore commonly entered the first encounter with substantially higher stats than the hero. This made the opening combat unfair and diverged from the previous character constructor, which initialized each stat as `level × base`.

## Consequences

- The displayed level and initial combat stats are consistent.
- The level-4 opening balance is restored as a compatibility baseline.
- Existing opening combat, store, and progression fixtures must be reviewed as balance work continues.
- Existing runs created with the previous prototype baseline are not migrated; the new values apply when starting a new run.
