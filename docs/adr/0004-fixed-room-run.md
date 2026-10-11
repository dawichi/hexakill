# ADR-0004: Use fixed milestone rooms for run completion

## Status

Accepted — fixed room milestones remain active; boss identities and levels are superseded by [ADR-0007](0007-distinct-milestone-bosses.md) — 2026-10-11

## Decision

Each run contains 30 rooms. A guardian appears at each fixed milestone:

- Room 10: Fire Knight
- Room 20: Water Priestess
- Room 30: Bringer of Death and run completion

The current boss levels are 9, 16, and 22 in that order. These values are balance inputs, not a
compatibility promise. Regular rooms never invoke the boss schedule, even when the player reaches
level 10 or higher.

Milestone rooms show one visible boss door instead of the normal three route choices. Defeating
the room-30 boss enters the `run-complete` screen and the run-progress indicator reaches 30 of 30.

## Context

The previous prototype spawned bosses when the player reached level 10, which made the end of a run
dependent on progression, route policy, and balance. The full-run simulator consequently measured
completion as defeating three bosses but had no clear fixed endpoint for players to understand.

## Consequences

- Players always understand where the first two milestones and the final room are.
- The UI can show deterministic room progress and a clear completion boundary.
- Boss difficulty and player progression must be tuned for the fixed rooms rather than relying on a
  level threshold to delay boss encounters.
- The simulator and browser journeys can reproduce the same 30-room structure.
