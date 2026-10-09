import {
  type FullRunReport,
  formatFullRunReport,
  runFullRunReport,
  STORE_ITEMS,
} from '../src/app/domain/full-run-simulation';

const env = process.env;
const samples = Number(env['FULL_RUN_SAMPLES'] ?? 200);
const maxCombatTurns = Number(env['FULL_RUN_MAX_COMBAT_TURNS'] ?? 100);
console.log(formatFullRunReport(runFullRunReport({ samplesPerCell: samples, maxCombatTurns })));

if (env['FULL_RUN_RELIC_MATRIX'] === '1') {
  const characters = ['Wizard', 'Samurai', 'Warrior'];
  const completionFor = (report: FullRunReport, character: string): number => {
    const summaries = report.summaries.filter((summary) => summary.character === character);
    return (
      summaries.reduce((total, summary) => total + summary.completionRate, 0) / summaries.length
    );
  };
  console.log();
  console.log('Relic full-run impact (starting relic, price excluded)');
  console.log(`${'Relic'.padEnd(28)} ${characters.map((name) => name.padStart(7)).join(' ')}`);
  for (const relic of STORE_ITEMS) {
    const report = runFullRunReport({
      samplesPerCell: samples,
      maxCombatTurns,
      startingRelicIds: [relic.id],
    });
    const values = characters.map((character) => completionFor(report, character));
    console.log(
      `${relic.name.padEnd(28)} ${values.map((value) => `${(value * 100).toFixed(1)}%`.padStart(7)).join(' ')}`,
    );
  }
}
