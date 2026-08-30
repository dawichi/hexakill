# Architecture Decision Records

ADRs record durable, accepted project decisions. Accepted ADRs are not silently rewritten; a later decision supersedes the earlier record. Recommendations and unresolved framework comparisons belong in `docs/architecture/` until accepted.

## Records

- [ADR-0001: Use Angular for the Hexakill rewrite](0001-angular-rewrite.md) — accepted framework direction for the active root Angular application.
- [ADR-0002: Scale level-4 player initialization](0002-level-4-player-initialization.md) — accepted opening-stat rule for new runs.
- [ADR-0003: Use persistent health and passive relics for run balance](0003-combat-and-relic-balance.md) — accepted prototype combat and merchant contract.
- [ADR-0004: Use fixed milestone rooms for run completion](0004-fixed-room-run.md) — accepted 30-room structure with bosses at rooms 10, 20, and 30.

## Candidates for the next ADRs

- Rendering/deployment mode in [rewrite-deployment.md](../architecture/rewrite-deployment.md).
- Static deployment contract and hosting provider; the current proposal is [rewrite-deployment.md](../architecture/rewrite-deployment.md).
- Rewrite boundary and domain-state-machine contract after characterization tests.
- Local persistence schema/versioning and whether records remain browser-local.
