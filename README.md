# Hexakill

Hexakill is a single-player browser RPG. The active application is now an Angular rewrite with typed domain rules, explicit session transitions, bundled legacy assets, local-session persistence, and browser-journey validation.

The former SvelteKit implementation is preserved under [`legacy/svelte/`](legacy/svelte/) as historical behavior reference. It is no longer the active build target.

## Development

Use Node.js `24.19.0` and npm `11.17.0`.

```sh
npm ci
npm start
```

Open `http://localhost:4200/`. The main validation commands are:

```sh
npm run format:check
npm test -- --watch=false --no-progress
npm run test:e2e
npm run build
```

The production artifact is written to `dist/hexakill/browser/` and includes the migrated `static/` image, music, and sound assets.

## Project documentation

Start with [`docs/README.md`](docs/README.md), [`docs/AGENTS.md`](docs/AGENTS.md), and [`docs/handoff.md`](docs/handoff.md). They document the rewrite contract, characterized legacy behavior, standards evidence, release gates, unresolved product decisions, and migration boundaries.

## Repository structure

- `src/` — active Angular application, application ports, domain rules, and tests.
- `static/` — retained images, music, sound effects, favicon, and robots file.
- `e2e/` — Playwright critical journeys.
- `tools/serve-static.mjs` — local static server for production-artifact verification.
- `vercel.json` — candidate static Vercel install/build/output contract; external deployment remains pending.
- `docs/` — project operating manual, architecture, standards, assets, operations, and TODOs.
- `legacy/svelte/` — archived SvelteKit source and configuration for historical reference only.
- `rewrite/` — migration note for the completed isolated-to-root Angular promotion.
