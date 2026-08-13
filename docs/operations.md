# Operations and Development Commands

**Status:** Current repository evidence, reviewed 2026-08-13.

## Local setup

The legacy root package declares npm-compatible JavaScript dependencies but does not commit a lockfile. `.npmrc` enables `engine-strict=true`, but the legacy root has no Node.js or package-manager version pinned. A normal root `npm install` currently fails with a peer dependency conflict between Vite 4.5.1 and the SvelteKit Vite plugin peer. The diagnostic install used for this review was:

```sh
npm install --legacy-peer-deps --ignore-scripts --no-package-lock --no-audit --no-fund
npx svelte-kit sync
```

This is a temporary diagnostic workaround, not the desired reproducible setup. See [TODO-001](TODO.md#todo-001-high-dependency-toolchain-baseline) and [TODO-002](TODO.md#todo-002-high-repair-validation-commands).

## Commands and observed results

| Purpose                   | Command                                       | Current result                                                                                                            |
| ------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Development server        | `npm run dev`                                 | Not re-verified in this session; build/tooling blockers remain.                                                           |
| Prepare generated types   | `npx svelte-kit sync`                         | Passed during review.                                                                                                     |
| Type check                | `npx svelte-check --tsconfig ./tsconfig.json` | Reached source and reported 4 errors and 3 warnings in 3 files.                                                           |
| Project type-check script | `npm run check`                               | Fails because `jsconfig.json` does not exist.                                                                             |
| Formatting check          | `npm run lint`                                | Fails because Prettier cannot resolve the configured `svelte` parser; also reports an obsolete `pluginSearchDirs` option. |
| Build                     | `npm run build`                               | Fails because `@sveltejs/vite-plugin-svelte` cannot be resolved and the Vite/SvelteKit peer setup is inconsistent.        |
| Tests                     | No script                                     | No automated tests are present.                                                                                           |
| Dependency audit          | `npm audit`                                   | Cannot run reproducibly without a lockfile.                                                                               |

The direct `svelte-check` findings are recorded in [TODO-003](TODO.md#todo-003-high-clear-current-type-and-accessibility-errors); they are not fixed by this documentation session.

## Angular rewrite prototype

The isolated rewrite is the currently validated implementation surface. Run these commands from `rewrite/angular-prototype/` with Node.js 24.19.0 and npm 11.17.0:

| Purpose              | Command                                                         | Current result                                                                 |
| -------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Clean install        | `npm ci`                                                        | Passes with the committed `package-lock.json`.                                 |
| Unit/component tests | `npm test -- --watch=false --no-progress`                       | Passes: 5 files, 18 tests.                                                     |
| Production build     | `npm run build`                                                 | Passes; the Angular production budget is clean.                                |
| Formatting           | `npx prettier --check 'src/**/*.{ts,html,css}' '*.json' '*.md'` | Passes.                                                                        |
| Browser smoke        | `npm start`                                                     | Manually verified welcome → character selection → ready run → combat → Attack. |

This prototype is not a production deployment. It intentionally has no persistence, store, enemy turns, progression, audio, CI, or deployment target yet.

## Runtime configuration

No `.env.example`, runtime environment schema, server endpoint, API key, database, or deployment secret was found. The current game uses local browser APIs and bundled/static assets. The CDN resources in `src/app.html` are external runtime dependencies and should be reviewed for availability, integrity, licensing, and privacy before the rewrite.

## Deployment evidence

The root README links to `https://hexakill.vercel.app`, and `.gitignore` contains `.vercel`, but there is no Vercel project configuration, adapter selection, CI workflow, deployment script, headers/redirects policy, or verified deployment record in the repository. Treat the hosting target and current availability as unknown until checked outside the repository.

`@sveltejs/adapter-auto` is configured, so deployment output is intentionally not pinned to a concrete platform in source. A future deployment decision must select the adapter/output mode, document static versus server behavior, and verify the production-like build.

## Troubleshooting order

1. Confirm the checkout and branch: `git status --short`, `git branch --show-current`, `git rev-parse HEAD`.
2. Establish a reproducible Node/package-manager toolchain and lockfile before upgrading or removing dependencies.
3. Run `npx svelte-kit sync`, then the direct type check.
4. Repair the package scripts and formatter/build dependency graph.
5. Add deterministic domain tests before changing gameplay behavior.
6. Add CI only after the local commands are stable.
