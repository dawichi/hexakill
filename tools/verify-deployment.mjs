import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = resolve(new URL('..', import.meta.url).pathname);
const configPath = resolve(projectRoot, 'vercel.json');
const artifactPath = process.argv[2] ? resolve(projectRoot, process.argv[2]) : null;

function fail(message) {
  console.error(`Deployment contract verification failed: ${message}`);
  process.exit(1);
}

if (!existsSync(configPath)) fail('vercel.json is missing.');

let config;
try {
  config = JSON.parse(readFileSync(configPath, 'utf8'));
} catch (error) {
  fail(`vercel.json is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
}

const expected = {
  framework: 'angular',
  installCommand: 'npm ci',
  buildCommand: 'npm run build',
  outputDirectory: 'dist/hexakill/browser',
};

for (const [key, value] of Object.entries(expected)) {
  if (config[key] !== value) fail(`${key} must be ${JSON.stringify(value)}.`);
}

const requiredHeaders = new Map([
  ['Cross-Origin-Opener-Policy', 'same-origin'],
  ['Permissions-Policy', 'camera=(), microphone=(), geolocation=()'],
  ['Referrer-Policy', 'strict-origin-when-cross-origin'],
  ['X-Content-Type-Options', 'nosniff'],
  ['X-Frame-Options', 'DENY'],
]);
const configuredHeaders = new Map(
  (config.headers ?? [])
    .flatMap((rule) => rule.headers ?? [])
    .map((header) => [header.key, header.value]),
);

for (const [key, value] of requiredHeaders) {
  if (configuredHeaders.get(key) !== value) {
    fail(`required header ${key} is missing or has the wrong value.`);
  }
}

if (artifactPath && !existsSync(resolve(artifactPath, 'index.html'))) {
  fail(`artifact ${artifactPath} does not contain index.html.`);
}

console.log(
  artifactPath
    ? `Verified Vercel contract and publishable artifact at ${artifactPath}.`
    : 'Verified Vercel framework, install/build/output, and required security-header contract.',
);
