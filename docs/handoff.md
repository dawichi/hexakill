# Current Development Handoff

**Reviewed:** 2026-08-16
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

The combat slice also characterizes legacy speed ordering, enemy attack/magic/heal selection, fixed 20% healing, player potion use, player damage, defeat, and separate non-persistent player/enemy battle logs. Damage actions select attack/Magic animation assets while healing remains visually idle. Delayed enemy turns are scheduler-backed, generation-guarded, and cancelled on reset. The active app now has provisional victory rewards, leveling, power-up allocation, and an in-memory store; these are characterization slices rather than accepted product balance.

The combat boundaries reject malformed attacker/defender stats, invalid resistance or damage values, impossible damage totals, invalid opening-turn speeds, and malformed enemy potion state before applying legacy rules. The framework-independent combat transition also rejects malformed player damage results, non-monotonic or over-health enemy damage totals, and incoherent live/defeated-enemy phase boundaries before entering enemy-turn, victory, or defeat phases. These are input-safety constraints, not gameplay rebalance decisions.

Defeat now writes a validated, versioned local personal-record envelope through a separate storage port. The active contract preserves the legacy top-five descending-level behavior, validates known characters, the existing 3–14 character name contract, and safe-integer levels, shows records on welcome and game-over, and keeps them when a run is reset. The old `hxkllPersonalRecords` key is not auto-migrated; that is an explicit unresolved data decision in [the persistence contract](architecture/rewrite-persistence.md).

Victory now also appends a typed defeated-enemy history entry to the run. Game over groups those entries by enemy, displays the retained idle art, count, and defeated levels, and restores older v1 sessions without history as an empty list.

Audio preferences now use a separate validated envelope with the observed legacy defaults (`music=0.05`, `effects=0.2`), accessible range controls, and audio-port volume application. The old `musicVolume` and `effectsVolume` keys are not auto-migrated.

Durable session snapshots reject transient actions, malformed damage results, incoherent `lastResult`/enemy-damage pairs, unsafe numeric counters, and non-positive restored player/enemy health before hydration. The application never resumes an in-flight action or delayed enemy turn after reload.

The active app consumes the legacy character/enemy idle GIFs through typed `idleAsset` fields, uses observed Evil Tree/slime attack and defeat GIFs through optional typed enemy animation fields with a scheduler-backed 600 ms enemy-attack window, renders provisional Wizard/Samurai single-row `Idle.png` strips for combat idle states and `Attack1.png` strips for physical actions, `Attack2.png` strips for Magic actions, `Hit.png`/`Take Hit.png` strips when the player receives damage, and `Death.png` strips on game over, and maps observed Wild Huntress/Evil Wizard/Fire Worm/Knight/Martial Hero single-row `Idle.png` and `Attack1.png` strips plus five enemy hit strips, Evil Wizard's `Attack2.png` strip, and Witch Blue's nine-frame vertical `B_witch_idle.png` idle strip plus vertical `B_witch_charge.png` strip for Magic during enemy attack windows, with corresponding defeat strips during provisional defeat states. Boss encounters select the typed boss music asset; regular encounters select dungeon music. The retained root `static/` tree is copied into Angular build output. Music, sound, and item paths are centralized in `domain/assets.ts`; playback is behind an injectable audio port.

## Deliberate non-goals

Final persistence acceptance, deployment, and gameplay balancing remain unresolved. The app has versioned local-session, records, and preferences envelopes, non-fatal audio playback, CI, and twenty-six Chromium journeys, but these are still provisional.

## Completion gate

The current green release gate means the Angular rewrite is reproducible and safe to continue; it does not mean the product is finished or ready for final manual acceptance. Do not close the development effort until the owner-dependent items below are resolved and documented:

- initial player-stat parity and final gameplay balance;
- store effect timing, health semantics, restocking, persistence, and refund behavior;
- legacy persistence migration or an explicit abandonment decision;
- manual accessibility and assistive-technology review;
- asset provenance/licensing and disposition of the 42 deferred image sources;
- hosting/provider ownership, remote CI/branch protection, and release verification.

The application may be played for engineering smoke checks before that gate, but those sessions must not be interpreted as product acceptance.

## Known characterization points

