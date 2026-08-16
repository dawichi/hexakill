import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const checks = [
  { label: 'toolchain', args: ['run', 'verify:toolchain'] },
  { label: 'formatting', args: ['run', 'format:check'] },
  { label: 'TypeScript', args: ['run', 'verify:types'] },
  { label: 'documentation', args: ['run', 'verify:docs'] },
  { label: 'deployment contract', args: ['run', 'verify:deployment'] },
  { label: 'assets', args: ['run', 'verify:assets'] },
  { label: 'asset geometry', args: ['run', 'inspect:assets', '--', '--json'] },
  { label: 'unit tests', args: ['test', '--', '--watch=false', '--no-progress'] },
  { label: 'dependency audit', args: ['audit', '--audit-level=high'] },
  { label: 'production build', args: ['run', 'build'] },
  {
    label: 'publishable artifact contract',
    args: ['run', 'verify:deployment', '--', 'dist/hexakill/browser'],
  },
  { label: 'preview contract', args: ['run', 'verify:preview'] },
  { label: 'production browser journeys', args: ['run', 'test:e2e:production'] },
];

for (const check of checks) {
  console.log(`\nRelease check: ${check.label}`);
  const result = spawnSync(npmCommand, check.args, {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  if (result.error) {
    console.error(`Release check failed to start: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`Release check failed: ${check.label}`);
    process.exit(result.status ?? 1);
  }
}

console.log('\nRelease checks passed.');
