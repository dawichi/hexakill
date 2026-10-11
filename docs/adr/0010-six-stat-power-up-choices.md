# ADR-0010: Offer power-ups for all six combat stats

## Status

Accepted — 2026-10-11.

## Decision

Level-up power-ups may improve Health, Attack, Magic, Armor, Magic resist, or Speed. Armor and
Magic resist are selectable alongside the offensive and utility stats. Per-stat and total run caps
remain enforced by the domain.

Enemy intents vary by archetype: attack-focused enemies favor physical damage, magic-focused enemies
favor Magic, and tanks use Guard more often. Bosses use their own named patterns.

## Context

Counter-building was not possible while power-ups only raised Health, Attack, Magic, and Speed.
Visible enemy intents should make defensive choices understandable before a hit lands.

## Consequences

- Armor and Magic resist gain a clear role in progression and can answer different enemy profiles.
- Intent distribution and upgrade scaling need simulator coverage and ongoing balance review.
