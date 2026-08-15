# Current Development Handoff

**Reviewed:** 2026-08-15
**Purpose:** Fast continuation point for a future developer agent.

## Current direction

The project owner chose Angular for the rewrite. The former SvelteKit application is archived under `legacy/svelte/` as a behavior reference. The active implementation surface is the repository root; the isolated Angular prototype was promoted and removed after root validation.

The accepted framework decision is [ADR-0001](adr/0001-angular-rewrite.md). The root app uses Angular 21, Node.js 24.19.0, npm 11.17.0, standalone components, strict compiler/template checks, signals, Vitest, and Playwright.

## Implemented active Angular contract

The current vertical slice is:

1. Welcome screen.
2. Player name and character selection.
3. In-memory run creation at the legacy starting values.
4. Typed generation for the complete observed legacy roster plus sequential Gold Slime boss encounters at levels 10, 20, and 30.
5. Combat screen with Attack, Magic, and Potion actions.
6. Pure damage resolution for ranges, misses, critical hits, resistance, integer damage, and health caps.
7. Pure combat state transitions for `idle`, `awaiting-player-action`, `resolving-player-action`, `enemy-turn`, `victory`, and `defeat`.

The Angular application service coordinates signals and random input. Domain rules do not import Angular. The `Clock` port exists and is injected at the application boundary; the provisional enemy turn uses it for a short presentation delay.

The combat slice also characterizes legacy speed ordering, enemy attack/magic/heal selection, fixed 20% healing, player potion use, player damage, and defeat. Delayed enemy turns are scheduler-backed, generation-guarded, and cancelled on reset. The active app now has provisional victory rewards, leveling, power-up allocation, and an in-memory store; these are characterization slices rather than accepted product balance.

Defeat now writes a validated, versioned local personal-record envelope through a separate storage port. The active contract preserves the legacy top-five descending-level behavior, shows records on welcome and game-over, and keeps them when a run is reset. The old `hxkllPersonalRecords` key is not auto-migrated; that is an explicit unresolved data decision in [the persistence contract](architecture/rewrite-persistence.md).

Victory now also appends a typed defeated-enemy history entry to the run. Game over groups those entries by enemy, displays the retained idle art, count, and defeated levels, and restores older v1 sessions without history as an empty list.

Audio preferences now use a separate validated envelope with the observed legacy defaults (`music=0.05`, `effects=0.2`), accessible range controls, and audio-port volume application. The old `musicVolume` and `effectsVolume` keys are not auto-migrated.

The active app consumes the legacy character/enemy idle GIFs through typed `idleAsset` fields and uses observed Evil Tree/slime attack and defeat GIFs through optional typed enemy animation fields. Boss encounters select the typed boss music asset; regular encounters select dungeon music. The retained root `static/` tree is copied into Angular build output. Music, sound, and item paths are centralized in `domain/assets.ts`; playback is behind an injectable audio port.

## Deliberate non-goals

Final persistence acceptance, deployment, and gameplay balancing remain unresolved. The app has versioned local-session, records, and preferences envelopes, non-fatal audio playback, CI, and eight Chromium journeys, but these are still provisional.

## Known characterization points

- Player starts at level 4 with base stats, 5 potions, and 2000 gold, matching the observed legacy initialization.
- Enemy levels use the legacy pre-boss range: `floor(playerLevel / 2)` through `floor(playerLevel * 1.75)`.
- Enemy gold uses truncated `(enemyLevel / playerLevel) * 250`.
- Legacy enemy stat scaling for levels below 10 does not apply enemy modifiers; the active app preserves that behavior intentionally as a characterization point, not as an approved balance decision.
- The legacy enemy catalog contains a broken `presets.easy` reference; the active app keeps the complete observed roster explicit and treats the three Gold Slime encounters as a separate sequential boss schedule.

## Next recommended session

1. Decide whether to migrate legacy `hxkllPersonalRecords` and whether records remain local-only; record the decision in an ADR.
2. Resolve owner/source/license decisions recorded in [the asset provenance register](assets-provenance.md), then complete the accessibility review.
3. Select an accepted hosting provider and run an authorized Angular preview.
4. Review final gameplay balance, store effects, and the remaining 75 unmapped animation sources.

## Validation at handoff

From the repository root:

```sh
npm ci
npm test -- --watch=false --no-progress
npm run build
npx prettier --check 'src/**/*.{ts,html,css}' '*.json' '*.md'
```

The current verified result is a clean root install, 12 test files with 47 passing tests, a passing root production build, a passing preview-contract check for security headers/asset caching/404 behavior, all 21 idle assets in the output, passing formatting checks, and eight Chromium journeys covering progression/store/combat, local-session restore, audio-preference restore, invalid-session recovery, keyboard start, keyboard game-over/reset and record clearing, defeated-enemy history, rewards/power-ups, and sequential bosses. A separate production-artifact run passes through the repository static preview server.
