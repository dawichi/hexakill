# Initial Player Stat Parity

**Status:** Characterized divergence; product decision still open. This is not an accepted ADR.

## Finding

The archived Svelte constructor and the active Angular prototype both start a player at level 4, but they do not initialize the same numeric stats. The difference is confirmed in source and is covered by an explicit Angular characterization test.

| Stat   | Base value | Archived level-4 value | Active Angular value |
| ------ | ---------: | ---------------------: | -------------------: |
| health |        200 |                    800 |                  200 |
| ad     |         16 |                     64 |                   16 |
| ap     |         20 |                     80 |                   20 |
| armor  |         12 |                     48 |                   12 |
| mr     |         12 |                     48 |                   12 |
| speed  |          4 |                     16 |                    4 |

The archived `BaseEntityModel` assigns `level * base` in its constructor. Archived character selection constructs `CharacterModel` at level 4, so the archived row applies to the selected player. The active `createInitialPlayer` stores a copy of `BASE_STATS`; character modifiers are applied only by the current Angular level-up progression.

## Evidence

- Archived initialization: `legacy/svelte/src/lib/models/Entity.ts` (`BaseEntityModel` constructor).
- Archived selection: `legacy/svelte/src/lib/components/ChampSelect.svelte` and its call to `new CharacterModel(4, ...)`.
- Active initialization: `src/app/domain/characters.ts` (`createInitialPlayer`).
- Active regression fixture: `src/app/domain/characters.spec.ts` explicitly asserts the level-4 player uses unscaled `BASE_STATS` and is not yet legacy parity.
- Backlog owner and risk: [TODO-016](../TODO.md#todo-016-high-resolve-initial-player-stat-parity).

## Why this remains unresolved

Choosing either row changes opening health, damage, speed ordering, store value, enemy difficulty, reward pacing, and browser fixtures. The active row is therefore a provisional prototype baseline, not an approved balance decision. The legacy row is evidence, not an automatic requirement for the rewrite.

## Decision gate

Before gameplay balance is accepted, the project owner and gameplay/tech lead must choose one of these contracts:

1. **Legacy-scaled level 4:** initialize every selected player's stat as `4 * BASE_STATS[stat]`.
2. **Angular unscaled level 4:** retain `BASE_STATS` at level 4 and explicitly accept the balance divergence.

After the choice, record an accepted ADR, update the characterization test, review enemy generation and store/progression fixtures, and rerun the critical browser journeys. Until then, agents must not change the initialization rule while fixing unrelated features.
