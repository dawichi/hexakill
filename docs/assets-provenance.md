# Asset Provenance Register

**Status:** Inventory complete at repository level; source, license, and attribution remain unknown pending owner confirmation.

This register is intentionally conservative. A file being committed to this repository, referenced by the historical Svelte application, or used by the Angular rewrite does not prove copyright ownership, license permission, attribution requirements, or redistribution rights.

## Evidence currently available

- Tracked asset inventory: 111 image files, 5 music tracks, and 7 sound effects under `static/`.
- Formats and dimensions vary across GIF, PNG, MP3, and WAV files; sprite sheets contain multiple frame layouts and are not interchangeable with the active idle/animation paths.
- No tracked root `LICENSE`, `COPYING`, or per-asset license file exists in the checkout.
- The historical README advertised an MIT badge/claim, but that is not sufficient evidence for bundled media rights and does not replace a tracked license file.
- Archived Svelte HTML referenced Bootstrap Icons, Animate.css, and Iconify from CDNs. The active Angular `src/index.html` references local favicon/assets only; archived CDN dependencies are historical evidence, not active media provenance.
- Git history records repository commits that added or retained asset files, but no authoritative upstream source or license metadata was found in those commits.

## Register by asset group

| Group                                         | Repository paths                                                                                                                                                                                                                                     | Active use                                                                                                            | Source / license / attribution                              | Release state                                                  |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------- |
| Character and enemy idle GIFs                 | `static/images/**/idle.gif`                                                                                                                                                                                                                          | Typed and rendered in Angular                                                                                         | Unknown; owner confirmation required                        | Retained for review; do not make a public rights claim         |
| Observed attack/defeat GIFs and attack strips | `static/images/evil-tree/`, `static/images/slime-*/`, `static/images/{evil-wizard,fire-worm,martial-hero,wild-huntress}/`, `static/images/witch-blue/assets/`                                                                                        | Typed and used for provisional enemy phases, including Witch Blue's charge strip for Magic                            | Unknown; owner confirmation required                        | Retained for review; do not make a public rights claim         |
| Item images                                   | `static/images/items/`                                                                                                                                                                                                                               | Typed and rendered in the store                                                                                       | Unknown; owner confirmation required                        | Retained for review; do not make a public rights claim         |
| Provisional player action strips              | `static/images/wizard/sprites/Attack1.png`; `static/images/wizard/sprites/Attack2.png`; `static/images/samurai/Sprites/Attack1.png`; `static/images/samurai/Sprites/Attack2.png`                                                                     | Typed with observed single-row geometry; Attack1 is rendered for physical actions and Attack2 provisionally for Magic | Unknown; owner confirmation required                        | Retained for review; do not make a public rights claim         |
| Provisional player defeat strips              | `static/images/wizard/sprites/Death.png`; `static/images/samurai/Sprites/Death.png`                                                                                                                                                                  | Typed with observed single-row geometry and rendered on the game-over surface                                         | Unknown; owner confirmation required                        | Retained for review; do not make a public rights claim         |
| Provisional enemy defeat strips               | `static/images/wild-huntress/sprites/Death.png`; `static/images/evil-wizard/sprites/Death.png`; `static/images/fire-worm/Sprites/Worm/Death.png`; `static/images/martial-hero/Sprite/Death.png`; `static/images/witch-blue/assets/B_witch_death.png` | Typed with observed geometry and rendered during provisional defeat states                                            | Unknown; owner confirmation required                        | Retained for review; do not make a public rights claim         |
| Sprite sheets and alternate animation sources | Remaining `static/images/` files; see [the exact source catalog](assets-sprite-sources.md)                                                                                                                                                           | Not yet mapped to an accepted runtime contract                                                                        | Unknown; source/license review also required before mapping | Deferred; do not delete or publish as replacements             |
| Music                                         | `static/music/`                                                                                                                                                                                                                                      | Typed; lifecycle includes character select, dungeon, boss, and store                                                  | Unknown; owner confirmation required                        | Retained for review; verify autoplay and redistribution rights |
| Sound effects                                 | `static/sounds/`                                                                                                                                                                                                                                     | Typed and played through `AudioPort`                                                                                  | Unknown; owner confirmation required                        | Retained for review; verify redistribution rights              |

## Required owner input before release

For every retained or replacement group, record the original source, license or permission basis, attribution text, author/creator, and any restrictions. If the information cannot be recovered, the release decision must explicitly choose replacement, removal, or written permission before public deployment.

Until that decision exists, future agents may validate paths and implement narrow observed behavior, but must not remove provenance warnings, add an ownership claim, or publish the assets as cleared media.

## Verification commands

```sh
find static/images -type f
find static/music -type f
find static/sounds -type f
npm run verify:assets
```

The commands verify repository presence and active-path integrity only. They do not verify copyright, licensing, attribution, or originality.
