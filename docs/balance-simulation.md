# Balance simulation lab

The active Angular root includes a deterministic, headless encounter simulator in
[`src/app/domain/balance-simulation.ts`](../src/app/domain/balance-simulation.ts). It reuses the
current combat rules, enemy intent policy, Guard/block behavior, Arcane mark behavior, and relic
modifiers without starting Angular or the browser.

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

## Current scope

The first version simulates single encounters. It does not yet model route selection, campfires,
merchant purchases, relic acquisition, or full-run completion. Those should be added only after the
encounter report gives us a stable combat baseline.
