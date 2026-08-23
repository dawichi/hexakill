# Accessibility Review Record

**Status:** Static and automated review recorded 2026-08-15; manual assistive-technology review remains open.

This record separates evidence that can be verified from source and automated browser journeys from evidence that still requires a person using assistive technology or visual inspection.

## Verified in the active Angular root

- Core actions use native buttons, the player name uses a label, volume controls use labels, and status/error feedback uses `role="status"` or `role="alert"`.
- The document has a keyboard skip link targeting the focusable game-content main landmark; the component and browser suites verify its target contract and keyboard activation.
- Music and effects sliders expose a human-readable `aria-valuetext` and retain their values through the versioned preferences envelope.
- Dynamic validation, combat callouts, store, and game-over messages use atomic status/alert regions so assistive technology receives the complete updated message. Combat also exposes enemy intent, Guard/Block feedback, Arcane mark explanations, and delayed health presentation through text callouts rather than visual effects alone.
- Screen headings have programmatic focus targets. The browser suite verifies focus after welcome navigation, store entry/return, route-map entry, combat entry, power-up selection, game-over, reset, and keyboard activation.
- The suite verifies reduced-motion behavior and no horizontal overflow at a 360px viewport across welcome, character selection, route map, and combat.
- Character-selection art is decorative in context and is hidden from the accessibility tree; character, enemy, item, and history art that conveys entity identity has text alternatives.
- Character-selection stat modifiers use a shared icon-and-color chip component; each chip exposes its full stat name and value through an accessible label, so the compact visual language does not rely on color or icon recognition alone.
- The welcome screen keeps its “How to play” field manual visible by default; stat chips expose their full labels and values through accessible text rather than relying on color or icon recognition alone.

## Static contrast evidence

The following foreground/background pairs were calculated from the active CSS using the WCAG relative-luminance contrast formula. They are representative of the rendered text roles, not a substitute for a rendered visual review.

| Role                    | Foreground | Background | Contrast |
| ----------------------- | ---------- | ---------- | -------: |
| Body text               | `#f4f4f5`  | `#09090b`  |  18.10:1 |
| Muted/supporting text   | `#a1a1aa`  | `#27272a`  |   5.81:1 |
| Primary-button text     | `#fafafa`  | `#0891b2`  |   4.81:1 |
| Combat/status message   | `#cffafe`  | `#164e63`  |   8.14:1 |
| Power-up/store emphasis | `#fde68a`  | `#422006`  |  11.70:1 |
| Keyboard focus outline  | `#67e8f9`  | `#09090b`  |  13.73:1 |

Disabled controls use reduced opacity and must be reviewed separately for discoverability and whether the disabled state is understandable without relying on color.

## Rendered browser smoke review

The local Angular preview was inspected at 1280×800 and 360×800 on 2026-08-16. Welcome, character selection, store, and combat surfaces rendered without horizontal overflow. Semantic evaluation exposed native slider, button, status, meter, progressbar, heading, and labelled-control roles; screen headings received programmatic focus after navigation; entity images loaded with their expected alternative text; both combat health meters and the player experience progressbar exposed bounded current/max values; and a focused combat button exposed a 3px cyan outline with a 3px offset. The Wizard, Samurai, and Witch Blue action-strip journeys are covered by the browser suite; Witch Blue's Magic charge strip is now covered as well. Their timing and final semantic treatment remain provisional. A synthetic 2× CSS layout check at a 640px viewport also reported equal document/client widths. This is rendered semantic smoke evidence, not a substitute for using a screen reader or operating-system zoom/high-contrast modes.

A follow-up shared-preview semantic snapshot was attempted on 2026-08-16 after the deployment-preview hardening work, but the snapshot endpoint did not return. A fresh direct semantic inspection on a separate live dev-server port succeeded at both 1280×800 and 360×800 and confirmed the expected focusable headings, labelled volume/name controls, native character/store/combat buttons, bounded enemy meter, loaded identity-image alternatives, focus styling, and no horizontal overflow. This remains DOM/semantics evidence, not a substitute for a screenshot-based visual review or a screen-reader audit.

## Still required before release

- Test the complete run with a screen reader, including focus order, announcements for combat results, enemy health, power-up availability, and game-over history.
- Verify focus visibility and logical order at desktop, 360px, browser zoom 200%, and text-only/high-contrast operating-system settings.
- Review animated GIFs and any future sprite-sheet animations for reduced-motion behavior, meaningful alternative text, and whether animation conveys state that needs a text equivalent.
- Retain screenshots or a dated manual checklist when the review is completed.

The remaining work is tracked in [TODO-011](TODO.md#todo-011-medium-accessibility-critical-journey-contract) and [TODO-012](TODO.md#todo-012-medium-asset-and-licensing-inventory).
