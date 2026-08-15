# Asset Inventory and Migration Contract

**Status:** Initial inventory, reviewed 2026-08-15.

## Inventory

The legacy `static/` tree contains 111 image files, 5 music tracks, 7 sound effects, `favicon.ico`, and `robots.txt`. The files are retained as project assets; no licensing or provenance claim is made by this inventory.

The root Angular application now uses the retained `static/` tree directly. The isolated prototype copy was removed after root build output verified the migrated assets.

## Current usage

- Character definitions reference typed idle assets for Wizard, Samurai, and Warrior.
- The enemy catalog references typed idle assets for all 18 observed enemy definitions, including the three sequential Gold Slime boss encounters.
- `src/app/domain/assets.ts` centralizes music, sound, and item paths for future adapters.
- The active root UI uses idle character/enemy sprites and item images. The application port triggers bundled attack, magic, coin, potion, error, and enemy-killed sounds plus welcome/character-select/dungeon/store music lifecycle. Mute/volume controls and action/death animations remain unresolved.

## Asset coverage evidence

| Asset group                         | Retained files | Active typed/use boundary                                                                         | Remaining work                                             |
| ----------------------------------- | -------------: | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Character/enemy idle GIFs           |             21 | `CharacterDefinition.idleAsset`, `EnemyDefinition.idleAsset`, rendered in root combat/ready views | Verify dimensions and accessibility presentation           |
| Item images                         |              3 | `STORE_ITEMS[].asset`, rendered in the store                                                      | Provenance/license record                                  |
| Music tracks                        |              5 | `ASSET_MANIFEST.music`, application audio lifecycle                                               | Volume/mute controls and release autoplay policy           |
| Sound effects                       |              7 | `ASSET_MANIFEST.sounds`, injectable `AudioPort`                                                   | Volume/mute controls and failure telemetry policy          |
| Additional sprite/animation sources |             87 | Retained in `static/`; no active animation contract yet                                           | Map attack/death states or explicitly classify as deferred |

The counts above are repository observations from `static/`; rerun `find static/images -type f`, `find static/music -type f`, and `find static/sounds -type f` when assets change.

## Migration rules

1. Preserve asset paths or record an explicit replacement mapping.
2. Do not remove retained `static/` assets until the active Angular production output has been verified.
3. Classify each retained image as meaningful, decorative, or animation source and provide accessible text behavior at the UI boundary.
4. Verify audio loading, user-gesture policy, mute controls, reduced-motion behavior, and failure handling before release.
5. Complete provenance/licensing review before publishing retained or replacement assets.

## Deferred work

The full asset set is not yet mapped to every enemy, attack, death state, item, or UI surface. That work belongs with combat, store, progression, and accessibility slices. See [TODO-012](TODO.md#todo-012-medium-asset-and-licensing-inventory) and [handoff](handoff.md).
