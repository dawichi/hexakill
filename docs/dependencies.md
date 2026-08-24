# Dependency Inventory

**Status:** Active root inventory reviewed 2026-08-23.

The repository has one supported dependency graph: the Angular application at the repository root.

## Active Angular root

| Group | Direct packages | Purpose |
| ----- | --------------- | ------- |
| Runtime | `@angular/common`, `@angular/compiler`, `@angular/core`, `@angular/platform-browser` | Angular application/runtime and template compilation |
| Runtime | `rxjs`, `tslib` | Angular/runtime support |
| Build/test | `@angular/build`, `@angular/cli`, `@angular/compiler-cli` | Build, development server, strict compiler, and unit-test builder |
| Browser tests | `@playwright/test` | Chromium critical journeys and production-artifact checks |
| Unit tests | `jsdom`, `vitest` | DOM-like test environment and deterministic unit tests |
| Formatting/linting/types | `@biomejs/biome`, `typescript` | Repository formatting, focused linting, and TypeScript compiler baseline |

The active graph does not use Angular Router or Angular Forms: the app has one screen-level session state and native labelled inputs. Those generated direct dependencies were removed on 2026-08-15. The application uses local CSS and Lucide icons rather than a utility or CDN UI framework.

## Install and trust policy

- Use Node.js `24.19.0`, npm `11.17.0`, and the committed root `package-lock.json`.
- `.nvmrc` selects Node.js `24.19.0`; the active package accepts only Node.js `24.x` from `24.19.0` onward.
- Run `npm run verify:toolchain` before install/test work; CI installs and verifies the same npm version.
- Use `npm ci`; do not update the lockfile with an unconstrained install during feature work.
- `.npmrc` enables `engine-strict=true`.
- The root `package.json` has no `preinstall`, `install`, or `postinstall` lifecycle hooks.
- Transitive dependency install scripts can still run under npm and must be reviewed when dependencies change; do not approve scripts globally as a substitute for reviewing the dependency graph.
- Run `npm audit --audit-level=high` and the documented build/test/preview gates before accepting dependency changes.

See [operations](operations.md), [TODO-001](TODO.md#todo-001-high-dependency-toolchain-baseline), and [TODO-014](TODO.md#todo-014-medium-add-ci-and-dependency-security-gates) for reproducibility and CI follow-up.
