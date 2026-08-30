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
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
