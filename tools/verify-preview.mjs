import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const publicRoot = resolve(projectRoot, process.argv[2] ?? 'dist/hexakill/browser');
const port = 4310;
const serverPath = resolve(projectRoot, 'tools/serve-static.mjs');
const server = spawn(process.execPath, [serverPath, publicRoot], {
  env: { ...process.env, PORT: String(port) },
  stdio: 'ignore',
});

const baseUrl = `http://127.0.0.1:${port}`;
const requiredHeaders = {
  'cross-origin-opener-policy': 'same-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
};

function fail(message) {
  console.error(`Preview verification failed: ${message}`);
  process.exitCode = 1;
}

async function request(path) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      return await fetch(`${baseUrl}${path}`);
    } catch {
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 100));
    }
  }

  throw new Error(`Preview server did not become ready at ${baseUrl}.`);
}

try {
  const root = await request('/');
  if (root.status !== 200) fail(`expected / to return 200, received ${root.status}`);
  if (!(await root.text()).includes('<app-root>')) {
    fail('the root response does not contain the Angular application host');
  }

  for (const [name, expected] of Object.entries(requiredHeaders)) {
    const actual = root.headers.get(name);
    if (actual !== expected)
      fail(`expected ${name}: ${expected}, received ${actual ?? '<missing>'}`);
  }

  const asset = await request('/images/wizard/idle.gif');
  if (asset.status !== 200)
    fail(`expected representative asset to return 200, received ${asset.status}`);
  if (asset.headers.get('cache-control') !== 'public, max-age=31536000, immutable') {
    fail('representative asset does not have the immutable cache policy');
  }

  const missing = await request('/does-not-exist');
  if (missing.status !== 404)
    fail(`expected unknown path to return 404, received ${missing.status}`);

  if (process.exitCode !== 1) {
    console.log(
      'Verified production preview root, security headers, asset caching, and 404 behavior.',
    );
  }
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
} finally {
  server.kill('SIGTERM');
}
