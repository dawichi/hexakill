# Operations and Development Commands

**Status:** Current repository evidence, reviewed 2026-08-15.

## Local setup

The archived Svelte package under `legacy/svelte/` has no committed lockfile and is retained only for historical reference. The active root package pins Angular, Node.js 24.19.0, npm 11.17.0, and a committed lockfile.

The archived Svelte commands below are historical evidence only. They are not part of the active root workflow. See [TODO-001](TODO.md#todo-001-high-dependency-toolchain-baseline) and [TODO-002](TODO.md#todo-002-high-repair-validation-commands).

## Commands and observed results

| Purpose                   | Command                                   | Current result                                                                  |
| ------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------- |
| Archived Svelte build     | `legacy/svelte/`                          | Not a supported active command; historical failures remain documented.          |
| Active development server | `npm start`                               | Passes for the Angular root.                                                    |
| Active tests              | `npm test -- --watch=false --no-progress` | Passes: 12 files, 47 tests.                                                     |
| Active browser journeys   | `npm run test:e2e`                        | Passes locally: 8 Chromium journeys.                                            |
| Active build              | `npm run build`                           | Passes; output is `dist/hexakill/browser/`.                                     |
| Dependency audit          | `npm audit --audit-level=high`            | Passes locally with 0 high-severity vulnerabilities; CI now runs the same gate. |
| Active asset paths        | `npm run verify:assets`                   | Verifies all 48 typed idle/animation/item/music/sound paths used by the active app. |

The archived Svelte findings are recorded in [TODO-003](TODO.md#todo-003-high-clear-current-type-and-accessibility-errors); they are not active root blockers.

## Active Angular application

The root Angular application is the currently validated implementation surface. Run these commands from the repository root with Node.js 24.19.0 and npm 11.17.0:

| Purpose                 | Command                                                         | Current result                                                                                                                                                                     |
| ----------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clean install           | `npm ci`                                                        | Passes with the committed root `package-lock.json`.                                                                                                                                |
| Unit/component tests    | `npm test -- --watch=false --no-progress`                       | Passes: 12 files, 47 tests.                                                                                                                                                        |
| Production build        | `npm run build`                                                 | Passes; output is `dist/hexakill/browser/` and the Angular production budget is clean.                                                                                             |
| Formatting              | `npx prettier --check 'src/**/*.{ts,html,css}' '*.json' '*.md'` | Passes.                                                                                                                                                                            |
| Documentation contract  | `npm run verify:docs`                                         | Verifies the docs index, local Markdown links, required root commands, and pinned Git revisions.                                                                                   |
| CI validation           | `.github/workflows/angular-rewrite.yml`                         | Runs install, formatting, docs, dev-server and production-artifact browser journeys, build, asset checks, and 14-day validation-artifact retention.                                |
| Browser journeys        | `npm run test:e2e`                                              | Passes locally: 8 Chromium journeys cover store/combat, restore, audio preferences, invalid-session recovery, keyboard start, defeat/history/records, rewards/power-ups, and sequential bosses; CI installs Chromium. |
| Production-like browser | `npm run test:e2e:production`                                   | Passes locally against `dist/hexakill/browser/` through the repository static preview server.                                                                                      |
| Active asset paths      | `npm run verify:assets`                                         | Passes locally for all 48 typed idle/animation/item/music/sound paths.                                                                                                            |
| Browser smoke           | `npm start`                                                     | Verified welcome → character selection → ready run → store purchase → combat → Attack with migrated sprites.                                                                       |

The Angular application is not a production deployment. It has provisional combat, progression, power-up, store, versioned local-session persistence, sound/music lifecycle, and CI/browser journey gates; hosting acceptance and final gameplay balance remain unresolved.

## Runtime configuration

No `.env.example`, runtime environment schema, server endpoint, API key, database, or deployment secret was found. The current Angular game uses local browser APIs and bundled/static assets. The archived Svelte document included CDN resources under `legacy/svelte/src/app.html`; those are not active Angular runtime dependencies, but should remain part of the historical licensing/integrity review.

## Deployment evidence

The external URL `https://hexakill.vercel.app` was reachable during this review and returned `200` from Vercel, but its response identified the archived SvelteKit deployment (`x-sveltekit-page: true`). This verifies an existing Vercel endpoint, not an Angular deployment or project ownership. The repository now contains a candidate `vercel.json`; it has not been deployed or externally verified.

The Angular output mode is now documented as static in [the deployment contract](architecture/rewrite-deployment.md). Vercel is the observed candidate provider, but Angular migration, project ownership, headers, rollback, and post-deploy asset behavior remain unverified.

## Troubleshooting order

1. Confirm the checkout and branch: `git status --short`, `git branch --show-current`, `git rev-parse HEAD`.
2. Establish a reproducible Node/package-manager toolchain and lockfile before upgrading or removing dependencies.
3. Run `npm run format:check`, unit tests, and the production build from the active root.
4. Run `npm run test:e2e:production` to validate the built artifact and static asset server.
5. Add deterministic domain tests before changing gameplay behavior.
6. Add audit/report retention and confirm deployment ownership before accepting a provider.
