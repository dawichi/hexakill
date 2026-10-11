# ADR-0006: Give each character a distinct starting profile and passive

## Status

Accepted — 2026-10-11. Supersedes ADR-0002's equal starting-stat rule.

## Decision

Characters start at level 4 with half of their stat modifier applied to the legacy level-scaled
baseline:

```text
starting stat = round(BASE_STAT × 4 × (1 + (character modifier − 1) × 0.5))
```

Level-up gains continue to apply the full class modifier. Each character also has one passive:

- **Wizard — Spellweaver:** Magic ignores 15% of enemy Magic resist.
- **Samurai — Iaijutsu:** wins Speed ties and Attacks gain 20% critical chance.
- **Warrior — Bulwark:** Guard grants 50% more Block; Block that absorbs damage retaliates for 15%
  of the absorbed amount.

Character selection shows the actual starting stats and the passive text. The existing five potions,
2,000 starting gold, and level 4 remain shared across classes.

## Context

Equal starting stats made class choice cosmetic in opening fights and made the class descriptions
untrue. Applying full modifiers at level 4 would create larger swings, so the starting formula uses
half weight while later growth keeps the established full modifier.

## Consequences

- Early encounters vary by class before a level-up occurs.
- Enemy balance and class win-rate reports must account for the starting profiles and passives.
- Exact stat values are generated from `characters.ts`; UI text reads that same definition.
- The balance simulator is evidence for tuning, not a replacement for manual play.
