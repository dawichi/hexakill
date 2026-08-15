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

The active app consumes the legacy character/enemy idle GIFs through typed `idleAsset` fields, uses observed Evil Tree/slime attack and defeat GIFs through optional typed enemy animation fields with a scheduler-backed 600 ms enemy-attack window, renders provisional Wizard/Samurai single-row `Attack1.png` strips during player actions and `Death.png` strips on game over, and maps observed Wild Huntress/Evil Wizard/Fire Worm/Martial Hero single-row `Attack1.png` strips plus Witch Blue's vertical attack strip during enemy attack windows, with corresponding defeat strips during provisional defeat states. Boss encounters select the typed boss music asset; regular encounters select dungeon music. The retained root `static/` tree is copied into Angular build output. Music, sound, and item paths are centralized in `domain/assets.ts`; playback is behind an injectable audio port.

## Deliberate non-goals

Final persistence acceptance, deployment, and gameplay balancing remain unresolved. The app has versioned local-session, records, and preferences envelopes, non-fatal audio playback, CI, and sixteen Chromium journeys, but these are still provisional.

## Known characterization points

- Player starts at level 4 with base stats, 5 potions, and 2000 gold, matching the observed legacy initialization.
- Enemy levels preserve the archived pre-boss calculation: `minLevel = floor(playerLevel / 2)`, `maxLevel = playerLevel * 1.75`, then `floor(random * (maxLevel - minLevel + 1)) + minLevel`. The upper bound is intentionally fractional before the final level conversion; for example, player level 3 with a `0.99` roll produces enemy level 6.
- Enemy gold preserves the archived `Number(((enemyLevel / playerLevel) * 250).toFixed(0))` rule, including its numeric rounding behavior.
- Combat resistance reduction and victory experience likewise preserve the archived `toFixed(0)` rounding rules; these boundaries have deterministic regression fixtures.
- Legacy enemy stat scaling for levels below 10 does not apply enemy modifiers; the active app preserves that behavior intentionally as a characterization point, not as an approved balance decision.
- The legacy enemy catalog contains a broken `presets.easy` reference; the active app keeps the complete observed roster explicit and treats the three Gold Slime encounters as a separate sequential boss schedule.

## Next recommended session

1. Decide whether to migrate legacy `hxkllPersonalRecords` and whether records remain local-only; record the decision in an ADR.
2. Resolve owner/source/license decisions recorded in [the asset provenance register](assets-provenance.md), then complete the accessibility review.
3. Select an accepted hosting provider and run an authorized Angular preview.
4. Review final gameplay balance, store effects, and the remaining 61 unmapped animation sources in [the sprite-source catalog](assets-sprite-sources.md).

## Validation at handoff

From the repository root:

```sh
npm ci
npm run verify:toolchain
npm run format:check
npm run verify:types
npm run verify:docs
npm run verify:assets
npm run verify:deployment
npm test -- --watch=false --no-progress
npm run build
npm run verify:release
```

The current verified result is a clean root install, 13 test files with 62 passing tests, a passing aggregate `npm run verify:release` gate, a passing root production build, a passing publishable-artifact contract check for `dist/hexakill/browser/index.html`, a passing preview-contract check for security headers/asset caching/404 behavior, all 21 idle assets in the output, passing formatting checks, and sixteen Chromium journeys covering progression/store/combat, Wizard and Samurai provisional player-action sprite rendering, mapped player/enemy attack/defeat-strip rendering including Witch Blue's vertical attack strip, local-session restore, audio-preference restore, invalid-session recovery including incoherent-screen, whitespace-only, negative-stat, and unbound-character restored data, keyboard/focus transitions, responsive reduced-motion behavior, keyboard game-over/reset and record clearing, defeated-enemy history, rewards/power-ups, and sequential bosses. A separate production-artifact run passes through the repository static preview server.
