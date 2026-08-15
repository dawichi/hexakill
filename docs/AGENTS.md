# Hexakill Agent Instructions

This file is the canonical project-specific instruction entry point for AI developer agents. Hexakill is an existing, unfinished browser game whose Angular rewrite is now the active root implementation. Treat the current root code as the source of truth for implemented behavior and treat rewrite documents as proposals unless they explicitly say otherwise.

## Read first

1. Read this file.
2. Read the [documentation index](README.md).
3. Read the [standards contract](project-standards.yml) and [standards assessment](standards-assessment.md).
4. Read [current architecture](architecture/current-state.md) and the relevant [game-loop documentation](features/game-loop.md).
5. For architecture work, read the [framework evaluation](architecture/rewrite-evaluation.md) and [target architecture proposal](architecture/rewrite-target.md).
6. For continuation work, read the [current development handoff](handoff.md).
7. For persistence changes, read the [Angular persistence contract](architecture/rewrite-persistence.md).

## Source-of-truth map

- Current implementation and behavior: root `src/` Angular application; archived Svelte code under `legacy/svelte/` is historical evidence only.
- Current entry points and composition: `src/main.ts`, `src/app/app.ts`, and `src/app/app.html`.
- Current game state and rules: `src/app/application/` and `src/app/domain/`.
- Current static assets: `static/`.
- Asset provenance and release restrictions: [asset provenance register](assets-provenance.md).
- Deferred sprite/sheet evidence: [sprite-source catalog](assets-sprite-sources.md).
- Package and tool configuration: `package.json`, `package-lock.json`, `angular.json`, TypeScript/Prettier files, and the CI workflow.
- Current deployment evidence: [operations documentation](operations.md), `vercel.json`, and the root `README.md`. The Vercel endpoint is observed but still serves the archived SvelteKit deployment.
- Proposed future design: `docs/architecture/rewrite-*.md`. These files MUST NOT be used as evidence that the proposed architecture already exists.
- Active Angular application: root `src/`, `package.json`, `angular.json`, and `e2e/`. The isolated prototype was promoted and removed after validation; the former Svelte source is archived under `legacy/svelte/`.
- Durable project decisions: [ADR index](adr/README.md).
- Known gaps and deferred work: [TODO.md](TODO.md).
- Active local persistence contract: [rewrite persistence](architecture/rewrite-persistence.md).

## Working rules

- Do not invent gameplay behavior, requirements, integrations, deployment details, or framework decisions.
- Preserve the distinction between observed current state, user-provided context, recommendation, assumption, unknown, and accepted decision.
- Do not perform broad behavior-changing refactors or dependency upgrades without a validation plan. The Angular root migration is accepted and should be treated as the active implementation.
- Keep gameplay rules independent from presentation in future work wherever practical. New rules SHOULD be pure and independently testable before they are connected to UI state.
- Treat local storage data as user-controlled runtime input. Validate and version it before relying on it.
- Do not add accounts, a backend, analytics, payments, cloud persistence, or new third-party services without an explicit product decision.
- Do not remove or replace art, music, sound, or font assets without checking licensing/provenance and recording the result.
- When a behavior changes, update the current-state or workflow documentation in the same change.
- For a durable architecture, product, data, or deployment decision, create or update an ADR. Do not use ADRs for ordinary TODOs or temporary investigations.
- Do not treat `Deferred`, `Unknown`, `Partial`, or `Gap` findings as complete.

## Validation commands

The archived Svelte source is not reproducible and is not the active application. Use the root Angular commands below:

- Install: `npm ci`
- Toolchain: `npm run verify:toolchain`
- Formatting: `npm run format:check`
- Documentation contract: `npm run verify:docs`
- Asset manifest: `npm run verify:assets`
- Production preview contract: `npm run verify:preview`
- Release gate: `npm run verify:release`
- Unit/component tests: `npm test -- --watch=false --no-progress`
- Browser journeys: `npm run test:e2e`
- Production-artifact browser journeys: `npm run test:e2e:production`
- Build: `npm run build`

Do not describe a command as passing unless it has been run from the current checkout. Before changing tooling, record the existing failure and keep the change narrowly scoped.

## Angular rewrite validation

Run these commands from the repository root for active Angular work:

- Install: `npm ci`
- Type/build validation: `npm run build`
- Tests: `npm test -- --watch=false --no-progress`
- Development server: `npm start`

The active application uses Angular 21, Node.js 24.19.0, npm 11.17.0, strict compiler/template checks, standalone components, signals, Vitest, and Playwright. Keep the root lockfile committed and do not reintroduce the archived Svelte dependency graph.

## Documentation maintenance

Update [README.md](README.md) when adding, moving, or removing maintained documentation. Keep one source of truth per topic and link to it instead of copying long explanations. Update [project-standards.yml](project-standards.yml) when a standard, profile, compliance state, exception, or deferred item changes. Add an ADR when a framework, persistence model, deployment model, or other durable policy is accepted.

## Safe change boundaries

Documentation, tests, diagnostics, and narrowly scoped tooling/readiness fixes are safe within the requested task. Framework conversion, dependency upgrades, gameplay rebalance, asset replacement, persistence migration, new external services, and deployment changes require a separate implementation decision and validation plan. If a change can invalidate future rewrite assumptions, stop and record the question in [TODO.md](TODO.md) or an ADR before proceeding.
