# ADR-0005: Use a connected expedition graph for route choices

## Status

Accepted — 2026-08-30

## Decision

Runs use a deterministic, persisted 30-room expedition graph. Ordinary rooms expose the reachable
nodes from the current frontier; choosing a node advances the frontier through that node's
successor edges. The graph uses three readable lanes that can preserve, split, or merge between
rooms. Rooms 10, 20, and 30 remain fixed single-node Gold Slime milestones, and room 30 remains
the end of the run.

The route screen presents the current frontier as a cinematic fork and previews up to the next
three reachable layers. A path card may show its room type, risk, reward, and a privacy-safe
forecast of the next layer. Hidden nodes remain unknown until entered or revealed by Traveler's
Compass; hidden content is not exposed through the forecast.

New sessions persist the full graph and the next frontier so combat, stores, reloads, and campfires
do not regenerate disconnected doors. Older v1 snapshots without graph layers remain restorable
through the legacy three-node compatibility shape and receive a connected graph when the next
frontier is generated.

The full-run simulator traverses the same successor graph as the live session. Route policies may
choose among the currently revealed frontier nodes, while future route intelligence remains a
future policy/balance improvement.

## Context

The previous route screen displayed three independent room lotteries. The selected door had no
effect on future choices, so the screen looked like a map without giving the player meaningful
route planning. The fixed milestone decision in [ADR-0004](0004-fixed-room-run.md) provides useful
landmarks, but it does not by itself create path identity or forward consequences.

## Consequences

- Players can understand the current fork and see several rooms ahead before committing.
- Route choices now have persistent identity and can converge on the fixed boss landmarks.
- The route state is larger because it stores the full 30-room graph and a pending next frontier.
- Hidden-node privacy must be preserved in both the UI and any route policy that models player
  knowledge.
- New route events can be added as node kinds without replacing the graph model.
- Balance reports must use graph traversal; independent per-room route rolls are no longer a valid
  model of the live run.
