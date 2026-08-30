# ADR-0004: Use fixed milestone rooms for run completion

## Status

Accepted — 2026-08-30

## Decision

Each run contains 30 rooms. Gold Slime bosses appear at fixed milestones:

- Room 10: Gold Slime 1
- Room 20: Gold Slime 2
- Room 30: Gold Slime 3 and run completion

The provisional boss levels are 8, 12, and 16 in that order. Boss stats use a moderated linear
multiplier curve, giving the fixed encounters an escalating but room-appropriate difficulty curve.
Regular rooms never invoke the boss schedule, even when the player reaches level 10 or higher.

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
