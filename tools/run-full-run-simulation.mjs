import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const temporaryDirectory = await mkdtemp(join(tmpdir(), 'hexakill-full-run-'));
const outputFile = join(temporaryDirectory, 'full-run-simulation.mjs');

try {
  await build({
    entryPoints: [join(root, 'src/app/domain/full-run-simulation.ts')],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node24',
    outfile: outputFile,
    logLevel: 'silent',
  });

  const simulation = await import(pathToFileURL(outputFile).href);
  const samples = Number(process.env['FULL_RUN_SAMPLES'] ?? 200);
  const maxCombatTurns = Number(process.env['FULL_RUN_MAX_COMBAT_TURNS'] ?? 100);
  const report = simulation.runFullRunReport({ samplesPerCell: samples, maxCombatTurns });
  console.log(simulation.formatFullRunReport(report));

  if (process.env['FULL_RUN_RELIC_MATRIX'] === '1') {
    const byCharacter = (candidateReport, character) =>
      candidateReport.summaries
        .filter((summary) => summary.character === character)
        .reduce((total, summary) => total + summary.completionRate, 0) /
      candidateReport.summaries.filter((summary) => summary.character === character).length;
    const characters = ['Wizard', 'Samurai', 'Warrior'];
    console.log();
    console.log('Relic full-run impact (starting relic, price excluded)');
    console.log('Relic                         Wizard  Samurai  Warrior');
    for (const relic of simulation.STORE_ITEMS) {
      const relicReport = simulation.runFullRunReport({
        samplesPerCell: samples,
        maxCombatTurns,
        startingRelicIds: [relic.id],
      });
      const values = characters.map((character) => byCharacter(relicReport, character));
      console.log(
        `${relic.name.padEnd(28)} ${values.map((value) => `${(value * 100).toFixed(1)}%`.padStart(7)).join(' ')}`,
      );
    }
  }
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
