# Hexakill Project Documentation

This directory is the local operating manual for Hexakill and future AI developer agents. It documents the existing SvelteKit implementation while defining a reviewable path toward a future rewrite.

## Start here

-   [AGENTS.md](AGENTS.md) — canonical agent instructions, source-of-truth map, safe boundaries, and validation commands.
-   [project-standards.yml](project-standards.yml) — pinned standards contract and compliance summary.
-   [TODO.md](TODO.md) — prioritized remediation and rewrite-preparation backlog.
-   [handoff.md](handoff.md) — current prototype scope, validated assumptions, unresolved decisions, and next session.

## Current system

-   [Current architecture](architecture/current-state.md) — verified runtime, source boundaries, state, persistence, integrations, and risks.
-   [Gameplay loop](features/game-loop.md) — current user journey and implemented game rules, with known inconsistencies called out.
-   [Operations](operations.md) — setup, commands, build/deployment evidence, and troubleshooting.
-   [Asset inventory](assets.md) — retained assets, current prototype usage, and migration rules.
-   [Standards assessment](standards-assessment.md) — rule-level evidence and compliance states.

## Future rewrite

-   [Framework evaluation](architecture/rewrite-evaluation.md) — Astro, Angular, and modern SvelteKit comparison for this game.
-   [Target architecture proposal](architecture/rewrite-target.md) — proposed domain/application/UI boundaries and staged migration plan.
-   [ADR index](adr/README.md) — durable decisions and decision candidates.

## Documentation rules

Current implementation facts belong in current-state and workflow documents. Proposed architecture is explicitly labeled as proposed. Durable decisions belong in ADRs. Temporary investigations and individual tasks belong in [TODO.md](TODO.md) only until they are resolved or promoted to a durable document.
