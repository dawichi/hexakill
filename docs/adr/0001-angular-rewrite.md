# ADR-0001: Use Angular for the application

## Status

Accepted — 2026-08-15

## Context

Hexakill needed a clearer application boundary around state, domain rules, timers, audio,
persistence, and presentation. The product is a continuously interactive client-side game rather
than a mostly static content site. The implementation also needed explicit state transitions,
testable rules, and a strong accessibility baseline.

## Decision

Hexakill uses Angular 21 as its application framework. The application uses standalone components,
strict TypeScript and template checking, signals for application state, Vitest for unit/component
tests, and Playwright for critical browser journeys.

Gameplay rules remain outside Angular components. Framework-specific code belongs in presentation and
application adapters; combat, progression, store, relic, and persistence contracts remain
independently testable.

## Consequences

- The repository has one supported application and one dependency graph.
- Angular conventions, dependency injection, signals, and testing tools provide a stable structure for feature work.
- The project accepts Angular's framework and runtime learning cost.
- Angular does not resolve domain-rule ambiguity, balance, persistence scope, asset licensing, or deployment decisions by itself.

## Follow-up

- Characterize gameplay before claiming behavioral parity with earlier versions.
- Keep domain rules framework-independent.
- Record deployment, persistence, and other durable product decisions in separate ADRs.
