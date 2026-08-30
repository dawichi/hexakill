import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const temporaryDirectory = await mkdtemp(join(tmpdir(), 'hexakill-balance-'));
const outputFile = join(temporaryDirectory, 'balance-simulation.mjs');

try {
  await build({
    entryPoints: [join(root, 'src/app/domain/balance-simulation.ts')],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node24',
    outfile: outputFile,
    logLevel: 'silent',
  });

  const simulation = await import(pathToFileURL(outputFile).href);
  const samples = Number(process.env['BALANCE_SAMPLES'] ?? 1_000);
  const report = simulation.runBalanceReport({ samplesPerCell: samples });
  console.log(simulation.formatBalanceReport(report));

  if (process.env['BALANCE_RELIC_MATRIX'] === '1') {
    const relics = process.env['BALANCE_RELICS']
      ? simulation.STORE_ITEMS.filter((item) =>
          process.env['BALANCE_RELICS'].split(',').includes(item.id),
        )
      : undefined;
    const scenarios =
      process.env['BALANCE_RELIC_HARD'] === '1'
        ? simulation.DEFAULT_BALANCE_SCENARIOS.map((scenario) => ({
            ...scenario,
            enemyLevel: scenario.elite ? 4 : 5,
          }))
        : undefined;
    const relicReport = simulation.runRelicBalanceReport({
      samplesPerCell: samples,
      scenarios,
      relics,
    });
    console.log();
    console.log(simulation.formatRelicBalanceReport(relicReport));
  }
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
