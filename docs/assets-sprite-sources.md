# Deferred Sprite and Animation Sources

**Status:** Repository catalog, reviewed 2026-08-15. These files are retained historical assets, not approved runtime mappings.

The 75 files below are present under `static/images/` but are not part of the active 48-path Angular asset contract. Most are sprite strips or sheets. Rendering one directly with `<img>` would display the full strip rather than an intentional animation, so frame geometry, timing, state semantics, accessibility behavior, and provenance must be reviewed before mapping them.

| Family | Count | Retained files | Current disposition |
| --- | ---: | --- | --- |
| Adventurer | 1 | `adventurer/adventurer-v1.5-Sheet.png` | Deferred sheet extraction |
| Archer | 2 | `archer/run.gif`; `archer/spritesheet.png` | Deferred alternate/run states |
| Armored huntress | 2 | `armored-huntress/Warrior_Sheet-Effect.png`; `armored-huntress/Warrior_SheetnoEffect.png` | Deferred sheet/effect comparison |
| Bringer of death | 2 | `bringer-of-death/Bringer-of-Death-SpritSheet.png`; `bringer-of-death/Bringer-of-Death-SpritSheet_no-Effect.png` | Deferred sheet/effect comparison |
| Evil tree | 1 | `evil-tree/eviltree.png` | Deferred source image; GIF states are active separately |
| Evil Wizard | 8 | `evil-wizard/sprites/Attack1.png`; `Attack2.png`; `Death.png`; `Fall.png`; `Idle.png`; `Jump.png`; `Run.png`; `Take hit.png` | Deferred frame extraction |
| Fire knight | 1 | `fire-knight/FireKnight spritesheet.png` | Deferred sheet extraction |
| Fire worm | 7 | `fire-worm/Sprites/Fire Ball/Explosion.png`; `Move.png`; `Worm/Attack.png`; `Death.png`; `Get Hit.png`; `Idle.png`; `Walk.png` | Deferred character/projectile states |
| Knight | 1 | `knight/idle.png` | Deferred alternate idle source; GIF idle is active |
| Martial Hero | 9 | `martial-hero/Sprite/Attack1.png`; `Attack2.png`; `Attack3.png`; `Death.png`; `Going Down.png`; `Going Up.png`; `Idle.png`; `Run.png`; `Take Hit.png` | Deferred frame extraction |
| Samurai | 9 | `samurai/Sprites/Attack1.png`; `Attack2.png`; `Death.png`; `Fall.png`; `Idle.png`; `Jump.png`; `Run.png`; `Take Hit - white silhouette.png`; `Take Hit.png` | Deferred player animation states |
| Slime Blue | 1 | `slime-blue/blue.png` | Deferred alternate source; GIF states are active separately |
| Slime Gold | 1 | `slime-gold/slime-gold.png` | Deferred alternate source; GIF states are active separately |
| Slime Green | 1 | `slime-green/slime-green.png` | Deferred alternate source; GIF states are active separately |
| Slime Purple | 1 | `slime-purple/slime-purple.png` | Deferred alternate source; GIF states are active separately |
| Slime Red | 1 | `slime-red/slime-red.png` | Deferred alternate source; GIF states are active separately |
| Water Priestess | 1 | `water-priestess/WaterPriestess_SpriteSheet.png` | Deferred sheet extraction |
| Wild Huntress | 11 | `wild-huntress/sprites/Attack1.png`; `Attack2.png`; `Attack3.png`; `Death.png`; `Fall.png`; `Idle.png`; `Jump.png`; `Run.png`; `Spear move.png`; `Spear.png`; `Take hit.png` | Deferred frame/projectile extraction |
| Witch Blue | 7 | `witch-blue/assets/B_witch.gif`; `B_witch_attack.png`; `B_witch_charge.png`; `B_witch_death.png`; `B_witch_idle.png`; `B_witch_run.png`; `B_witch_take_damage.png` | Deferred vertical-strip states |
| Wizard | 8 | `wizard/sprites/Attack1.png`; `Attack2.png`; `Death.png`; `Fall.png`; `Hit.png`; `Idle.png`; `Jump.png`; `Run.png` | Deferred player animation states |

## Mapping requirements

Before a family becomes active, record:

1. Frame dimensions, frame count, row/column layout, and playback timing from the actual file.
2. The domain state that uses it (`idle`, `attack`, `defeat`, hit reaction, projectile, or UI decoration).
3. A typed manifest mapping and a browser assertion against the built artifact.
4. Reduced-motion and non-visual behavior for the animation.
5. Source, license, attribution, and release permission in [the provenance register](assets-provenance.md).

Do not delete these files merely because they are deferred. Re-run `find static/images -type f` and `npm run verify:assets` after any asset change; the latter intentionally checks only active paths.
