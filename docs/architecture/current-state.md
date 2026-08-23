# Current Architecture

**Status:** Current active Angular implementation, reviewed 2026-08-23. The former Svelte source is preserved under `legacy/svelte/` as historical evidence.

## Executive summary

Hexakill is a single-route, browser-only Angular game. The root application renders all game screens from one standalone shell, while pure domain modules own combat, progression, route, store, relic, asset, and persistence-validation rules. `GameSessionService` is the application façade for signals, command sequencing, timers, audio, and browser-storage ports. There is no server route, API, database, account system, queue, or authenticated boundary. The former Svelte implementation remains historical evidence under `legacy/svelte/`.

## Active Angular organization

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
    │   ├── audio.ts / clock.ts      injected runtime adapters
    │   └── *-storage.ts / random.ts storage and randomness ports
    └── domain/                      framework-independent rules and data
        ├── combat-*.ts              actions, state transitions, damage rules
        ├── characters.ts / enemies.ts / game-types.ts
        ├── progression.ts / route-map.ts / store.ts / relic-*.ts
        └── assets.ts / records.ts / preferences.ts
```

The dependency direction is healthy: domain modules do not import Angular; the application layer
depends on domain rules and injected ports; the root component depends on the application façade
and presentational primitives. The main organizational limitation is feature concentration: all
six screens remain in `app.html`, global styling remains in `app.css`, and the roughly 1,700-line
session service combines lifecycle coordination, view-model projections, persistence validation,
combat sequencing, store commands, audio, and records. This is maintainable for the current
vertical slice but should be split by feature before another substantial UI expansion.

Recommended next boundary, without changing behavior: move persistence envelope validation into a
pure `application/session-persistence` module, then extract screen components for welcome,
character selection, route map, combat, store, and game-over. Keep `GameSessionService` as the
short-lived application coordinator until those components have characterization coverage.

The repository is an unfinished legacy application, not a clean foundation for incremental feature work. The store, combat, persistence, accessibility, dependency, and validation boundaries need review before a large feature expansion. This document describes what exists; the rewrite proposal is in [rewrite-target.md](rewrite-target.md).

## Runtime and entry points

- `legacy/svelte/src/routes/+layout.svelte` imported global CSS, rendered the title/menu/timer/audio shell, and provided the Svelte slot.
- `legacy/svelte/src/routes/+page.svelte` selected the legacy views based on `$gameData.view`.
- `legacy/svelte/src/app.html` provided the legacy HTML document and CDN resources.
- The active root uses `src/main.ts`, a standalone Angular root component, reusable `StatChipComponent`
  and `RelicIconComponent`, and `GameSessionService`.

The archived Svelte application had one route and no URL-level route model for its game phases; its store initializer began from `welcome` and had no session restoration. The active Angular root also has one route, but restores a validated in-progress session from `hexakill.angular.session.v1` when one exists; URL-level phase routing is not implemented.

## Technology inventory

The checked-out manifest declares Svelte 4.2.8, SvelteKit 2.3.2, Vite 4.5.1, TypeScript 5.3.3, Tailwind CSS 3.4.1, Flowbite/Flowbite-Svelte, Iconify Svelte, Prettier, ESLint, and `svelte-check`. The runtime/dependency state is not reproducible yet: there is no committed lockfile, the supported package script refers to a missing `jsconfig.json`, and the SvelteKit/Vite peer dependency setup is unresolved.

## Source boundaries

| Area          | Current responsibility                                                      | Main paths                          |
| ------------- | --------------------------------------------------------------------------- | ----------------------------------- |
| Views         | Archived screen-level rendering and input handlers                          | `legacy/svelte/src/lib/views/`      |
| Components    | Archived entity, inventory, logger, power-up, layout, audio, and store UI   | `legacy/svelte/src/lib/components/` |
| Models        | Archived mutable entity/item classes and combat statistics                  | `legacy/svelte/src/lib/models/`     |
| Services      | Archived combat, enemy, storage, audio, logs, tooltip, and utility services | `legacy/svelte/src/lib/services/`   |
| Configuration | Archived character, enemy, item, power-up, icon, and styling data           | `legacy/svelte/src/lib/config/`     |
| State         | Archived global session, volume, and modal stores                           | `legacy/svelte/src/lib/data/`       |
| Types         | Archived DTO-like TypeScript types                                          | `legacy/svelte/src/lib/types/`      |
| Assets        | Character/enemy idle art, spritesheets, music, sound effects                | `static/`                           |

The archived boundaries were organizational rather than enforced. Components mutated shared state directly, services updated the global store, models depended on utility services, and `GameDTO` contained class instances. This is why the Angular rewrite uses pure domain modules and application ports.

## State and persistence

The archived `gameData` store contained the legacy view, username, character, enemy, shop, UI flags, logs, power-up history, and defeated-enemy history. `volume` contained music/effects volume. `modalContext` controlled the help dialog. The active Angular session is documented in the rewrite architecture and is owned by `GameSessionService`.

Browser storage is used for:

- `hxkllPersonalRecords` — top five local records written after player defeat in the archived implementation.
- `musicVolume` and `effectsVolume` — volume preferences.

Archived stored JSON was parsed without runtime validation or schema versioning. The active Angular session uses a versioned local envelope with a storage port, active personal records use a separate `hexakill.angular.records.v1` envelope with validation and a records storage port, and audio preferences use `hexakill.angular.preferences.v1` with validated volume values. Legacy-key migration and final schema acceptance remain open; see [the persistence contract](rewrite-persistence.md).

## Integrations and trust boundaries

The archived application had no API or external data integration. It loaded Bootstrap Icons CSS, Animate.css, and the Iconify browser script from CDNs declared in `legacy/svelte/src/app.html`. The active Angular app uses local static assets and browser APIs behind application ports.

The important trust boundary is the browser runtime: user-entered names, keyboard events, local-storage contents, CDN responses, and asset availability are runtime-controlled inputs. There are no identified secrets or protected operations in the current source. The hosting platform, if the README's Vercel URL is still active, owns delivery configuration not present in this repository and must be verified separately.

The README historically advertised an MIT license, but no `LICENSE` file is present in this checkout. Licensing of the repository and bundled media is unresolved and must not be assumed from the badge that was removed during documentation cleanup.

## Material current-state risks

- `legacy/svelte/src/lib/config/enemies.ts` references `presets.easy`, but no `easy` preset is defined.
- `legacy/svelte/src/lib/models/Character.ts` updates inventory totals, but archived combat/stat methods did not clearly apply those totals.
- `legacy/svelte/src/lib/services/combat.service.ts` used mutable global state and delayed callbacks without explicit cancellation.
- `legacy/svelte/src/lib/services/storage.service.ts` trusted arbitrary JSON from local storage.
- Archived power-up, timer, audio, store, tooltip, and modal components had keyboard, teardown, autoplay, and focus-management risks.

These are findings for the rewrite and backlog, not authorization to change current gameplay in this documentation session.

## Historical context

The repository history begins on 2021-10-26, contains an earlier React-era phase, then a SvelteKit project start on 2022-09-28, and ends on `main` at 2024-01-19. `origin/develop` is a divergent ref with a different dependency setup and a `pnpm-lock.yaml`; it is not the source used for this snapshot and must not be silently merged into the rewrite baseline.
