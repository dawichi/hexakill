# Architecture Decision Records

ADRs record durable, accepted project decisions. Older decisions remain linked when later ones
supersede them.

## Framework and runtime

- [ADR-0001: Use Angular for the Hexakill rewrite](0001-angular-rewrite.md)
- [ADR-0008: Persist reproducible v2 runs and rank completed records first](0008-seeded-v2-persistence-and-records.md)
- [ADR-0005: Use a connected expedition graph for route choices](0005-connected-expedition-route.md) — route decisions remain active; storage is now derived from the seed.

## Game design

- [ADR-0002: Scale level-4 player initialization](0002-level-4-player-initialization.md) — historical decision, superseded by ADR-0006.
- [ADR-0003: Use persistent health and passive relics for run balance](0003-combat-and-relic-balance.md)
- [ADR-0004: Use fixed milestone rooms for run completion](0004-fixed-room-run.md) — milestone structure remains active; identities and current levels are superseded by ADR-0007.
- [ADR-0006: Give each character a distinct starting profile and passive](0006-distinct-character-starts-and-passives.md)
- [ADR-0007: Give milestone bosses distinct identities and move patterns](0007-distinct-milestone-bosses.md)
- [ADR-0009: Keep relic tuning data and descriptions in one catalog](0009-catalog-driven-relic-effects.md)
- [ADR-0010: Offer power-ups for all six combat stats](0010-six-stat-power-up-choices.md)

Asset provenance, manual accessibility acceptance, final balance, and remote deployment remain
open; they are not silently decided by these ADRs.
