# ADR-0009: Keep relic tuning data and descriptions in one catalog

## Status

Accepted — 2026-10-11.

## Decision

`src/app/domain/relics.ts` is the source of truth for the 30 relics' names, quality, prices, icons,
tunable parameters, and player-facing descriptions. Combat, progression, route, and store rules read
effect values from the catalog instead of keeping duplicate numbers in helper modules. Descriptions
are generated from the same parameters used by the rules.

## Context

The earlier effect data did not consistently match runtime behavior. A relic could advertise one
trigger or amount while the implementation read a different hard-coded value.

## Consequences

- Balance edits should change the catalog parameter first and verify generated copy and behavior.
- The reference list is a human-readable mirror of the catalog, not an independent behavior source.
- Unit coverage must exercise every relic and include its defining edge conditions.
- Prices and effects remain provisional balance choices.
