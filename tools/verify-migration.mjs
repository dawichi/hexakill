import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = resolve(new URL('..', import.meta.url).pathname);

function fail(message) {
  console.error(`Migration contract verification failed: ${message}`);
  process.exit(1);
}

function readJson(relativePath) {
  try {
    return JSON.parse(readFileSync(resolve(projectRoot, relativePath), 'utf8'));
  } catch {
    fail(`could not read JSON file ${relativePath}`);
  }
}

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

const requiredRootFiles = [
  'package.json',
  'package-lock.json',
  'angular.json',
  'src/main.ts',
  'src/app/app.ts',
  'e2e/run-journey.spec.ts',
  'static/favicon.ico',
  'rewrite/README.md',
  'legacy/svelte/package.json',
];

const missingRootFiles = requiredRootFiles.filter(
  (relativePath) => !existsSync(resolve(projectRoot, relativePath)),
);
if (missingRootFiles.length > 0) {
  fail(`required migration files are missing: ${missingRootFiles.join(', ')}`);
}

const forbiddenPrototypePath = resolve(projectRoot, 'rewrite/angular-prototype');
if (existsSync(forbiddenPrototypePath)) {
  fail(
    'the isolated rewrite/angular-prototype directory still exists; the active app belongs at the repository root',
  );
}

const rootPackage = readJson('package.json');
const rootDependencies = {
  ...rootPackage.dependencies,
  ...rootPackage.devDependencies,
};
const forbiddenActivePackages = ['svelte', '@sveltejs/kit', 'vite', '@sveltejs/adapter-auto'];
const forbiddenPackages = forbiddenActivePackages.filter((name) => name in rootDependencies);
if (forbiddenPackages.length > 0) {
  fail(`archived Svelte packages are active in the root manifest: ${forbiddenPackages.join(', ')}`);
}

for (const relativeDirectory of ['src', 'e2e']) {
  const directory = resolve(projectRoot, relativeDirectory);
  const legacyReferences = listFiles(directory).flatMap((path) => {
    const source = readFileSync(path, 'utf8');
    return /legacy\/svelte|rewrite\/angular-prototype/.test(source) ? [path] : [];
  });
  if (legacyReferences.length > 0) {
    fail(
      `active ${relativeDirectory} source references the archived or isolated implementation: ${legacyReferences.join(', ')}`,
    );
  }
}

const migrationNote = readFileSync(resolve(projectRoot, 'rewrite/README.md'), 'utf8');
if (!/promoted/i.test(migrationNote) || !/repository root/i.test(migrationNote)) {
  fail('rewrite/README.md does not document the isolated-to-root promotion');
}

const angularManifest = readJson('angular.json');
if (!angularManifest.projects || Object.keys(angularManifest.projects).length === 0) {
  fail('angular.json has no configured root project');
}

console.log(
  'Verified the Angular root migration, archived Svelte boundary, isolated-prototype removal, and active dependency boundary.',
);
