import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const publicRoot = resolve(process.argv[2] ?? join(projectRoot, 'dist/hexakill/browser'));
const port = Number(process.env['PORT'] ?? 4300);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.png': 'image/png',
  '.txt': 'text/plain; charset=utf-8',
  '.wav': 'audio/wav',
};

function sendText(response, status, body) {
  response.writeHead(status, {
    ...securityHeaders,
    'content-type': 'text/plain; charset=utf-8',
  });
  response.end(body);
}

const securityHeaders = {
  'cross-origin-opener-policy': 'same-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
};

const server = createServer(async (request, response) => {
  if (!request.url || (request.method !== 'GET' && request.method !== 'HEAD')) {
    sendText(response, 405, 'Method not allowed\n');
    return;
  }

  const requestPath = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const relativePath = requestPath === '/' ? '/index.html' : requestPath;
  const filePath = resolve(join(publicRoot, normalize(relativePath)));

  if (filePath !== publicRoot && !filePath.startsWith(`${publicRoot}/`)) {
    sendText(response, 403, 'Forbidden\n');
    return;
  }

  try {
    const fileStats = await stat(filePath);
    if (!fileStats.isFile()) {
      sendText(response, 404, 'Not found\n');
      return;
    }

    response.writeHead(200, {
      ...securityHeaders,
      'cache-control':
        extname(filePath) === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
      'content-type': contentTypes[extname(filePath)] ?? 'application/octet-stream',
    });
    if (request.method === 'HEAD') {
      response.end();
    } else {
      createReadStream(filePath).pipe(response);
    }
  } catch {
    sendText(response, 404, 'Not found\n');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Serving ${publicRoot} at http://127.0.0.1:${port}/`);
});
