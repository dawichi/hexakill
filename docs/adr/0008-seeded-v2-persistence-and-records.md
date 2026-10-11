# ADR-0008: Persist reproducible v2 runs and rank completed records first

## Status

Accepted — 2026-10-11. Supersedes the route-snapshot detail in ADR-0005.

## Decision

New run saves use the version 2 `RunState` envelope. A run contains a 32-bit seed and RNG cursor;
the connected route graph is reconstructed from the seed and visited path. Combat state and offers
are persisted, while animation, presentation queues, and timers are not. Domain actions resolve
synchronously and the resulting state is saved before their event sequence is presented.

An in-progress save under the version 1 Angular key is discarded rather than migrated. The new
envelope is validated before it is restored. Records and preferences keep separate readers for
their prior envelopes.

Ordinary and daily records use separate lists. A win ranks above a loss; within the same result,
more rooms cleared ranks first, then higher level. Daily challenge seeds derive from the UTC date.

## Context

The prior save shape had transient combat phases and duplicated route data. Reloading could discard
a run or restore a state that allowed combat randomness to be rerolled. Level-only record ordering
also did not reflect run progress or completion.

## Consequences

- The seed reproduces the route and the persisted cursor continues the same random sequence.
- Reload during event playback cannot change a committed combat outcome.
- Old active v1 runs are intentionally lost; legacy records and preferences use their own migration
  behavior.
- Records remain browser-local and are not a remote leaderboard.
- The v2 browser keys and validation boundary are documented in
  [the architecture overview](../ARCHITECTURE.md).
