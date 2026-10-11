# ADR-0007: Give milestone bosses distinct identities and move patterns

## Status

Accepted — 2026-10-11. Supersedes the Gold Slime identities in ADR-0004.

## Decision

Keep the fixed rooms from ADR-0004 and use three distinct guardians:

| Room | Boss | Current level | Signature pattern |
| ---: | --- | ---: | --- |
| 10 | Fire Knight | 9 | Telegraphs a charge, then uses Inferno Strike. |
| 20 | Water Priestess | 16 | Tidal Barrage hits three times; each hit meets Block separately. |
| 30 | Bringer of Death | 22 | Reaping Scythe hits twice and, below half Health, telegraphs a heavy charged strike. |

Names, portraits, sprite strips, intent labels, music selection, and end-of-run copy use the same
boss definitions. The current levels and multipliers are balance inputs and may change with
simulator evidence.

## Context

The 30-room structure had three visually identical Gold Slime bosses, making the end of a run feel
like a recolored repeat. The existing enemy intent model can make boss mechanics visible and
predictable without adding another combat framework.

## Consequences

- Each milestone has its own art, telegraph, and combat rhythm.
- Charge turns give Guard a clear use; multi-hit turns consume Block on each hit.
- Boss assets remain subject to the unresolved source and license review in
  the [README credits note](../../README.md#asset-credits-and-licensing).
- The simulator and balance report must model boss transitions and identify wins by boss schedule.
