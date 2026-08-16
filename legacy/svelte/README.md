# Archived Svelte reference

This directory is retained as a historical behavior and asset reference for the Angular rewrite. It is not the active application and is not part of the supported build, test, deployment, or dependency workflow.

Use the repository root for development:

```sh
npm ci
npm run verify:release
```

The archived package has no committed lockfile and its historical validation scripts are known to be incomplete. In particular, its `check` script references a missing `jsconfig.json`, and its SvelteKit dependency state is not maintained. Do not install or repair this package as part of ordinary Angular work.

When behavior is unclear, compare the archived source with the characterized rules in [`docs/features/game-loop.md`](../../docs/features/game-loop.md), the active implementation in [`src/`](../../src/), and the unresolved decisions in [`docs/TODO.md`](../../docs/TODO.md). Modify this directory only for an explicit historical-audit or compatibility task.
