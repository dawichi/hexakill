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
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
