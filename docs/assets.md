# Asset Inventory and Migration Contract

**Status:** Initial inventory, reviewed 2026-08-15. Provenance details are tracked separately in [the provenance register](assets-provenance.md).

## Inventory

The legacy `static/` tree contains 111 image files, 5 music tracks, 7 sound effects, `favicon.ico`, and `robots.txt`. The files are retained as project assets; no licensing or provenance claim is made by this inventory.

The root Angular application now uses the retained `static/` tree directly. The isolated prototype copy was removed after root build output verified the migrated assets.

## Current usage

- Character definitions reference typed idle assets for Wizard, Samurai, and Warrior.
- The enemy catalog references typed idle assets for all 18 observed enemy definitions, including the three sequential Gold Slime boss encounters.
- `src/app/domain/assets.ts` centralizes music, sound, and item paths for future adapters.
- The active root UI uses idle character/enemy sprites and item images in character selection, ready/combat views, store cards, and owned-equipment panels. Observed Evil Tree and slime attack/defeat GIFs are now typed as optional enemy assets and selected during the corresponding provisional combat phases; all other enemies fall back to idle art. The application port triggers bundled attack, magic, coin, potion, error, and enemy-killed sounds plus character-select/dungeon/boss/store music lifecycle. Accessible music/effects volume controls now persist in the Angular preferences envelope; autoplay policy, failure handling, mute labels, player action/death animation coverage, and final animation timing remain unresolved.

## Asset coverage evidence

| Asset group                         | Retained files | Active typed/use boundary                                                                         | Remaining work                                             |
| ----------------------------------- | -------------: | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Character/enemy idle GIFs           |             21 | `CharacterDefinition.idleAsset`, `EnemyDefinition.idleAsset`, rendered in selection, ready, combat, and history views | Verify dimensions and accessibility presentation           |
| Item images                         |              3 | `STORE_ITEMS[].asset`, rendered in the store and owned-equipment panels                         | Provenance/license record                                  |
| Music tracks                        |              5 | `ASSET_MANIFEST.music`, application audio lifecycle                                               | Autoplay policy and failure handling                        |
| Sound effects                       |              7 | `ASSET_MANIFEST.sounds`, injectable `AudioPort`                                                   | Failure handling and final feedback policy                  |
| Additional sprite/animation sources |             75 | Retained in `static/`; no active contract for most spritesheets and character animations            | Map remaining states or explicitly classify as deferred     |

The counts above are repository observations from `static/`; rerun `find static/images -type f`, `find static/music -type f`, and `find static/sounds -type f` when assets change. `npm run verify:assets` checks the 48 active typed idle/animation/item/music/sound paths and the expected 75-file deferred image boundary in local and CI validation.

## Migration rules

1. Preserve asset paths or record an explicit replacement mapping.
2. Do not remove retained `static/` assets until the active Angular production output has been verified.
3. Classify each retained image as meaningful, decorative, or animation source and provide accessible text behavior at the UI boundary.
4. Verify audio loading, user-gesture policy, mute controls, reduced-motion behavior, and failure handling before release.
5. Complete provenance/licensing review before publishing retained or replacement assets.

## Deferred work

The full asset set is not yet mapped to every enemy, attack, death state, item, or UI surface. The exact 75 deferred files are cataloged in [the sprite-source register](assets-sprite-sources.md). That work belongs with combat, store, progression, and accessibility slices. See [TODO-012](TODO.md#todo-012-medium-asset-and-licensing-inventory) and [handoff](handoff.md).
