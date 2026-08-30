# Current Architecture

**Status:** Current active Angular implementation, reviewed 2026-08-24.

## Executive summary

Hexakill is a single-route, browser-only Angular game. The root application renders all game screens from one standalone shell, while framework-independent domain modules own combat, progression, route, store, relic, asset, and persistence-validation rules. `GameSessionService` is the application façade for signals, command sequencing, timers, audio, and browser-storage ports. There is no server route, API, database, account system, queue, or authenticated boundary. Runs contain a persisted connected 30-room expedition graph with fixed boss rooms at 10, 20, and 30; room 30 produces a successful `run-complete` state.

## Application organization

```text
src/
├── main.ts                         Angular bootstrap
└── app/
    ├── app.ts / app.html / app.css  root shell and screen composition
    ├── components/                  reusable presentational primitives
    │   ├── relic-icon/
    │   └── stat-chip/
    ├── application/                session orchestration and browser ports
    │   ├── game-session.service.ts  signals, commands, persistence hydration
    │   └── *-storage.ts / audio.ts  storage, audio, clock, and randomness ports
    └── domain/                      framework-independent rules and data
        ├── combat-*.ts              actions, state transitions, damage rules
        ├── characters.ts / enemies.ts / game-types.ts
        ├── progression.ts / route-map.ts / store.ts / relic-*.ts
        └── assets.ts / records.ts / preferences.ts
```

The dependency direction is healthy: domain modules do not import Angular; the application layer
depends on domain rules and injected ports; the root component depends on the application façade
and presentational primitives. The main organizational limitation is feature concentration: all
screens remain in `app.html`, global styling remains in `app.css`, and `GameSessionService` combines
lifecycle coordination, view-model projections, persistence validation, combat sequencing, store
commands, audio, and records. This is maintainable for the current vertical slice but should be
split by feature before another substantial UI expansion.

Recommended next boundary, without changing behavior: move persistence envelope validation into a
pure application module, then extract screen components for welcome, character selection, route map,
combat, store, and game-over. Keep `GameSessionService` as the short-lived application coordinator
until those components have characterization coverage.

## Runtime and entry points

The active root uses `src/main.ts`, a standalone Angular root component, reusable
`StatChipComponent` and `RelicIconComponent`, and `GameSessionService`. The app has one route and
restores a validated in-progress session from `hexakill.angular.session.v1` when one exists; URL-level
phase routing is not implemented.

The root manifest is the only supported dependency graph. It pins Angular 21, TypeScript, Vitest,
Playwright, Biome, and the Node.js/npm baseline documented in [operations](../operations.md).

## Source boundaries

| Area | Current responsibility | Main paths |
| --- | --- | --- |
| Shell | Bootstrap and screen composition | `src/main.ts`, `src/app/app.ts`, `src/app/app.html` |
| Components | Reusable stat and relic presentation primitives | `src/app/components/` |
| Application | Session orchestration, ports, hydration, timers, audio | `src/app/application/` |
| Domain | Combat, progression, route, store, relic, assets, records, preferences | `src/app/domain/` |
| Assets | Character/enemy art, spritesheets, music, sound effects | `static/` |
| Browser journeys | Critical user flows and production-artifact checks | `e2e/` |

## State and persistence

`GameSessionService` owns the live session and coordinates screen transitions, combat actions,
route choices, store offers, relics, rewards, records, audio, and reset behavior.

Browser storage uses versioned envelopes:

- `hexakill.angular.session.v1` for an in-progress run.
- `hexakill.angular.records.v1` for validated local personal records.
- `hexakill.angular.preferences.v1` for validated audio preferences.

All restored data is structurally validated before hydration. Transient combat actions, malformed
damage results, incoherent phases, unsafe counters, duplicate inventory, invalid milestone maps,
and non-positive restored health are rejected. The app does not automatically migrate data from
earlier unversioned browser keys; that policy remains an explicit product decision.

## Integrations and trust boundaries

The game uses browser APIs and bundled static assets only. User-entered names, keyboard events,
local-storage contents, and asset availability are runtime-controlled inputs. There are no
identified secrets or protected operations in the current source.

The root build produces `dist/hexakill/browser/` for static hosting. Deployment, security headers,
asset caching, preview behavior, and release verification are documented in
[the deployment contract](rewrite-deployment.md) and [operations](../operations.md).

## Material current-state risks

- `GameSessionService` remains a large façade and should be split before substantial UI expansion.
- Final combat balance, relic pricing, enemy intent pacing, and progression curves remain under manual review.
- The full-run simulator measures completion as defeating all three fixed-room bosses by room 30; the current baseline still needs balance tuning to make that outcome reliably attainable.
- Persistence migration from earlier browser keys is not implemented.
- Asset provenance/licensing and the disposition of deferred sprite sources remain unresolved.
- Manual accessibility and assistive-technology review is still incomplete.

These are active product and engineering follow-ups, not evidence of a second implementation that
needs to be maintained.
