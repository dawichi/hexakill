# Hexakill Readiness and Rewrite TODOs

This is the prioritized backlog for making the project safe to rewrite. Items are intentionally scoped as follow-up work; this bootstrap session does not silently resolve them.

### TODO-001 [High] Dependency toolchain baseline

-   **Status:** Planned
-   **Affected area:** `package.json`, `.npmrc`, `.gitignore`, lockfile, Node/package-manager configuration
-   **Evidence:** The legacy root package has no lockfile; root lockfiles are ignored; normal root npm install hits a SvelteKit/Vite peer conflict; the legacy runtime/package-manager versions are not pinned. The isolated Angular prototype has its own committed lockfile and toolchain declaration.
-   **Risk:** Agents cannot reproduce the same dependency graph or know whether a build failure is code or tooling.
-   **Next action:** Choose npm/pnpm/Bun for the rewrite baseline, pin Node and the manager, resolve the SvelteKit/Vite/plugin graph, commit the lockfile, and make clean installation pass without `--legacy-peer-deps`.
-   **Dependencies:** Confirm whether current `main` or a new rewrite workspace is the baseline.
-   **Owner:** Tech Lead / future developer agent
-   **Target:** Before dependency upgrades or feature work

### TODO-002 [High] Repair validation commands

-   **Status:** Planned
-   **Affected area:** `package.json`, SvelteKit generated config, Prettier/ESLint configuration
-   **Evidence:** `npm run check` references missing `jsconfig.json`; `npm run lint` cannot resolve the Svelte parser; `npm run build` cannot resolve the SvelteKit Vite peer.
-   **Risk:** A future agent cannot establish a trustworthy green baseline.
-   **Next action:** Make check, format/lint, and build commands agree with the chosen toolchain; keep a direct command for each gate.
-   **Dependencies:** TODO-001
-   **Owner:** Future developer agent
-   **Target:** First implementation session

### TODO-003 [High] Clear current type and accessibility errors

-   **Status:** Planned
-   **Affected area:** `Tooltip.svelte`, `PowerUps.svelte`, `StoreItem.svelte`, `Modal.svelte`, `Welcome.svelte`, `src/routes/+layout.svelte`
-   **Evidence:** Direct `svelte-check` found 4 type errors and 3 warnings; ESLint found 5 errors and 3 warnings.
-   **Risk:** The current source cannot serve as a clean characterization baseline, and interaction defects are hidden by tooling noise.
-   **Next action:** Decide whether to repair legacy files minimally or freeze them and cover the rewrite; record each intentional legacy exception.
-   **Dependencies:** TODO-001 and TODO-002
-   **Owner:** Future developer agent
-   **Target:** Before migration comparison

### TODO-004 [High] Extract and characterize game rules

-   **Status:** Partially resolved
-   **Affected area:** `src/lib/models/`, `src/lib/services/combat.service.ts`, `enemy.service.ts`, `utils.service.ts`, config files
-   **Evidence:** Randomness, mutable class instances, timers, and global stores are mixed with combat logic in the legacy app. The Angular prototype now has pure combat, enemy-generation, action-policy, transition, progression, and store modules, but they do not yet establish full legacy parity.
-   **Risk:** A rewrite can accidentally rebalance or change gameplay while appearing structurally cleaner.
-   **Next action:** Extend fixtures for bosses, persistence, reset behavior, and final balance; mark each rule intentional, suspicious, or obsolete before migration.
-   **Dependencies:** Product review of current gameplay and TODO-005
-   **Owner:** Tech Lead / gameplay owner
-   **Target:** First rewrite design session

### TODO-005 [High] Decide store contract and item effects

-   **Status:** Partially resolved
-   **Affected area:** `Store.svelte`, `StoreItem.svelte`, `CharacterModel.addItem`, inventory/stat display
-   **Evidence:** Legacy offers and bonuses were characterized. The Angular prototype has a documented provisional contract and pure purchase rules with immediate stat application, repeatable potion offers, one-time items, and immutable failure paths; product acceptance is still missing.
-   **Risk:** Rewriting the store without a product contract preserves or removes progression accidentally.
-   **Next action:** Review [the provisional store contract](architecture/rewrite-store.md), decide item effect timing, restocking, persistence, and final balance, then record an ADR.
-   **Dependencies:** TODO-004
-   **Owner:** Product owner / Tech Lead
-   **Target:** Before production migration

### TODO-006 [High] Introduce explicit domain state machine

-   **Status:** Partially resolved
-   **Affected area:** Future rewrite domain/application layers
-   **Evidence:** Current `GameDTO` allows mutable nested combinations and view transitions are distributed across legacy components/services. The Angular prototype now has a pure combat reducer for idle, player action, enemy turn, resolution, victory, and defeat, but it does not cover progression or the full run state.
-   **Risk:** Invalid transitions, duplicate delayed callbacks, and stale UI actions can corrupt a run.
-   **Next action:** Characterize progression, cancellation behavior, and terminal-state rules, then extend the pure state machine without coupling it to Angular.
-   **Dependencies:** TODO-004 and TODO-005
-   **Owner:** Future rewrite agent
-   **Target:** Rewrite foundation

### TODO-007 [High] Version and validate browser persistence

-   **Status:** Partially resolved
-   **Affected area:** `src/lib/services/storage.service.ts`, volume preference handling
-   **Evidence:** The Angular prototype has a versioned `hexakill.angular.session.v1` envelope, injectable storage boundary, invalid-JSON clearing, and non-fatal browser storage failure handling. Full runtime schema validation and migration coverage remain missing.
-   **Risk:** Old/corrupt local storage can crash or create invalid records and preferences.
-   **Next action:** Add runtime schema validation, migration policy, browser restore tests, and malformed-record fixtures.
-   **Dependencies:** TODO-006
-   **Owner:** Future rewrite agent
-   **Target:** Before persistence is retained

