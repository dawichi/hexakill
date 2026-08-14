# Current Development Handoff

**Reviewed:** 2026-08-13  
**Purpose:** Fast continuation point for a future developer agent.

## Current direction

The project owner chose Angular for the future rewrite. The legacy SvelteKit application remains in place as a behavior reference and has not been broadly refactored. The active implementation surface is `rewrite/angular-prototype/`.

The accepted framework decision is [ADR-0001](adr/0001-angular-rewrite.md). The prototype uses Angular 21, Node.js 24.19.0, npm 11.17.0, standalone components, strict compiler/template checks, signals, and Vitest.

## Implemented prototype contract

The current vertical slice is:

1. Welcome screen.
2. Player name and character selection.
3. In-memory run creation at the legacy starting values.
4. Typed generation for the complete observed legacy roster plus sequential Gold Slime boss encounters at levels 10, 20, and 30.
5. Combat screen with Attack, Magic, and Potion actions.
6. Pure damage resolution for ranges, misses, critical hits, resistance, integer damage, and health caps.
7. Pure combat state transitions for `idle`, `awaiting-player-action`, `resolving-player-action`, `enemy-turn`, `victory`, and `defeat`.

The Angular application service coordinates signals and random input. Domain rules do not import Angular. The `Clock` port exists and is injected at the application boundary; the provisional enemy turn uses it for a short presentation delay.

The combat slice also characterizes legacy speed ordering, enemy attack/magic/heal selection, fixed 20% healing, player potion use, player damage, and defeat. The prototype now has provisional victory rewards, leveling, power-up allocation, and an in-memory store; these are characterization slices rather than accepted product balance.

The prototype now consumes the legacy character/enemy idle GIFs through typed `idleAsset` fields and copies the legacy `static/` tree into its Angular build output. Music, sound, and item paths are centralized in `domain/assets.ts`; sound playback is behind an injectable audio port, while music controls remain unresolved.

## Deliberate non-goals

Full persistence validation, music controls, full asset mapping, deployment, and final gameplay balancing remain unresolved. The prototype has a versioned local-session envelope, non-fatal audio playback, CI, and two Chromium journeys, but these are still provisional.

## Known characterization points

-   Player starts at level 4 with base stats, 5 potions, and 2000 gold, matching the observed legacy initialization.
-   Enemy levels use the legacy pre-boss range: `floor(playerLevel / 2)` through `floor(playerLevel * 1.75)`.
-   Enemy gold uses truncated `(enemyLevel / playerLevel) * 250`.
-   Legacy enemy stat scaling for levels below 10 does not apply enemy modifiers; the prototype preserves that behavior intentionally as a characterization point, not as an approved balance decision.
-   The legacy enemy catalog contains a broken `presets.easy` reference; the prototype keeps the complete observed roster explicit and treats the three Gold Slime encounters as a separate sequential boss schedule.

## Next recommended session

1. Extend browser critical-journey coverage to defeat, rewards, power-ups, and bosses.
2. Decide music lifecycle/volume behavior and complete the asset provenance map.
3. Select an accepted hosting provider and run a production-like preview before top-level migration.
4. Add the defeat-record/game-over experience and final reset contract.

## Validation at handoff

From `rewrite/angular-prototype/`:

```sh
npm ci
npm test -- --watch=false --no-progress
npm run build
npx prettier --check 'src/**/*.{ts,html,css}' '*.json' '*.md'
```

The current verified result is a clean install, 10 test files with 36 passing tests, a passing production build, copied asset output, and passing formatting checks. Two Chromium journeys cover the progression/store/combat path and local-session restore.
