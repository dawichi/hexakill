import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const projectRoot = resolve(new URL('..', import.meta.url).pathname);
const docsRoot = resolve(projectRoot, 'docs');
const indexPath = resolve(docsRoot, 'README.md');
const standardsPath = resolve(docsRoot, 'project-standards.yml');
const packagePath = resolve(projectRoot, 'package.json');

function fail(message) {
  console.error(`Documentation verification failed: ${message}`);
  process.exit(1);
}

const index = readFileSync(indexPath, 'utf8');
const markdownFiles = readdirSync(docsRoot, { recursive: true }).filter((file) =>
  file.endsWith('.md'),
);
const missingLinks = [];

for (const relative of markdownFiles) {
  const sourcePath = resolve(docsRoot, relative);
  const source = readFileSync(sourcePath, 'utf8');

  for (const match of source.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (!target || /^(https?:|mailto:)/.test(target)) continue;
    if (!existsSync(resolve(dirname(sourcePath), target))) {
      missingLinks.push(`${relative} -> ${target}`);
    }
  }
}

if (missingLinks.length) fail(`missing local links:\n${missingLinks.join('\n')}`);

const requiredIndexTargets = [
  'AGENTS.md',
  'project-standards.yml',
  'TODO.md',
  'handoff.md',
  'standards-assessment.md',
  'assets.md',
  'operations.md',
  'architecture/current-state.md',
  'architecture/rewrite-target.md',
  'architecture/rewrite-persistence.md',
  'assets-provenance.md',
  'assets-sprite-sources.md',
  'accessibility-review.md',
  'dependencies.md',
  'adr/README.md',
];

for (const target of requiredIndexTargets) {
  if (!index.includes(`](${target})`) || !existsSync(resolve(docsRoot, target))) {
    fail(`docs/README.md does not index ${target}`);
  }
}

const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
const requiredCommands = [
  'build',
  'format:check',
  'test',
  'test:e2e',
  'test:e2e:production',
  'verify:assets',
  'verify:docs',
  'verify:preview',
  'verify:types',
  'verify:toolchain',
  'verify:release',
];
for (const command of requiredCommands) {
  if (typeof packageJson.scripts?.[command] !== 'string') {
    fail(`package.json is missing the ${command} command`);
  }
}

const standards = readFileSync(standardsPath, 'utf8');
const projectRevision = standards.match(/current_revision:\s*([0-9a-f]{40})/)?.[1];
if (!projectRevision) fail('project-standards.yml must pin a project revision');

try {
  execFileSync('git', ['cat-file', '-e', `${projectRevision}^{commit}`], { cwd: projectRoot });
} catch {
  fail(`pinned project revision does not exist in Git: ${projectRevision}`);
}

console.log(
  `Verified docs index, ${markdownFiles.length} Markdown files, local links, commands, and project revision ${projectRevision}.`,
);
