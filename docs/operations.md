# Operations and Development Commands

**Status:** Current repository evidence, reviewed 2026-08-15.

## Local setup

The archived Svelte package under `legacy/svelte/` has no committed lockfile and is retained only for historical reference. The active root package pins Angular, Node.js 24.19.0, npm 11.17.0, and a committed lockfile.

The archived Svelte commands below are historical evidence only. They are not part of the active root workflow. See [TODO-001](TODO.md#todo-001-high-dependency-toolchain-baseline) and [TODO-002](TODO.md#todo-002-high-repair-validation-commands).

## Commands and observed results

| Purpose                   | Command                                   | Current result                                                         |
| ------------------------- | ----------------------------------------- | ---------------------------------------------------------------------- |
| Archived Svelte build     | `legacy/svelte/`                          | Not a supported active command; historical failures remain documented. |
| Active development server | `npm start`                               | Passes for the Angular root.                                           |
| Active tests              | `npm test -- --watch=false --no-progress` | Passes: 10 files, 36 tests.                                            |
| Active browser journeys   | `npm run test:e2e`                        | Passes locally: 3 Chromium journeys.                                   |
| Active build              | `npm run build`                           | Passes; output is `dist/hexakill/browser/`.                            |
| Dependency audit          | `npm audit`                               | Not yet added to the supported CI gate.                                |

The archived Svelte findings are recorded in [TODO-003](TODO.md#todo-003-high-clear-current-type-and-accessibility-errors); they are not active root blockers.

## Active Angular application

The root Angular application is the currently validated implementation surface. Run these commands from the repository root with Node.js 24.19.0 and npm 11.17.0:

| Purpose              | Command                                                         | Current result                                                                                                                      |
| -------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Clean install        | `npm ci`                                                        | Passes with the committed root `package-lock.json`.                                                                                 |
| Unit/component tests | `npm test -- --watch=false --no-progress`                       | Passes: 10 files, 36 tests.                                                                                                         |
| Production build     | `npm run build`                                                 | Passes; output is `dist/hexakill/browser/` and the Angular production budget is clean.                                              |
| Formatting           | `npx prettier --check 'src/**/*.{ts,html,css}' '*.json' '*.md'` | Passes.                                                                                                                             |
| CI validation        | `.github/workflows/angular-rewrite.yml`                         | Added; runs install, formatting, tests, browser journeys, build, and representative/full idle-asset checks on rewrite/docs changes. |
| Browser journeys     | `npm run test:e2e`                                              | Passes locally: 3 Chromium journeys cover store/combat, local-session restore, and potion-driven defeat; CI installs Chromium.      |
| Browser smoke        | `npm start`                                                     | Verified welcome → character selection → ready run → store purchase → combat → Attack with migrated sprites.                        |

The Angular application is not a production deployment. It has provisional combat, progression, power-up, store, versioned local-session persistence, sound/music lifecycle, and CI/browser journey gates; hosting acceptance and final gameplay balance remain unresolved.

## Runtime configuration

No `.env.example`, runtime environment schema, server endpoint, API key, database, or deployment secret was found. The current game uses local browser APIs and bundled/static assets. The CDN resources in `src/app.html` are external runtime dependencies and should be reviewed for availability, integrity, licensing, and privacy before the rewrite.

## Deployment evidence

The root README links to `https://hexakill.vercel.app`, and `.gitignore` contains `.vercel`, but there is no Vercel project configuration, adapter selection, deployment script, headers/redirects policy, or verified deployment record in the repository. The rewrite has a scoped CI workflow, but hosting remains unknown until checked outside the repository.

The Angular output mode is now documented as static in [the deployment contract](architecture/rewrite-deployment.md), but no provider is accepted or externally verified yet.

## Troubleshooting order

1. Confirm the checkout and branch: `git status --short`, `git branch --show-current`, `git rev-parse HEAD`.
2. Establish a reproducible Node/package-manager toolchain and lockfile before upgrading or removing dependencies.
3. Run `npx svelte-kit sync`, then the direct type check.
4. Repair the package scripts and formatter/build dependency graph.
5. Add deterministic domain tests before changing gameplay behavior.
6. Run the rewrite CI-equivalent gates, then add audit/report retention before accepting a deployment provider.
