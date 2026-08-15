# Hexakill Readiness and Rewrite TODOs

This is the prioritized backlog for making the project safe to rewrite. Items are intentionally scoped as follow-up work; this bootstrap session does not silently resolve them.

### TODO-001 [High] Dependency toolchain baseline

- **Status:** Partially resolved for active root
- **Affected area:** `package.json`, `.npmrc`, `.gitignore`, lockfile, Node/package-manager configuration
- **Evidence:** The archived `legacy/svelte/` package has no lockfile and remains unreproducible; the active Angular root has a committed lockfile, Node.js range enforcement, an `.nvmrc` baseline, pinned npm metadata, an executable Node/npm verification command, and a source-reviewed direct dependency set with unused generated forms/router entries removed.
- **Risk:** Agents cannot reproduce the same dependency graph or know whether a build failure is code or tooling.
- **Next action:** Retain npm/Node 24.19.0 as the active baseline; decide whether the archived Svelte package metadata should be deleted after the historical audit is complete.
- **Dependencies:** Confirm whether the archived Svelte package should be deleted after the historical audit.
- **Owner:** Tech Lead / future developer agent
- **Target:** Before dependency upgrades or feature work

### TODO-002 [High] Repair validation commands

- **Status:** Resolved for active root; archived Svelte commands retained as historical failures
- **Affected area:** `package.json`, SvelteKit generated config, Prettier/ESLint configuration
- **Evidence:** `npm run check` references missing `jsconfig.json`; `npm run lint` cannot resolve the Svelte parser; `npm run build` cannot resolve the SvelteKit Vite peer.
- **Risk:** A future agent cannot establish a trustworthy green baseline.
- **Next action:** Keep root format/test/build/browser/production-preview commands aligned; do not revive archived Svelte commands without a deliberate decision.
- **Dependencies:** TODO-001
- **Owner:** Future developer agent
- **Target:** First implementation session

### TODO-003 [High] Clear current type and accessibility errors

- **Status:** Deferred for archived source; active root has a separate accessibility backlog
- **Affected area:** `Tooltip.svelte`, `PowerUps.svelte`, `StoreItem.svelte`, `Modal.svelte`, `Welcome.svelte`, `src/routes/+layout.svelte`
- **Evidence:** Direct `svelte-check` found 4 type errors and 3 warnings; ESLint found 5 errors and 3 warnings.
- **Risk:** The current source cannot serve as a clean characterization baseline, and interaction defects are hidden by tooling noise.
- **Next action:** Keep the archived findings as evidence and track active-root accessibility in TODO-011; do not repair archived source without an explicit compatibility need.
- **Dependencies:** TODO-001 and TODO-002
- **Owner:** Future developer agent
- **Target:** Before migration comparison

### TODO-004 [High] Extract and characterize game rules

- **Status:** Partially resolved
- **Affected area:** `legacy/svelte/src/lib/models/`, archived services/config, and active `src/app/domain/`
- **Evidence:** Randomness, mutable class instances, timers, and global stores are mixed with combat logic in the archived app. The active Angular app now has pure combat, full-roster/boss enemy generation, speed-based opening turns, action-policy, transition, potion, progression, and store modules; delayed turns are scheduler-backed and reset-safe, but the rewrite does not yet establish full legacy parity.
- **Risk:** A rewrite can accidentally rebalance or change gameplay while appearing structurally cleaner.
- **Next action:** Extend fixtures for progression, terminal-state rules, persistence migration, and final balance; mark each rule intentional, suspicious, or obsolete before migration.
- **Dependencies:** Product review of current gameplay and TODO-005
- **Owner:** Tech Lead / gameplay owner
- **Target:** First rewrite design session

### TODO-005 [High] Decide store contract and item effects

- **Status:** Partially resolved
- **Affected area:** `Store.svelte`, `StoreItem.svelte`, `CharacterModel.addItem`, inventory/stat display
- **Evidence:** Legacy offers and bonuses were characterized. The active Angular app has a documented provisional contract and pure purchase rules with immediate stat application, repeatable potion offers, one-time items, and immutable failure paths; product acceptance is still missing.
- **Risk:** Rewriting the store without a product contract preserves or removes progression accidentally.
- **Next action:** Review [the provisional store contract](architecture/rewrite-store.md), decide item effect timing, restocking, persistence, and final balance, then record an ADR.
- **Dependencies:** TODO-004
- **Owner:** Product owner / Tech Lead
- **Target:** Before production migration

### TODO-006 [High] Introduce explicit domain state machine

