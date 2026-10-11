# ADR-0005: Use a connected expedition graph for route choices

## Status

Accepted — connected route decisions remain active. Graph persistence details are superseded by
[ADR-0008](0008-seeded-v2-persistence-and-records.md) — 2026-10-11.

## Decision

Runs use a deterministic 30-room expedition graph. Ordinary rooms expose nodes reachable from the
current frontier; choosing a node advances through successor edges. The graph uses three readable
lanes that can preserve, split, or merge between rooms. Rooms 10, 20, and 30 remain fixed
single-node guardian milestones, and room 30 ends the run.

The route screen presents the current frontier and previews up to three reachable layers. Path cards
show room type, risk, reward, and a privacy-safe forecast. Hidden nodes stay unknown until entered
or revealed by Traveler's Compass.

The graph is derived from the run seed. Saves retain the visited path instead of a duplicate copy of
the generated graph. The full-run simulator traverses the same graph as the live session.

## Context

The previous route screen displayed three independent room lotteries. The selected door had no
effect on future choices, so the screen looked like a map without giving the player meaningful route
planning. Fixed milestone rooms provide landmarks; a connected graph adds path identity and forward
consequences.

## Consequences

- Players can plan from the current fork and the visible horizon.
- Route choices have persistent identity and converge on the fixed boss landmarks.
- The graph is reproducible from the seed, reducing stored state.
- Hidden-node privacy must be preserved in the UI and route policies.
- Balance reports must use graph traversal; independent per-room route rolls do not model the live
  run.
