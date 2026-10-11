import { CHARACTERS } from '../src/app/domain/characters';
import { RELIC_IDS, RELICS } from '../src/app/domain/relics';
import { classWinRates, formatReport, runReport } from '../src/sim/simulation';

const env = process.env;
const samples = Number(env['SIM_SAMPLES'] ?? 200);
const seed = Number(env['SIM_SEED'] ?? 42);

const summaries = runReport({ samples, seed });
console.log(`Hexakill balance lab · ${samples} runs per cell · seed ${seed}`);
console.log(formatReport(summaries));
const rates = classWinRates(summaries);
console.log(
  `\nClass win rate: ${CHARACTERS.map((c) => `${c.name} ${(rates[c.id] * 100).toFixed(1)}%`).join(' · ')}`,
);

if (env['SIM_RELICS'] === '1') {
  console.log('\nRelic impact (relic owned from the start, class/balanced policy)');
  console.log(`${'Relic'.padEnd(24)} ${CHARACTERS.map((c) => c.name.padStart(8)).join(' ')}`);
  const baseline = classWinRates(
    runReport({ samples, seed, combatPolicies: ['class'], routePolicies: ['balanced'] }),
  );
  for (const id of RELIC_IDS) {
    const rates = classWinRates(
      runReport({
        samples,
        seed,
        combatPolicies: ['class'],
        routePolicies: ['balanced'],
        startingRelics: [id],
      }),
    );
    const cells = CHARACTERS.map((c) => {
      const delta = (rates[c.id] - baseline[c.id]) * 100;
      return `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}`.padStart(8);
    });
    console.log(`${RELICS[id].name.padEnd(24)} ${cells.join(' ')}`);
  }
}