- **Status:** Partially resolved
- **Affected area:** Future rewrite domain/application layers
- **Evidence:** Current `GameDTO` allowed mutable nested combinations and view transitions were distributed across archived components/services. The Angular app now has a pure combat reducer for idle, player action, potion, enemy turn, resolution, victory, and defeat, with speed-based opening turns, progression, boss progress, scheduler-backed delayed turns, and reset cancellation guards at the application boundary.
- **Risk:** Invalid transitions, duplicate delayed callbacks, and stale UI actions can corrupt a run.
- **Next action:** Characterize progression and terminal-state rules further, then move scheduler tokens into the framework-independent state contract if delayed transitions expand.
- **Dependencies:** TODO-004 and TODO-005
- **Owner:** Future rewrite agent
- **Target:** Rewrite foundation

### TODO-007 [High] Version and validate browser persistence

- **Status:** Partially resolved
- **Affected area:** `legacy/svelte/src/lib/services/storage.service.ts`, root Angular storage adapter, and volume preference handling
- **Evidence:** The active Angular app has versioned `hexakill.angular.session.v1`, `hexakill.angular.records.v1`, and `hexakill.angular.preferences.v1` envelopes, injectable storage boundaries, structural validation for player/enemy/progression/record/preference data, coherent screen/phase validation, rejection of transient combat actions and malformed damage results at the durable-session boundary, canonical character/item hydration, invalid-record clearing, accessible volume controls, and non-fatal browser storage failure handling. Migration from legacy keys remains missing.
- **Risk:** Old/corrupt local storage can crash or create invalid records and preferences.
- **Next action:** Decide migration policy for legacy keys/preferences, record the decision in an ADR, and extend malformed-input fixtures as the schemas evolve.
- **Dependencies:** TODO-006
- **Owner:** Future rewrite agent
- **Target:** Before persistence is retained

### TODO-008 [High] Add deterministic test layers

- **Status:** Partially resolved
- **Affected area:** Active root Angular application and CI
- **Evidence:** The archived Svelte app has no tests or test runner. The active Angular app has 13 deterministic unit/component test files with 65 passing tests, including enemy-action thresholds, power-up caps, state reset/spawn boundaries, repeatable and invalid store purchases, legacy numeric rounding/fractional-level boundaries, multi-level reward and global power-up-cap boundaries, observed enemy attack-strip mappings, Witch Blue vertical-strip mapping, canonical restored-character binding, and level-up audio parity, plus injectable random/clock/storage/audio/records/preferences ports, application transition coverage, malformed persistence-boundary rejection, and seventeen Playwright journeys for store/combat, Wizard and Samurai provisional player-action sprite rendering, mapped enemy attack/defeat-strip rendering, reload restore, audio-preference restore, invalid/incoherent-screen/transient-combat-action/whitespace-only/negative-stat/unbound-character persistence recovery, keyboard/focus transitions, responsive reduced-motion behavior, defeat/history/records, rewards/power-ups, and sequential bosses. The same journeys pass against the built static artifact.
- **Risk:** Final balance, accessibility, and uncharacterized edge cases can still regress outside the current automated journeys.
- **Next action:** Complete the manual screen-reader, contrast, zoom, focus-visibility, and responsive review; retain deterministic ports as feature coverage expands.
- **Dependencies:** TODO-004 and TODO-006
- **Owner:** Future rewrite agent
- **Target:** Before feature expansion

### TODO-009 [High] Define deployment ADR

- **Status:** Partially resolved
- **Affected area:** Rewrite workspace, hosting configuration, framework profile
- **Evidence:** Angular is accepted for the rewrite in [ADR-0001](adr/0001-angular-rewrite.md). The proposed [deployment contract](architecture/rewrite-deployment.md) defines static output, asset behavior, security headers, and release gates; `npm run verify:deployment` now validates the committed Vercel contract, but provider and owner acceptance remain unresolved.
- **Risk:** Framework churn can consume the rewrite without improving domain quality.
- **Next action:** Select the hosting provider and promote the proposed contract into a separate accepted ADR after a production-like preview.
- **Dependencies:** TODO-001, TODO-004, TODO-008, hosting constraints
- **Owner:** Tech Lead / project owner
- **Target:** Before the first production-like rewrite deployment

### TODO-010 [Medium] Consolidate presentation systems

- **Status:** Deferred
- **Affected area:** Tailwind, Flowbite-Svelte, Bootstrap Icons, Iconify, Animate.css, component CSS
- **Evidence:** Multiple styling/icon/animation systems coexist and ownership is undocumented.
- **Risk:** Inconsistent visuals, larger payloads, and migration friction.
- **Next action:** Select a primary styling/icon/animation strategy and document allowed exceptions in the target design system.
- **Dependencies:** TODO-009
- **Owner:** Future UI agent
- **Target:** Rewrite UI foundation

