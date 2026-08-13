# Hexakill Agent Instructions

This file is the canonical project-specific instruction entry point for AI developer agents. Hexakill is an existing, unfinished browser game being prepared for a future rewrite. Treat the current code as the source of truth for implemented behavior and treat rewrite documents as proposals unless they explicitly say otherwise.

## Read first

1. Read this file.
2. Read the [documentation index](README.md).
3. Read the [standards contract](project-standards.yml) and [standards assessment](standards-assessment.md).
4. Read [current architecture](architecture/current-state.md) and the relevant [game-loop documentation](features/game-loop.md).
5. For rewrite work, read the [framework evaluation](architecture/rewrite-evaluation.md) and [target architecture proposal](architecture/rewrite-target.md).
6. For continuation work, read the [current development handoff](handoff.md).

## Source-of-truth map

-   Current implementation and behavior: `src/`.
-   Current entry points and route composition: `src/routes/`, `src/app.html`, and `src/app.css`.
-   Current game state and rules: `src/lib/data/`, `src/lib/models/`, `src/lib/services/`, and `src/lib/config/`.
-   Current static assets: `static/`.
-   Package and tool configuration: `package.json`, `tsconfig.json`, `svelte.config.js`, `vite.config.ts`, Tailwind/PostCSS/Prettier/ESLint files.
-   Current deployment evidence: [operations documentation](operations.md) and the root `README.md`. The README's Vercel URL is a claim from project history, not verified deployment infrastructure.
-   Proposed future design: `docs/architecture/rewrite-*.md`. These files MUST NOT be used as evidence that the proposed architecture already exists.
-   Angular rewrite prototype: `rewrite/angular-prototype/`. This is the active rewrite implementation and has its own README, package lockfile, tests, and build commands.
-   Durable project decisions: [ADR index](adr/README.md).
-   Known gaps and deferred work: [TODO.md](TODO.md).

## Working rules

-   Do not invent gameplay behavior, requirements, integrations, deployment details, or framework decisions.
-   Preserve the distinction between observed current state, user-provided context, recommendation, assumption, unknown, and accepted decision.
-   Do not perform broad behavior-changing refactors, dependency upgrades, or framework migrations during analysis or documentation sessions.
-   Keep gameplay rules independent from presentation in future work wherever practical. New rules SHOULD be pure and independently testable before they are connected to UI state.
-   Treat local storage data as user-controlled runtime input. Validate and version it before relying on it.
-   Do not add accounts, a backend, analytics, payments, cloud persistence, or new third-party services without an explicit product decision.
-   Do not remove or replace art, music, sound, or font assets without checking licensing/provenance and recording the result.
-   When a behavior changes, update the current-state or workflow documentation in the same change.
-   For a durable architecture, product, data, or deployment decision, create or update an ADR. Do not use ADRs for ordinary TODOs or temporary investigations.
-   Do not treat `Deferred`, `Unknown`, `Partial`, or `Gap` findings as complete.

## Validation commands

The repository is not currently cleanly reproducible. Use these commands as diagnostics and report their result:

-   Install (observed workaround, no lockfile): `npm install --legacy-peer-deps --ignore-scripts --no-package-lock --no-audit --no-fund`
-   Prepare generated SvelteKit types: `npx svelte-kit sync`
-   Type check (direct command currently reaches the source): `npx svelte-check --tsconfig ./tsconfig.json`
-   Project type-check script: `npm run check` (currently broken because it references missing `jsconfig.json`).
-   Formatting/lint script: `npm run lint` (currently broken because the configured Svelte parser is not resolved by the installed Prettier setup).
-   Build: `npm run build` (currently blocked by the unresolved SvelteKit/Vite peer dependency state).
-   Tests: no test command exists yet.
-   Dependency audit: no supported audit command is currently reproducible because no lockfile is committed.

Do not describe a command as passing unless it has been run from the current checkout. Before changing tooling, record the existing failure and keep the change narrowly scoped.

## Angular rewrite validation

Run these commands from `rewrite/angular-prototype/` for rewrite work:

-   Install: `npm ci`
-   Type/build validation: `npm run build`
-   Tests: `npm test -- --watch=false --no-progress`
-   Development server: `npm start`

The prototype currently uses Angular 21, Node.js 24.19.0, npm 11.17.0, strict compiler/template checks, standalone components, signals, and Vitest. Keep the prototype lockfile committed and do not reuse the legacy Svelte dependency graph.

## Documentation maintenance

Update [README.md](README.md) when adding, moving, or removing maintained documentation. Keep one source of truth per topic and link to it instead of copying long explanations. Update [project-standards.yml](project-standards.yml) when a standard, profile, compliance state, exception, or deferred item changes. Add an ADR when a framework, persistence model, deployment model, or other durable policy is accepted.

## Safe change boundaries

Documentation, tests, diagnostics, and narrowly scoped tooling/readiness fixes are safe within the requested task. Framework conversion, dependency upgrades, gameplay rebalance, asset replacement, persistence migration, new external services, and deployment changes require a separate implementation decision and validation plan. If a change can invalidate future rewrite assumptions, stop and record the question in [TODO.md](TODO.md) or an ADR before proceeding.