### TODO-008 [High] Add deterministic test layers

-   **Status:** Partially resolved
-   **Affected area:** New rewrite workspace and CI
-   **Evidence:** The legacy app has no tests or test runner. The Angular prototype has 10 deterministic unit/component test files, injectable random/clock/storage/audio ports, application transition coverage, and Playwright journeys for start/store/combat and reload restore.
-   **Risk:** Combat and store regressions will be detected only by manual play.
-   **Next action:** Extend browser journeys to defeat/rewards/power-ups and keep delayed behavior on the injected clock.
-   **Dependencies:** TODO-004 and TODO-006
-   **Owner:** Future rewrite agent
-   **Target:** Before feature expansion

### TODO-009 [High] Define deployment ADR

-   **Status:** Partially resolved
-   **Affected area:** Rewrite workspace, hosting configuration, framework profile
-   **Evidence:** Angular is accepted for the rewrite in [ADR-0001](adr/0001-angular-rewrite.md). The proposed [deployment contract](architecture/rewrite-deployment.md) defines static output, asset behavior, and release gates, but provider and owner acceptance remain unresolved.
-   **Risk:** Framework churn can consume the rewrite without improving domain quality.
-   **Next action:** Select the hosting provider and promote the proposed contract into a separate accepted ADR after a production-like preview.
-   **Dependencies:** TODO-001, TODO-004, TODO-008, hosting constraints
-   **Owner:** Tech Lead / project owner
-   **Target:** Before the first production-like rewrite deployment

### TODO-010 [Medium] Consolidate presentation systems

-   **Status:** Deferred
-   **Affected area:** Tailwind, Flowbite-Svelte, Bootstrap Icons, Iconify, Animate.css, component CSS
-   **Evidence:** Multiple styling/icon/animation systems coexist and ownership is undocumented.
-   **Risk:** Inconsistent visuals, larger payloads, and migration friction.
-   **Next action:** Select a primary styling/icon/animation strategy and document allowed exceptions in the target design system.
-   **Dependencies:** TODO-009
-   **Owner:** Future UI agent
-   **Target:** Rewrite UI foundation

### TODO-011 [Medium] Accessibility critical-journey contract

-   **Status:** Planned
-   **Affected area:** All game views and interactive components
-   **Evidence:** Current svelte-check warnings identify mouse-only tooltip behavior and clickable non-controls; name input lacks a label; no manual review exists.
-   **Risk:** Players cannot complete core flows with keyboard, assistive technology, or non-pointer input.
-   **Next action:** Define accessible names, focus order/return, dialog behavior, status announcements, reduced motion/audio behavior, and keyboard alternatives for the run journey.
-   **Dependencies:** TODO-006 and TODO-009
-   **Owner:** Future UI agent
-   **Target:** Before browser test completion

### TODO-012 [Medium] Asset and licensing inventory

-   **Status:** Planned
-   **Affected area:** `static/images/`, `static/music/`, `static/sounds/`, fonts, CDN resources
-   **Evidence:** The repository contains 111 image files, 5 music tracks, 7 sound effects, and external CDN dependencies. The Angular prototype now consumes a copied asset tree and an initial typed manifest, but there is still no provenance/license manifest; the historical README advertised MIT without a tracked `LICENSE` file.
-   **Risk:** Rewrite or redeploy can lose assets or create unreviewed licensing/privacy exposure.
-   **Next action:** Confirm the repository license with the owner, then complete the inventory in [assets.md](assets.md) with source, license, attribution requirement, dimensions/format, and intended replacement/optimization.
-   **Dependencies:** Product decision on retained visual identity
-   **Owner:** Project owner / Tech Lead
-   **Target:** Before asset migration

### TODO-013 [Medium] Verify hosting and production behavior

-   **Status:** Planned
-   **Affected area:** Vercel claim, adapter-auto, build output, static assets, 404/headers
-   **Evidence:** README links to Vercel but repository has no provider configuration or verified deployment record. The Angular prototype now has a passing production build and documented static output, but hosting behavior is not externally verified.
-   **Risk:** Agents may assume a deployment target or claim production readiness without evidence.
-   **Next action:** Verify URL ownership/availability, identify the deployment project, run a production-like preview, and document rollback, 404, headers, and asset behavior.
-   **Dependencies:** TODO-001 and TODO-009
-   **Owner:** Project owner / future operations agent
-   **Target:** Before release work

### TODO-014 [Medium] Add CI and dependency security gates

-   **Status:** Deferred
-   **Affected area:** CI configuration, lockfile, audit tooling, branch protection
-   **Evidence:** No CI files, test command, frozen install, audit workflow, or retained validation artifacts exist.
-   **Risk:** Broken builds, dependency vulnerabilities, and quality regressions can merge unnoticed.
-   **Next action:** After local commands are reliable, add install, format/lint, type-check, tests, build, audit, and report retention; verify required checks protect delivery.
-   **Dependencies:** TODO-001, TODO-002, TODO-008
-   **Owner:** Future operations agent
-   **Target:** Before merging rewrite features

### TODO-015 [Low] Product scope decisions beyond the local run

-   **Status:** Unknown
-   **Affected area:** Accounts, remote records, analytics, multiplayer, payments, backend
-   **Evidence:** No such integrations exist in current source; future need is not stated.
-   **Risk:** Premature architecture may add backend/security/operations complexity that the game does not need.
-   **Next action:** Confirm the product horizon before selecting backend, identity, data, or observability profiles.
-   **Dependencies:** Project-owner decision
-   **Owner:** Project owner
-   **Target:** Before backend design