### TODO-011 [Medium] Accessibility critical-journey contract

- **Status:** Partially resolved
- **Affected area:** All game views and interactive components
- **Evidence:** Archived Svelte warnings identify mouse-only tooltip behavior and clickable non-controls. The active root has labeled name/audio inputs, semantic buttons/status regions, visible focus styles, programmatic focus targets for screen transitions and power-up progression, browser coverage for keyboard/focus, store, combat, audio, game-over/reset, reduced motion, and narrow viewport behavior, and an [accessibility review record](accessibility-review.md) with representative contrast calculations and rendered browser smoke evidence. A full assistive-technology review remains open.
- **Risk:** Players cannot complete core flows with keyboard, assistive technology, or non-pointer input.
- **Next action:** Perform manual screen-reader, contrast, zoom, and focus-visibility review; retain automated focus/reduced-motion journeys as regression coverage.
- **Dependencies:** TODO-006 and TODO-009
- **Owner:** Future UI agent
- **Target:** Before browser test completion

### TODO-012 [Medium] Asset and licensing inventory

- **Status:** Partially resolved
- **Affected area:** `static/images/`, `static/music/`, `static/sounds/`, fonts, CDN resources
- **Evidence:** The repository contains 111 image files, 5 music tracks, 7 sound effects, and external CDN dependencies. The active Angular app consumes the retained `static/` tree through typed idle/animation/item/audio paths; two player action strips, two player defeat strips, five enemy attack strips, and five enemy defeat strips are now mapped provisionally, including Witch Blue's vertical strips, the remaining 61 non-active image sources are cataloged in [the sprite-source register](assets-sprite-sources.md); and [the provenance register](assets-provenance.md) records the exact unknown source/license/attribution boundary. The historical README advertised MIT without a tracked `LICENSE` file.
- **Risk:** Rewrite or redeploy can lose assets or create unreviewed licensing/privacy exposure.
- **Next action:** Confirm the repository and bundled-media rights with the owner, then replace the unknown fields in [assets-provenance.md](assets-provenance.md) with source, license, attribution, dimensions/format, and intended replacement/optimization evidence.
- **Dependencies:** Product decision on retained visual identity
- **Owner:** Project owner / Tech Lead
- **Target:** Before asset migration

### TODO-013 [Medium] Verify hosting and production behavior

- **Status:** Partially resolved
- **Affected area:** Vercel claim, adapter-auto, build output, static assets, 404/headers
- **Evidence:** `https://hexakill.vercel.app` is reachable and returns a Vercel-served SvelteKit response, proving an existing endpoint but not Angular ownership or migration. The active Angular root has `vercel.json`, a passing `verify:deployment` contract check, a passing production build, a static preview server, a `verify:preview` gate for headers/cache/404 behavior, and browser journeys against the built output.
- **Risk:** Agents may assume a deployment target or claim production readiness without evidence.
- **Next action:** Confirm project ownership/authorization, deploy Angular to a preview, and document rollback and post-deploy asset behavior in an ADR; compare the external headers/404 behavior with the local contract.
- **Dependencies:** TODO-001 and TODO-009
- **Owner:** Project owner / future operations agent
- **Target:** Before release work

### TODO-014 [Medium] Add CI and dependency security gates

- **Status:** Partially resolved
- **Affected area:** CI configuration, lockfile, audit tooling, branch protection
- **Evidence:** The Angular root has a committed lockfile, `npm ci`, `npm audit --audit-level=high` with 0 high-severity vulnerabilities, a committed `npm run verify:release` aggregate gate, formatting/TypeScript/test/browser/build/asset/preview-contract CI gates, local validation evidence, and a workflow step configured to retain test/build reports for 14 days. Branch protection and successful remote workflow execution are not verified from this checkout.
- **Risk:** Broken builds, dependency vulnerabilities, and quality regressions can merge unnoticed.
- **Next action:** Verify the remote artifact upload and confirm required checks protect the promoted Angular delivery; select an Angular lint policy only if future complexity warrants it.
- **Dependencies:** TODO-001, TODO-002, TODO-008
- **Owner:** Future operations agent
- **Target:** Before merging rewrite features

### TODO-015 [Low] Product scope decisions beyond the local run

- **Status:** Unknown
- **Affected area:** Accounts, remote records, analytics, multiplayer, payments, backend
- **Evidence:** No such integrations exist in current source; future need is not stated.
- **Risk:** Premature architecture may add backend/security/operations complexity that the game does not need.
- **Next action:** Confirm the product horizon before selecting backend, identity, data, or observability profiles.
- **Dependencies:** Project-owner decision
- **Owner:** Project owner
- **Target:** Before backend design
