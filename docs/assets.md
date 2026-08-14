# Asset Inventory and Migration Contract

**Status:** Initial inventory, reviewed 2026-08-13.

## Inventory

The legacy `static/` tree contains 111 image files, 5 music tracks, 7 sound effects, `favicon.ico`, and `robots.txt`. The files are retained as project assets; no licensing or provenance claim is made by this inventory.

The root Angular application now uses the retained `static/` tree directly. The isolated prototype copy was removed after root build output verified the migrated assets.

## Current usage

- Character definitions reference typed idle assets for Wizard, Samurai, and Warrior.
- The provisional enemy catalog references idle assets for Slime Blue, Archer, Evil Wizard, and Knight.
- `src/app/domain/assets.ts` centralizes music, sound, and item paths for future adapters.
- The active root UI uses idle character/enemy sprites and the application port triggers bundled attack, magic, coin, potion, error, and enemy-killed sounds plus welcome/character-select/dungeon/store music lifecycle. Mute/volume controls and action/death animations remain unresolved.

## Migration rules

1. Preserve asset paths or record an explicit replacement mapping.
2. Do not remove retained `static/` assets until the active Angular production output has been verified.
3. Classify each retained image as meaningful, decorative, or animation source and provide accessible text behavior at the UI boundary.
4. Verify audio loading, user-gesture policy, mute controls, reduced-motion behavior, and failure handling before release.
5. Complete provenance/licensing review before publishing retained or replacement assets.

## Deferred work

The full asset set is not yet mapped to every enemy, attack, death state, item, or UI surface. That work belongs with combat, store, progression, and accessibility slices. See [TODO-012](TODO.md#todo-012-medium-asset-and-licensing-inventory) and [handoff](handoff.md).
