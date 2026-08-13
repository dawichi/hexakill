# Current Architecture

**Status:** Observed implementation snapshot, reviewed 2026-08-13 at `d441a661f8381feb48996746f2f284a6d0a51b56` on `main`.

## Executive summary

Hexakill is a single-route, browser-only SvelteKit game. The application renders one shell and switches between five views using a discriminated `gameData.view` value. Gameplay state is held in writable Svelte stores and mutable class instances. There is no server route, API, database, account system, queue, or authenticated boundary in the checked-out source.

The repository is an unfinished legacy application, not a clean foundation for incremental feature work. The store, combat, persistence, accessibility, dependency, and validation boundaries need review before a large feature expansion. This document describes what exists; the rewrite proposal is in [rewrite-target.md](rewrite-target.md).

## Runtime and entry points

-   `src/routes/+layout.svelte` imports global CSS, renders the title/menu/timer/audio shell, and provides the Svelte slot.
-   `src/routes/+page.svelte` selects `Welcome`, `ChampSelect`, `Combat`, `Store`, or `GameOver` based on `$gameData.view`.
-   `src/app.html` provides the HTML document, title/description, favicon, and three CDN-hosted presentation/icon resources.
-   `src/app.css` loads Tailwind layers and defines the `glassmorphism` class.
-   `svelte.config.js` uses `@sveltejs/adapter-auto`; no concrete deployment adapter or deployment manifest is committed.
-   `vite.config.ts` registers the SvelteKit Vite plugin.

The application has one route and no URL-level route model for the game phases. Refreshing or opening the URL begins from the store initializer's `welcome` state; no session restoration is implemented.

## Technology inventory

The checked-out manifest declares Svelte 4.2.8, SvelteKit 2.3.2, Vite 4.5.1, TypeScript 5.3.3, Tailwind CSS 3.4.1, Flowbite/Flowbite-Svelte, Iconify Svelte, Prettier, ESLint, and `svelte-check`. The runtime/dependency state is not reproducible yet: there is no committed lockfile, the supported package script refers to a missing `jsconfig.json`, and the SvelteKit/Vite peer dependency setup is unresolved.

## Source boundaries

| Area          | Current responsibility                                                            | Main paths            |
| ------------- | --------------------------------------------------------------------------------- | --------------------- |
| Views         | Screen-level rendering and input handlers                                         | `src/lib/views/`      |
| Components    | Entity, inventory, logger, power-up, layout, audio, store UI                      | `src/lib/components/` |
| Models        | Mutable entity/item classes and combat statistics                                 | `src/lib/models/`     |
| Services      | Combat orchestration, enemy generation, storage, audio, logs, tooltips, utilities | `src/lib/services/`   |
| Configuration | Character, enemy, item, power-up, icon, and styling data                          | `src/lib/config/`     |
| State         | Global session, volume, and modal stores                                          | `src/lib/data/`       |
| Types         | DTO-like TypeScript types                                                         | `src/lib/types/`      |
| Assets        | Character/enemy idle art, spritesheets, music, sound effects                      | `static/`             |

The boundaries are organizational rather than enforced. Components mutate shared state directly, services update the global store, models depend on utility services, and `GameDTO` contains class instances. This makes the current behavior difficult to run outside the browser or test without rendering Svelte components.

## State and persistence

The `gameData` store contains the current view, username, character, enemy, shop, UI flags, logs, power-up history, and defeated-enemy history. `volume` contains music/effects volume. `modalContext` controls the help dialog.

Browser storage is used for:

-   `hxkllPersonalRecords` — top five local records written after player defeat.
-   `musicVolume` and `effectsVolume` — volume preferences.

Stored JSON is parsed without runtime validation or schema versioning. Records are local to one browser profile and are not an account or server save system.

## Integrations and trust boundaries

The checked-out application has no API or external data integration. It does load Bootstrap Icons CSS, Animate.css, and the Iconify browser script from CDNs declared in `src/app.html`. Local static assets provide images, music, and sound effects. Browser APIs include `localStorage`, `Audio`, `document`, timers, and keyboard/mouse events.

The important trust boundary is the browser runtime: user-entered names, keyboard events, local-storage contents, CDN responses, and asset availability are runtime-controlled inputs. There are no identified secrets or protected operations in the current source. The hosting platform, if the README's Vercel URL is still active, owns delivery configuration not present in this repository and must be verified separately.

The README historically advertised an MIT license, but no `LICENSE` file is present in this checkout. Licensing of the repository and bundled media is unresolved and must not be assumed from the badge that was removed during documentation cleanup.

## Material current-state risks

-   `src/lib/config/enemies.ts` references `presets.easy`, but no `easy` preset is defined. This can produce an invalid enemy configuration; the impact depends on the generated enemy level path.
-   `CharacterModel.addItem()` updates inventory totals, but the current combat/stat methods do not apply those item totals to the character's effective combat statistics. Store behavior is therefore incomplete or at least not aligned with its displayed bonuses.
-   `src/lib/services/combat.service.ts` uses mutable global state and delayed callbacks (`setTimeout`) for turn resolution and defeat transitions. There is no explicit cancellation or transition guard.
-   `src/lib/services/storage.service.ts` trusts arbitrary JSON from local storage.
-   `src/lib/components/PowerUps.svelte` indexes a keyboard-action map with any key while power-ups are pending; an unmapped key can call `undefined`.
-   `Timer.svelte` creates an interval at module/component initialization without an explicit teardown.
-   `Audio.svelte` keeps audio elements in a module-level set without removal and relies on browser autoplay behavior.
-   `StoreItem.svelte` uses a clickable `article` instead of a keyboard-operable control. `Tooltip.svelte` uses mouse-only interaction and has an accessibility warning.
-   `Modal.svelte` uses `any` around the native dialog API and does not document focus return, Escape behavior, or modal accessibility semantics.

These are findings for the rewrite and backlog, not authorization to change current gameplay in this documentation session.

## Historical context

The repository history begins on 2021-10-26, contains an earlier React-era phase, then a SvelteKit project start on 2022-09-28, and ends on `main` at 2024-01-19. `origin/develop` is a divergent ref with a different dependency setup and a `pnpm-lock.yaml`; it is not the source used for this snapshot and must not be silently merged into the rewrite baseline.
