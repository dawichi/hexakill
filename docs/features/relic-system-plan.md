# Relic system redesign plan

**Status:** Proposed design — documentation only. No gameplay implementation has started.

## Why the current relic model is being replaced

The current six-item merchant is a useful prototype, but it mostly provides permanent percentage
modifiers: more Attack, more Magic, less damage, more healing, or more gold. That makes a purchase
feel like a stat upgrade instead of a build decision.

The replacement should make each relic change the way a run is played. A strong relic should make
the player ask a different question in combat:

- Can I build around Block and punish enemies for attacking?
- Should I apply Arcane mark now or save it for a stronger Attack?
- Can I deliberately play at low health to activate a dangerous bonus?
- Is this route safe enough to exploit an economy relic?
- Does this relic make Guard, Magic, Attack, or Potions part of a different strategy?

The proposed catalog is in the [relic reference list](relics-reference.md).

## Design goals

1. Replace the current relic pool entirely. The existing Whetstone, Arcane Lens, Ironbark, Blood
   Chalice, Gilded Eye, and Alchemist Flask are prototype references only and should not remain in
   the final pool.
2. Give every relic one memorable sentence and one clear gameplay trigger.
3. Keep permanent raw-stat bonuses limited. Most power should come from timing, triggers,
   conversion, Block, damage-over-time, route decisions, or resource management.
4. Make quality meaningful without making Normal relics boring. Normal items should define a small
   direction; Rare items should create a build engine; Epic items should reshape a run.
5. Keep relic effects readable in the combat UI. Every active effect needs a short status label,
   a tooltip, and a visible feedback message when it triggers.
6. Make store offers exciting but constrained. Players should choose between several plausible
   builds instead of waiting for one mandatory item.

## Proposed quality tiers

| Quality | Role                  |     Target price | Design expectation                                                                     |
| ------- | --------------------- | ---------------: | -------------------------------------------------------------------------------------- |
| Normal  | Reliable foundation   |     350–550 gold | Small, legible effect that is useful in most runs or strongly supports one action.     |
| Rare    | Build-defining engine |     700–950 gold | Stronger trigger, conversion, or synergy that rewards a deliberate play pattern.       |
| Epic    | Run-shaping identity  | 1,250–1,650 gold | A powerful rule change, emergency effect, or long-term engine with a meaningful limit. |

Prices are starting hypotheses for the current 2,000-gold opening economy. They should be tuned
with the balance simulator after the new rules exist. Epic relics should be powerful because they
are scarce, not because they simply multiply every stat.

## Proposed Block model

Hexakill already has Guard and temporary Block in the combat state. The redesign should make it a
first-class combat resource with a clearer contract:

1. `Guard` grants the character's base Block: `floor((Armor + Magic Resist) / 2)`, plus any relic
   bonuses. Additional Block grants add to the existing pool.
2. Block is shown beside health as a temporary shield value. It reduces damage after resistance
   and incoming-damage modifiers, before health is reduced.
3. Block protects against the owner's next incoming action. For the player, that means the enemy's
   upcoming action; for the enemy, that means the player's upcoming action.
4. Any unused Block expires when its owner's next turn begins. Block never persists between rooms.
5. Relics may grant Block outside Guard, improve Block, retain part of it, or trigger when it
   absorbs damage. Each of those effects must state its timing explicitly.
6. A Blocked result should still communicate the incoming action and the amount absorbed. A fully
   blocked hit deals zero health damage but still counts as an enemy action for timing effects.

This keeps the Pokémon-like readability of “the enemy is about to hit” while adding the Slay the
Spire decision of whether to spend the turn defending, building a shield, or taking a risk.

## Effect vocabulary for implementation

The implementation should standardize trigger timing before relics are connected to the store.
These names are intentionally product language, not a final TypeScript API:

| Trigger                 | Meaning                                                                                 |
| ----------------------- | --------------------------------------------------------------------------------------- |
| Start of combat         | Fires once when an encounter begins.                                                    |
| Start of player turn    | Fires before the player chooses an action.                                              |
| Start of enemy turn     | Fires after the player action and before the revealed enemy intent resolves.            |
| After Attack            | Fires after Attack resolves, including a miss/blocked result only if the relic says so. |
| After Magic             | Fires after Magic resolves.                                                             |
| After Block absorbs     | Fires when Block prevents at least one point of health damage.                          |
| Below health threshold  | Checks current health before the action is selected.                                    |
| First time each combat  | A one-charge encounter trigger.                                                         |
| Every Nth action        | A counter reset when the encounter ends.                                                |
| After victory           | Fires after rewards are calculated and before the next route.                           |
| On entering a store/map | A route-level trigger, never a combat trigger.                                          |

Relic damage should be effect damage rather than a second Attack/Magic roll: it should not crit or
miss, and its description must say whether it ignores resistance or Block. The default should be
resistance-aware and Blockable; bypassing either defense must be exceptional and explicit.

## Store offer plan

The merchant should stop showing the entire catalog. Each visit creates a fresh offer from relics
the player does not own, using a seeded random source so runs can be reproduced in the balance lab.
Potions can remain a separate repeatable consumable offer below the relic row.

| Store phase | Relic offers | Guaranteed Normal | Special slots | Special-slot roll   |
| ----------- | -----------: | ----------------: | ------------: | ------------------- |
| Early       |            4 |                 2 |             2 | 75% Rare / 25% Epic |
| Mid         |            6 |                 3 |             3 | 75% Rare / 25% Epic |
| Late        |            8 |                 4 |             4 | 75% Rare / 25% Epic |

This produces mostly Normal items, usually 1–3 Rares, and an Epic in approximately half of
ordinary stores once the player reaches the 6-offer phase. The exact phase thresholds should be
based on route floor rather than player level so the store cannot be farmed by grinding.

Offer rules:

- Never show a relic the player already owns.
- Never show duplicate relics in one store.
- If the pool has insufficient items in a tier, fill the slot from the next available tier rather
  than producing an empty offer.
- The store may show an unaffordable item; its price and effect remain visible so the player can
  plan for a future visit.
- A merchant can optionally offer one “featured” item with a small price reduction, but discounts
  should be deferred until the basic rotation is balanced.
- Store relics use Lucide icons initially. Art assets can be added later without changing the
  effect or inventory contract.

## Implementation order after approval

1. Replace the current item effect union with an explicit relic-effect vocabulary and a versioned
   inventory migration policy.
2. Finalize Block expiration and trigger timing in pure combat tests.
3. Implement the relic catalog as data, including quality, price, icon name, and typed effect.
4. Add one trigger at a time, starting with direct damage, Block grants, and action potentiators.
5. Replace the full-pool merchant with seeded tiered offers.
6. Add combat feedback and tooltips for every trigger.
7. Update the encounter and full-run simulators with relic policies and trigger metrics.
8. Tune prices, tier weights, and effect magnitudes using simulation plus human runs.

The catalog is intentionally a proposal. No item should be considered balanced or implemented
until its trigger can be tested independently and its UI feedback is understandable in a real
combat.
