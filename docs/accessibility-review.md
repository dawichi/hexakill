# Accessibility Review Record

**Status:** Static and automated review recorded 2026-08-15; manual assistive-technology review remains open.

This record separates evidence that can be verified from source and automated browser journeys from evidence that still requires a person using assistive technology or visual inspection.

## Verified in the active Angular root

- Core actions use native buttons, the player name uses a label, volume controls use labels, and status/error feedback uses `role="status"` or `role="alert"`.
- Music and effects sliders expose a human-readable `aria-valuetext` and retain their values through the versioned preferences envelope.
- Dynamic validation, combat, store, and game-over messages use atomic status/alert regions so assistive technology receives the complete updated message.
- Screen headings have programmatic focus targets. The browser suite verifies focus after welcome navigation, store entry/return, combat entry, power-up selection, game-over, reset, and keyboard activation.
- The suite verifies reduced-motion behavior and no horizontal overflow at a 360px viewport.
- Character-selection art is decorative in context and is hidden from the accessibility tree; character, enemy, item, and history art that conveys entity identity has text alternatives.
- A native `<details>` disclosure provides the current “How to play” content without a custom dialog or pointer-only interaction.

## Static contrast evidence

The following foreground/background pairs were calculated from the active CSS using the WCAG relative-luminance contrast formula. They are representative of the rendered text roles, not a substitute for a rendered visual review.

| Role | Foreground | Background | Contrast |
| ---- | ---------- | ---------- | -------: |
| Body text | `#f4f4f5` | `#09090b` | 18.10:1 |
| Muted/supporting text | `#a1a1aa` | `#27272a` | 5.81:1 |
| Primary-button text | `#fafafa` | `#0891b2` | 4.81:1 |
| Combat/status message | `#cffafe` | `#164e63` | 8.14:1 |
| Power-up/store emphasis | `#fde68a` | `#422006` | 11.70:1 |
| Keyboard focus outline | `#67e8f9` | `#09090b` | 13.73:1 |

Disabled controls use reduced opacity and must be reviewed separately for discoverability and whether the disabled state is understandable without relying on color.

## Rendered browser smoke review

The local Angular preview was inspected at 1280×800 and 360×800 on 2026-08-15. Welcome, character selection, ready, combat, store, and game-over surfaces rendered without horizontal overflow. The browser accessibility tree exposed native slider, button, disclosure, status, alert, meter, heading, and labelled-region roles; focus moved to the relevant screen heading after navigation, store return, and game-over transitions. The Wizard and Samurai player-action strips are covered by the browser journeys; the Wizard strip was also reached during the manual combat flow. Their timing and final semantic treatment remain provisional. A synthetic 2× CSS layout check at a 640px viewport also reported equal document/client widths. This is browser smoke evidence, not a substitute for using a screen reader or operating-system zoom/high-contrast modes.

## Still required before release

- Test the complete run with a screen reader, including focus order, announcements for combat results, enemy health, power-up availability, and game-over history.
- Verify focus visibility and logical order at desktop, 360px, browser zoom 200%, and text-only/high-contrast operating-system settings.
- Review animated GIFs and any future sprite-sheet animations for reduced-motion behavior, meaningful alternative text, and whether animation conveys state that needs a text equivalent.
- Retain screenshots or a dated manual checklist when the review is completed.

The remaining work is tracked in [TODO-011](TODO.md#todo-011-medium-accessibility-critical-journey-contract) and [TODO-012](TODO.md#todo-012-medium-asset-and-licensing-inventory).
