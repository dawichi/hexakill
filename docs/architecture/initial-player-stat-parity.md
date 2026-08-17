# Initial Player Stat Parity

**Status:** Accepted by [ADR-0002](../adr/0002-level-4-player-initialization.md).

## Finding

The selected player starts at level 4 with every base stat scaled by the starting level. This preserves the archived opening balance and keeps the displayed level consistent with the combat values.

| Stat   | Base value | Archived level-4 value | Active Angular value |
| ------ | ---------: | ---------------------: | -------------------: |
| health |        200 |                    800 |                  800 |
| ad     |         16 |                     64 |                   64 |
| ap     |         20 |                     80 |                   80 |
| armor  |         12 |                     48 |                   48 |
| mr     |         12 |                     48 |                   48 |
| speed  |          4 |                     16 |                   16 |

The archived `BaseEntityModel` assigns `level * base` in its constructor. Archived character selection constructs `CharacterModel` at level 4, so the archived row applies to the selected player. The active `createInitialPlayer` now applies the same scaling; character modifiers continue to apply during Angular level-up progression.

## Evidence

- Archived initialization: `legacy/svelte/src/lib/models/Entity.ts` (`BaseEntityModel` constructor).
- Archived selection: `legacy/svelte/src/lib/components/ChampSelect.svelte` and its call to `new CharacterModel(4, ...)`.
- Active initialization: `src/app/domain/characters.ts` (`createInitialPlayer`).
- Active regression fixture: `src/app/domain/characters.spec.ts` asserts the level-4 player uses the legacy-scaled row.
- Decision record: [ADR-0002](../adr/0002-level-4-player-initialization.md).

The change affects opening health, damage, speed ordering, store value, enemy difficulty, and reward pacing. Opening combat and store/progression fixtures should be reviewed as balance work continues.
