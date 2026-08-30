# Balance simulation lab

The active Angular root includes a deterministic, headless encounter simulator in
[`src/app/domain/balance-simulation.ts`](../src/app/domain/balance-simulation.ts). It reuses the
current combat rules, enemy intent policy, Guard/block behavior, Arcane mark behavior, and the
implemented relic triggers without starting Angular or the browser.

## Run it

From the repository root:

```sh
npm run simulate:balance
```

The default report runs 1,000 seeded encounters for each character, enemy scenario, and policy.
Use `BALANCE_SAMPLES` for a faster exploratory run or a larger batch:

```sh
BALANCE_SAMPLES=100 npm run simulate:balance
BALANCE_SAMPLES=10000 npm run simulate:balance
```

The command prints a human-readable table. The simulator API also returns structured summaries so
future tooling can write JSON/CSV reports without changing gameplay code.

## Policies

- `random` is a lower-quality baseline and helps reveal whether combat decisions matter.
- `class` follows each character's basic identity: Wizard prefers Magic, Samurai prefers Attack,
  and Warrior uses Guard against larger threats.
- `reactive` responds to visible enemy intent, health pressure, Hex, and potion value.
- `greedy` scores the immediate result of each legal action. It is a diagnostic upper-bound style
  policy, not a claim about how humans should play.

Policy choice randomness uses a separate seeded stream from combat randomness. This keeps the
damage, miss, critical, and intent rolls comparable when policies are compared with the same seed.

## What to inspect

The first report is intentionally encounter-focused. Useful signals include:

- Normal-fight win rate and average remaining health
- Elite-fight win rate and potion consumption
- Action rates, especially whether one action dominates
- Guard damage prevented and whether Guard is used against meaningful threats
- Differences between `class`, `reactive`, and `greedy` policies
- Draws at the turn cap, which can indicate defensive or healing stalls

Simulation output is evidence for balance decisions, not a replacement for human playtests. A
bot can expose a mathematical problem, while a human still needs to validate readability,
decision quality, and game feel.

## Full-run lab

The second command simulates the complete route loop, including combat rewards, level-ups,
power-ups, hidden doors, campfires, merchants, relic purchases, potion purchases, elite rooms, and
the three-boss completion condition:

```sh
npm run simulate:full-run
FULL_RUN_SAMPLES=1000 npm run simulate:full-run
```

The full-run report compares class and reactive combat policies against balanced, aggressive, and
safe route policies. Route policies only inspect revealed door kinds; hidden doors remain unknown
until selected. Rooms 10, 20, and 30 are fixed boss rooms; room 30 is the completion boundary.
Combat seeds, route rolls, and policy decisions are deterministic and reproducible.

Important full-run signals include completion rate, rooms survived, boss progress, relic count,
campfire/store frequency, gold spent, and final health. Completion means defeating all three
sequential Gold Slime bosses by room 30. The current pass uses a 15% elite stat premium and
provisional boss levels 8, 12, and 16. Reactive policies now produce non-zero three-boss completion
for Wizard and Samurai in the seeded baseline, while Warrior and class-only policies still need
tuning. That is an investigation signal—not a final balance verdict—because route heuristics,
fixed-room pressure, and the boss curve all affect it.

## Current scope and next layer

The milestone boss curve is currently level 8, 12, and 16 for rooms 10, 20, and 30 respectively;
these levels are provisional targets chosen to keep the fixed rooms reachable while preserving
escalation. The lab now covers single encounters and full runs. It does not yet model human telemetry, event
rooms, a learned policy, or confidence intervals/CSV export. Those should come after we establish
the intended normal/elite/boss difficulty targets from the current report and manual playtests.
