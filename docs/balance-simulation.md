# Balance simulation

The simulator in `src/sim/simulation.ts` runs seeded 30-room expeditions through the same run and
combat domain used by the game. It varies class, combat policy, and route policy, then reports win
rate, rooms cleared, final level and health, relics, bosses, and boss-room deaths.

## Run it

```sh
bun run simulate:full-run
SIM_SAMPLES=100 SIM_SEED=42 bun run simulate:full-run
SIM_SAMPLES=100 SIM_SEED=42 SIM_RELICS=1 bun run simulate:full-run
```

`SIM_SAMPLES` controls the number of runs per report cell (default `200`). `SIM_SEED` sets the
reproducible batch seed (default `42`). `SIM_RELICS=1` adds a table showing the win-rate change
when each relic is owned from the start. That sensitivity pass leaves the starting gold unchanged;
it does not measure purchase timing or cost.

## Reading the report

- `class` chooses the strongest expected strike and uses class-specific Guard or Potion decisions.
- `reactive` responds to visible incoming damage and health pressure.
- `balanced`, `aggressive`, and `safe` choose routes using different risk and recovery preferences.
- Relic impact is a simulated sensitivity check, not a price recommendation.

With 100 samples per cell and seed `42`, the average win rates across the six combat/route policy
pairs were Wizard **58.3%**, Samurai **51.0%**, and Warrior **59.8%**. Balanced-route class
policies ranged from 70–81% by class, while aggressive routes ranged from 32–55%. This spread
shows that route choice matters substantially. These are deterministic bot results, not player
telemetry or a final difficulty target; human play is still needed to judge whether risks and
rewards feel fair.

The report uses a 150-turn combat cap. A capped fight is reported as stalled and does not count as
a win. Boss levels are fixed at 9, 16, and 22. Compare reports with the same seed when changing a
rule, and explain differences caused by the changed rule before adjusting a regression threshold.

The simulator does not launch Angular or depend on browser storage. Its route and combat policies
live in `src/sim/`; game rules remain in `src/app/domain/`.
