# Hexakill Project Documentation

This directory is the local operating manual for Hexakill and future AI developer agents. It documents the archived SvelteKit implementation, the active Angular root, and the remaining reviewable path toward production readiness.

## Start here

- [AGENTS.md](AGENTS.md) — canonical agent instructions, source-of-truth map, safe boundaries, and validation commands.
- [project-standards.yml](project-standards.yml) — pinned standards contract and compliance summary.
- [TODO.md](TODO.md) — prioritized remediation and rewrite-preparation backlog.
- [handoff.md](handoff.md) — current Angular scope, validated assumptions, unresolved decisions, and next session.

## Current system

- [Current architecture](architecture/current-state.md) — verified runtime, source boundaries, state, persistence, integrations, and risks.
- [Gameplay loop](features/game-loop.md) — current user journey and implemented game rules, with known inconsistencies called out.
- [Operations](operations.md) — setup, commands, build/deployment evidence, and troubleshooting.
- [Dependency inventory](dependencies.md) — active Angular graph, archived Svelte graph, and install trust policy.
- [Deployment contract](architecture/rewrite-deployment.md) — proposed static output, hosting requirements, and release gate.
- [Angular persistence contract](architecture/rewrite-persistence.md) — observed records behavior, active versioned keys, and migration unknowns.
- [Asset inventory](assets.md) — retained assets, active Angular usage, and migration rules.
- [Deferred sprite-source catalog](assets-sprite-sources.md) — exact retained sprite/sheet files awaiting frame and provenance mapping.
- [Asset provenance register](assets-provenance.md) — evidence, unknown ownership/licensing, and release requirements.
- [Accessibility review](accessibility-review.md) — automated/static evidence and the remaining manual review matrix.
- [Standards assessment](standards-assessment.md) — rule-level evidence and compliance states.

## Future rewrite

- [Framework evaluation](architecture/rewrite-evaluation.md) — Astro, Angular, and modern SvelteKit comparison for this game.
- [Target architecture proposal](architecture/rewrite-target.md) — proposed domain/application/UI boundaries and staged migration plan.
- [Provisional store contract](architecture/rewrite-store.md) — observed legacy offers and the current rewrite behavior awaiting product acceptance.
- [ADR index](adr/README.md) — durable decisions and decision candidates.

## Documentation rules

Current implementation facts belong in current-state and workflow documents. Proposed architecture is explicitly labeled as proposed. Durable decisions belong in ADRs. Temporary investigations and individual tasks belong in [TODO.md](TODO.md) only until they are resolved or promoted to a durable document.
