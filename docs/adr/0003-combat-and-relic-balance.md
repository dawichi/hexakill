# ADR-0003: Use persistent health and passive relics for run balance

## Status

Accepted balance baseline — 2026-08-17. Character identity and starting stats are superseded by
[ADR-0006](0006-distinct-character-starts-and-passives.md); catalog data and power-up coverage are
updated by [ADR-0009](0009-catalog-driven-relic-effects.md) and
[ADR-0010](0010-six-stat-power-up-choices.md).

## Decision

Hexakill's combat loop uses persistent health across route encounters and passive relics purchased
from merchants. Relics modify actions, incoming damage, rewards, recovery, and selected maximum
stats. Their effects and tunable values live in the typed catalog.

Combat is intentionally predictable enough to support reading an enemy:

- Attack rolls between 85% and 115% of Attack, misses 5% of the time, and has a 10% critical
  chance at 1.5× damage.
- Magic rolls between 75% and 125% of Magic, misses 10% of the time, and has a 20% critical
  chance at 1.75× damage.
- Armor and Magic Resist use `damage × 100 / (100 + resistance)`.
- Regular enemy levels range from `floor(playerLevel / 2)` through `playerLevel + 1`.
- A potion restores 25% of maximum health and consumes the player's turn.
- Guard grants temporary Block derived from Armor and Magic Resist.
- Each enemy reveals an Attack, Magic, Guard, or Heal intent before acting; Magic can apply an
  Arcane mark that empowers the player's next Attack.
- The active catalog contains 30 Normal, Rare, and Epic relics. The first implementation includes
  action potentiators, additive Block, reactive damage, Venom, route reveal, recovery, economy,
  and emergency effects; the complete catalog and prices live in the [relic reference list](../features/relics-reference.md).

## Context

The experiment inherited highly volatile 30–200% magic rolls, a 25% magic miss chance, a 600
resistance denominator, and a shop that added large raw-stat bundles. Player damage also reset
when a new enemy spawned, making campfires and recovery effects cosmetic. Those rules made the
best action difficult to read and made the route map less meaningful.

## Consequences

- Defense and recovery are now visible strategic resources.
- The player can respond to a readable enemy intent with damage, Guard, or recovery instead of
  following a single highest-stat action heuristic.
- Temporary Block and the Arcane mark create short-lived combat decisions that are separate from
  permanent base stats.
- A damaged player must weigh a safe route, campfire, potion, or relic purchase against pushing
  forward.
- Distinct starting profiles and passives now shape character identity; relic choices create
  run-specific builds.
- The merchant can evolve toward Slay the Spire-style rotating offers without redesigning the
  combat state again.
- The numbers are a balance baseline, not final tuning; manual runs will determine whether enemy
  health, rewards, and relic prices need another pass.
