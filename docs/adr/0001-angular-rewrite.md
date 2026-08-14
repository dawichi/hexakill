# ADR-0001: Use Angular for the Hexakill rewrite

- **Status:** Accepted
- **Date:** 2026-08-13
- **Decision owner:** Project owner
- **Scope:** Active Angular application at the repository root

## Context

Hexakill's current implementation is an unfinished SvelteKit browser game with state, domain rules, timers, audio, persistence, and presentation logic coupled across mutable stores, models, services, and components. The project needs a future rewrite with explicit feature boundaries, typed state transitions, testable domain rules, and a strong accessibility baseline.

Astro was evaluated and rejected as the primary game framework because the core product is a continuously interactive client-side application rather than a mostly static content site. Modern SvelteKit was the lowest-risk migration path, but the project owner chose Angular as the long-term application framework for the rewrite.

## Decision

The Hexakill rewrite MUST use Angular as its application framework. The application is pinned to Angular 21 because it is compatible with the machine's Node.js 24.19.0 toolchain. It adopts Angular standalone components, strict TypeScript/template checking, signals for local/application state, Vitest for unit/component tests, and Playwright for critical browser journeys.

The decision applies only to the rewrite. The existing SvelteKit application remains a historical reference and is not being converted in place.

The future rewrite SHOULD follow the shared Angular application profile and MUST keep gameplay rules outside Angular components. Framework-specific code belongs in presentation/application adapters; combat, progression, store, and persistence contracts should remain independently testable.

## Consequences

### Positive

- The rewrite has an accepted framework direction and can progress without further framework comparison work.
- Angular's application conventions, dependency injection, signals, routing, and testing tools provide a clear structure for feature-oriented development.
- The Angular application was first validated in isolation, then promoted to the root without using the archived Svelte dependency graph.

### Costs and risks

- The project accepts a full UI migration and Angular learning/runtime cost.
- Existing Svelte components and CSS cannot be copied mechanically; behavior and accessibility contracts must be reimplemented deliberately.
- Angular does not resolve domain-rule ambiguity, store incompleteness, persistence safety, asset licensing, or deployment uncertainty by itself.

## Alternatives considered

- **Modern SvelteKit:** Lowest-risk technical migration, rejected as the long-term direction by project-owner choice.
- **Astro:** Suitable for a static shell or marketing surface, rejected for the interactive game core.
- **In-place Svelte repair:** Rejected as the primary plan because the project needs a clearer rewrite boundary and the current implementation is unfinished and untested.

## Follow-up

- Keep the archived Svelte source under `legacy/svelte/` as a read-only behavior reference while the root Angular app grows.
- Characterize current gameplay before claiming behavioral parity.
- Decide deployment output/hosting separately; this ADR does not select a hosting platform.
- Review the provisional store/progression contract and add a durable ADR before production migration.
