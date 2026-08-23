# ADR-0003: Use persistent health and passive relics for run balance

## Status

Accepted for the gameplay prototype — 2026-08-17

## Decision

Hexakill's combat loop uses persistent health across route encounters and a small set of passive
relics purchased from merchants. Relics modify actions, incoming damage, rewards, or recovery;
they do not directly modify the character's base stat row.

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
- Whetstone improves Attack damage and Guard breaking; Arcane Lens improves Magic damage and
  Arcane mark damage; Ironbark improves the player's Guard block as well as reducing incoming
  damage.

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
- Character identity remains in the base stats and attack/magic preference, while relic choices
  create run-specific builds.
- The merchant can evolve toward Slay the Spire-style rotating offers without redesigning the
  combat state again.
- The numbers are a balance baseline, not final tuning; manual runs will determine whether enemy
  health, rewards, and relic prices need another pass.
