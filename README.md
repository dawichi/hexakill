# Hexakill

Hexakill is a single-player browser RPG. The application uses Angular with typed domain rules, explicit session transitions, bundled assets, local-session persistence, and browser-journey validation.

## Development

Use Node.js `24.19.0` and npm `11.17.0`.

```sh
npm ci
npm start
```

Open `http://localhost:4200/`. The main validation commands are:

```sh
npm run format:check
npm run lint
npm run verify:types
npm run verify:docs
npm run verify:assets
npm run verify:asset-geometry
npm run verify:deployment
npm test -- --watch=false --no-progress
npm run test:e2e
npm run build
npm run verify:release
```

The production artifact is written to `dist/hexakill/browser/` and includes the migrated `static/` image, music, and sound assets.

## Project documentation

Start with [`docs/README.md`](docs/README.md), [`docs/AGENTS.md`](docs/AGENTS.md), and [`docs/handoff.md`](docs/handoff.md). They document the application contract, characterized compatibility behavior, standards evidence, release gates, and unresolved product decisions.

## Repository structure

- `src/` — active Angular application, application ports, domain rules, and tests.
- `static/` — retained images, music, sound effects, favicon, and robots file.
- `e2e/` — Playwright critical journeys.
- `tools/serve-static.mjs` — local static server for production-artifact verification.
- `vercel.json` — candidate static Vercel install/build/output contract; external deployment remains pending.
- `docs/` — project operating manual, architecture, standards, assets, operations, and TODOs.
- `docs/architecture/current-state.md` — verified runtime, source boundaries, state, persistence, integrations, and risks.
