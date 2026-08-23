# Rewrite migration history

**Status:** Historical migration record.

The isolated Angular prototype was promoted to the repository root on 2026-08-15.

The active application is now `src/`, with root `package.json`, `angular.json`, `e2e/`, and
`static/`. The isolated prototype implementation was removed after the root clean install, unit
tests, production build, browser journeys, and active asset-contract checks passed. The former
Svelte implementation remains under `legacy/svelte/` for historical behavior reference only.

The current migration contract covers 81 active paths, exact source-reference parity, and 42
explicitly cataloged deferred image sources. Use the root commands and [project handoff](../handoff.md)
for continuation.
