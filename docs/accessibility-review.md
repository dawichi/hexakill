# Accessibility Review Record

**Status:** Static and automated review recorded 2026-08-15; manual assistive-technology review remains open.

This record separates evidence that can be verified from source and automated browser journeys from evidence that still requires a person using assistive technology or visual inspection.

## Verified in the active Angular root

- Core actions use native buttons, the player name uses a label, volume controls use labels, and status/error feedback uses `role="status"` or `role="alert"`.
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

## Still required before release

- Test the complete run with a screen reader, including focus order, announcements for combat results, enemy health, power-up availability, and game-over history.
- Verify focus visibility and logical order at desktop, 360px, browser zoom 200%, and text-only/high-contrast operating-system settings.
- Review animated GIFs and any future sprite-sheet animations for reduced-motion behavior, meaningful alternative text, and whether animation conveys state that needs a text equivalent.
- Retain screenshots or a dated manual checklist when the review is completed.

The remaining work is tracked in [TODO-011](TODO.md#todo-011-medium-accessibility-critical-journey-contract) and [TODO-012](TODO.md#todo-012-medium-asset-and-licensing-inventory).