- Player starts at level 4 with the current Angular prototype's unscaled base stats, 5 potions, and 2000 gold. This intentionally remains an unresolved divergence from the archived constructor, which initializes a level-4 entity with `level × base` stats; the exact values and decision gate are recorded in [the initial player-stat parity characterization](architecture/initial-player-stat-parity.md) and tracked by [TODO-016](TODO.md#todo-016-high-resolve-initial-player-stat-parity).
- Enemy levels preserve the archived pre-boss calculation for valid level-2+ runs: `minLevel = floor(playerLevel / 2)`, `maxLevel = playerLevel * 1.75`, then `floor(random * (maxLevel - minLevel + 1)) + minLevel`. The active generator normalizes the lower bound to 1 so a lowest-valid-level input cannot create a zero-health enemy. The upper bound is intentionally fractional before the final level conversion; for example, player level 3 with a `0.99` roll produces enemy level 6.
- Enemy gold preserves the archived `Number(((enemyLevel / playerLevel) * 250).toFixed(0))` rule, including its numeric rounding behavior.
- Combat resistance reduction and victory experience likewise preserve the archived `toFixed(0)` rounding rules; these boundaries have deterministic regression fixtures.
- Progression now rejects malformed player/enemy reward inputs and unknown runtime power-up identifiers, counts pending power-up choices toward the global maximum, and preserves the observed reward formulas for valid runs.
- Store purchases now reject malformed gold, potion, inventory, and stat state before applying the provisional item/potion contract; valid repeatable potion and one-time item behavior is unchanged.
- Store item effects remain intentionally provisional: archived `CharacterModel.addItem` maintained `inventory.totalBonus` separately, while the active Angular purchase rule applies bonuses directly to `player.stats`. See [the provisional store contract](architecture/rewrite-store.md) and [TODO-005](TODO.md#todo-005-high-decide-store-contract-and-item-effects) before changing balance or health semantics.
- Legacy enemy stat scaling for levels below 10 does not apply enemy modifiers; the active app preserves that behavior intentionally as a characterization point, not as an approved balance decision.
- The legacy enemy catalog contains a broken `presets.easy` reference; the active app keeps the complete observed roster explicit and treats the three Gold Slime encounters as a separate sequential boss schedule.

## Next recommended session

1. Decide whether to migrate legacy `hxkllPersonalRecords` and whether records remain local-only; record the decision in an ADR.
2. Resolve owner/source/license decisions recorded in [the asset provenance register](assets-provenance.md), then complete the accessibility review.
3. Select an accepted hosting provider and run an authorized Angular preview.
4. Review final gameplay balance, store effects, and the remaining 42 unmapped animation sources in [the sprite-source catalog](assets-sprite-sources.md).

## Validation at handoff

From the repository root:

```sh
npm ci
npm run verify:toolchain
npm run format:check
npm run verify:types
npm run verify:docs
npm run verify:migration
npm run verify:assets
npm run verify:asset-geometry
npm run verify:deployment
npm run verify:preview
npm test -- --watch=false --no-progress
npm run build
npm run verify:release
```

The current verified result on 2026-08-16 is revision `031e8783fe6ed58578a98e8f6df279202070d547` with a clean root install, 13 test files with 91 passing tests, a passing aggregate `npm run verify:release` gate, a passing root production build, a passing publishable-artifact contract check for `dist/hexakill/browser/index.html`, path and SHA-256 byte parity for all 125 retained static files in that artifact, passing source and publishable-artifact geometry checks for 33 typed sprite strips, 81 active asset paths and 42 exact deferred image sources, a passing preview-contract check for security headers, asset caching, 404 behavior, HEAD handling, unsupported methods, path traversal, and malformed URL encoding, all 21 idle assets in the output, passing formatting checks, bounded overflow-sized victory experience, malformed boss-progress, and post-transition boss-schedule rejection, runtime rejection of unknown damage kinds and actions, and twenty-six Chromium journeys covering progression/store/combat and the rendered non-persistent player/enemy battle logs with their legacy eight-entry rolling window and outcome messages, Wizard Idle/Attack1/Attack2/hit provisional player-animation rendering, mapped physical/Magic/hit/idle player/enemy attack/defeat-strip rendering including Witch Blue's idle, physical, hit, and Magic charge strips, local-session restore, audio-preference restore, malformed audio-preference and personal-record recovery, invalid-session recovery including incoherent-screen, transient-combat-action, resolving-player-action, enemy-turn, malformed-combat-result, whitespace-only, negative-stat, duplicate-inventory, over-cap-power-up, and unbound-character restored data, keyboard/focus transitions including the skip link, labeled champion/combat/store control groups, responsive reduced-motion behavior, keyboard game-over/reset and record clearing, defeated-enemy history, rewards/power-ups, and sequential bosses. The mapped enemy-animation, Knight idle, and Samurai/Magic player-animation journeys also passed repeated deterministic stability runs. Production journeys explicitly start the repository static server instead of reusing an unrelated service on port 4300; a separate production-artifact run passes through the repository static preview server.

At the read-only ref check on 2026-08-16, local `main` is 296 commits ahead of `origin/main` (`d441a661f8381feb48996746f2f284a6d0a51b56`, last remote subject `cache volume`, 2024-01-19); `origin/develop` remains a separate historical ref. This work has not been pushed, so remote CI and branch-protection evidence must be gathered separately before release.
