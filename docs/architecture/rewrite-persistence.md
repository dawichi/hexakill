# Angular Persistence Contract

**Status:** Implemented provisional local-browser contract; migration and product scope remain open.

## Observed legacy behavior

The archived Svelte application stored personal records under `hxkllPersonalRecords` as an unversioned JSON array. A record contained `classIdx`, `name`, and `record`; records were sorted descending by level and truncated to five entries. Player defeat appended a record, the layout displayed the list, and retry did not clear it. The archived reader trusted arbitrary JSON and could throw on malformed input.

## Active Angular contract

The root application separates the active run from personal records:

- Run state uses `hexakill.angular.session.v1` through `SESSION_STORAGE`.
- Personal records use `hexakill.angular.records.v1` through `RECORDS_STORAGE`.
- Audio preferences use `hexakill.angular.preferences.v1` through `PREFERENCES_STORAGE`.
- The records envelope is `{ version: 1, records: [...] }`.
- Each record uses the stable `characterId`, the player `name`, and the reached `level`.
- Records are validated on restore, sorted descending by level, and capped at five entries.
- Invalid or malformed records are discarded safely.
- Restored run snapshots must match a coherent screen/phase shape: character selection has no player or enemy, a ready screen has an idle player with no enemy, combat has an undamaged enemy awaiting action or a defeated enemy showing victory, and game-over has an enemy with a defeat phase and lethal player damage.
- Durable v1 snapshots reject transient `pendingAction` values and malformed `lastResult` values; the application never resumes an in-flight action or delayed enemy turn after reload.
- Defeat writes one record; resetting a run preserves the records list.
- The welcome and game-over views expose the list and a clear action.
- Music and effects volumes use the observed `0.05` and `0.2` defaults, an accessible `0`–`0.5` range, and persist independently from the run.

The browser adapter is deliberately non-fatal when storage is blocked or full. Records are local-only and are not an account, leaderboard, analytics, or remote persistence feature.

## Deliberately unresolved

- Whether old `hxkllPersonalRecords` entries should be migrated into the Angular schema or intentionally abandoned.
- Whether records should remain local-only when the product scope is finalized.
- Whether a future record needs timestamp, run identifier, score, or additional statistics.
- Whether the active session and records need export, deletion confirmation, or privacy copy.
- Whether legacy `musicVolume` and `effectsVolume` keys should be migrated into the Angular preferences envelope.

Do not add migration, remote records, or new fields as an incidental cleanup. Resolve the product/data decision in an ADR, then add fixtures and a migration policy.
