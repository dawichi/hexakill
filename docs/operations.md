# Operations and Development Commands

**Status:** Current repository evidence, reviewed 2026-08-15.

## Local setup

The archived Svelte package under `legacy/svelte/` has no committed lockfile and is retained only for historical reference. The active root package pins Angular, requires Node.js 24.x from 24.19.0 onward, documents Node.js 24.19.0 in `.nvmrc`, uses npm 11.17.0, and has a committed lockfile.

The archived Svelte commands below are historical evidence only. They are not part of the active root workflow. See [TODO-001](TODO.md#todo-001-high-dependency-toolchain-baseline) and [TODO-002](TODO.md#todo-002-high-repair-validation-commands).

## Commands and observed results

| Purpose                   | Command                                   | Current result                                                                                                                              |
| ------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Archived Svelte build     | `legacy/svelte/`                          | Not a supported active command; historical failures remain documented.                                                                      |
| Active development server | `npm start`                               | Passes for the Angular root.                                                                                                                |
| Toolchain verification    | `npm run verify:toolchain`                | Verifies Node.js 24.19.0 and npm 11.17.0.                                                                                                   |
| TypeScript validation     | `npm run verify:types`                    | Passes `tsc --noEmit` for the active application and test compiler projects.                                                                |
| Active tests              | `npm test -- --watch=false --no-progress` | Passes: 13 files, 65 tests.                                                                                                                 |
| Active browser journeys   | `npm run test:e2e`                        | Passes locally: 18 Chromium journeys.                                                                                                       |
| Active build              | `npm run build`                           | Passes; output is `dist/hexakill/browser/`.                                                                                                 |
| Dependency audit          | `npm audit --audit-level=high`            | Passes locally with 0 high-severity vulnerabilities; CI now runs the same gate.                                                             |
| Active asset paths        | `npm run verify:assets`                   | Verifies all 62 typed idle/animation/item/music/sound paths, source-reference parity, exact deferred-register parity, and the 61-file deferred image boundary. |
| Deployment contract       | `npm run verify:deployment`               | Verifies the committed Angular/Vercel install, build, output, and required security-header contract.                                        |
| Release gate              | `npm run verify:release`                  | Runs the reproducible toolchain, formatting, TypeScript, docs, assets, unit, audit, build, publishable-artifact, preview, and production-artifact browser checks. |
| Preview contract          | `npm run verify:preview`                  | Verifies the built static root, security headers, representative asset caching, and 404 behavior.                                           |

The archived Svelte findings are recorded in [TODO-003](TODO.md#todo-003-high-clear-current-type-and-accessibility-errors); they are not active root blockers.

## Active Angular application

The root Angular application is the currently validated implementation surface. Run these commands from the repository root with Node.js 24.19.0 and npm 11.17.0:

| Purpose                 | Command                                                         | Current result                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clean install           | `npm ci`                                                        | Passes with the committed root `package-lock.json`.                                                                                                                                                                                                                                                                                                                        |
| Toolchain verification  | `npm run verify:toolchain`                                      | Passes for Node.js 24.19.0 and npm 11.17.0.                                                                                                                                                                                                                                                                                                                                |
| TypeScript validation   | `npm run verify:types`                                          | Passes `tsc --noEmit` for `tsconfig.app.json` and `tsconfig.spec.json`.                                                                                                                                                                                                                                                                                                    |
| Unit/component tests    | `npm test -- --watch=false --no-progress`                       | Passes: 13 files, 65 tests.                                                                                                                                                                                                                                                                                                                                                |
| Production build        | `npm run build`                                                 | Passes; output is `dist/hexakill/browser/` and the Angular production budget is clean.                                                                                                                                                                                                                                                                                     |
| Formatting              | `npx prettier --check 'src/**/*.{ts,html,css}' '*.json' '*.md'` | Passes.                                                                                                                                                                                                                                                                                                                                                                    |
| Documentation contract  | `npm run verify:docs`                                           | Verifies the docs index, local Markdown links, required root commands, and pinned Git revisions.                                                                                                                                                                                                                                                                           |
| CI validation           | `.github/workflows/angular-rewrite.yml`                         | Runs install, formatting, TypeScript, docs, deployment-contract, tests, preview-contract checks, dev-server and production-artifact browser journeys, build, asset checks, and 14-day validation-artifact retention.                                                                                                                                                       |
| Browser journeys        | `npm run test:e2e`                                              | Passes locally: 18 Chromium journeys cover store/combat, Wizard/Samurai action assets, mapped enemy attack/defeat-strip rendering including Witch Blue's vertical strip, restore, audio preferences, invalid/incoherent-screen/transient-combat-action/malformed-combat-result/whitespace-only/negative-stat/unbound-character session recovery, keyboard/focus transitions, reduced motion/narrow viewport, defeat/history/records, rewards/power-ups, and sequential bosses; CI installs Chromium. |
| Production-like browser | `npm run test:e2e:production`                                   | Passes locally against `dist/hexakill/browser/` through the repository static preview server.                                                                                                                                                                                                                                                                              |
| Active asset paths      | `npm run verify:assets`                                         | Passes locally for all 62 typed idle/animation/item/music/sound paths, source-reference parity, exact deferred-register parity, and the 61-file deferred image boundary.                                                                                                                                                                                  |
| Release gate            | `npm run verify:release`                                        | Passes locally when run from the root; repeats the production build and production-artifact browser journey as the final aggregate gate.                                                                                                                                                                                                                                   |
| Browser smoke           | `npm start`                                                     | Verified welcome → character selection → ready run → store purchase → combat → Attack with migrated sprites.                                                                                                                                                                                                                                                               |

The Angular application is not a production deployment. It has provisional combat, progression, power-up, store, versioned local-session persistence, sound/music lifecycle, and CI/browser journey gates; hosting acceptance and final gameplay balance remain unresolved.

## Runtime configuration

No `.env.example`, runtime environment schema, server endpoint, API key, database, or deployment secret was found. The current Angular game uses local browser APIs and bundled/static assets. The archived Svelte document included CDN resources under `legacy/svelte/src/app.html`; those are not active Angular runtime dependencies, but should remain part of the historical licensing/integrity review.

## Deployment evidence

The external URL `https://hexakill.vercel.app` was reachable during this review and returned `200` from Vercel, but its response identified the archived SvelteKit deployment (`x-sveltekit-page: true`). This verifies an existing Vercel endpoint, not an Angular deployment or project ownership. The repository now contains a candidate `vercel.json`; it has not been deployed or externally verified.

The Angular output mode is now documented as static in [the deployment contract](architecture/rewrite-deployment.md). The local `verify:preview` gate verifies the candidate artifact's headers, cache policy, and 404 behavior. Vercel is the observed candidate provider, but Angular migration, project ownership, rollback, and post-deploy asset behavior remain unverified.

## Remote repository evidence

A read-only ref check on 2026-08-15 found `origin/main` at `d441a66` (2024-01-19), `origin/develop` at `342e8b8`, and the local `main` at `371b1e1`, 135 commits ahead of `origin/main`. No push was performed in this preparation session. Local commits and green checks therefore do not prove that the Angular rewrite or its workflow has reached the remote repository; remote workflow execution, required checks, and branch protection remain unverified.

## Troubleshooting order

1. Confirm the checkout and branch: `git status --short`, `git branch --show-current`, `git rev-parse HEAD`.
2. Establish a reproducible Node/package-manager toolchain and lockfile before upgrading or removing dependencies.
3. Run `npm run format:check`, unit tests, and the production build from the active root.
4. Run `npm run test:e2e:production` to validate the built artifact and static asset server.
5. Add deterministic domain tests before changing gameplay behavior.
6. Run `npm run verify:preview` and confirm deployment ownership before accepting a provider.
