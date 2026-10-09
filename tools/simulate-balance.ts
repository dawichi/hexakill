import {
  DEFAULT_BALANCE_SCENARIOS,
  formatBalanceReport,
  formatRelicBalanceReport,
  runBalanceReport,
  runRelicBalanceReport,
  STORE_ITEMS,
} from '../src/app/domain/balance-simulation';

const env = process.env;
const samples = Number(env['BALANCE_SAMPLES'] ?? 1_000);
console.log(formatBalanceReport(runBalanceReport({ samplesPerCell: samples })));

if (env['BALANCE_RELIC_MATRIX'] === '1') {
  const relicIds = env['BALANCE_RELICS']?.split(',');
  const relics = relicIds ? STORE_ITEMS.filter((item) => relicIds.includes(item.id)) : undefined;
  const scenarios =
    env['BALANCE_RELIC_HARD'] === '1'
      ? DEFAULT_BALANCE_SCENARIOS.map((scenario) => ({
          ...scenario,
          enemyLevel: scenario.elite ? 4 : 5,
        }))
      : undefined;
  console.log();
  console.log(
    formatRelicBalanceReport(runRelicBalanceReport({ samplesPerCell: samples, scenarios, relics })),
  );
}
