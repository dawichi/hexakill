// Verifies that every asset referenced by the app exists, that typed sprite strips match their
// declared frame geometry, and that `static/` ships no unreferenced media.
// Usage: bun tools/verify-assets.mjs [assetRoot=static]
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const projectRoot = resolve(new URL('..', import.meta.url).pathname);
const assetRoot = resolve(projectRoot, process.argv[2] ?? 'static');
const sourceRoot = resolve(projectRoot, 'src');
const mediaDirectories = ['images', 'music', 'sounds', 'fonts'];
const errors = [];

function listFiles(directory, filter = () => true) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return listFiles(path, filter);
    return filter(entry.name) ? [path] : [];
  });
}

function readPngDimensions(path) {
  const data = readFileSync(path);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (data.length < 24 || !data.subarray(0, 8).equals(signature)) return null;
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}

const sources = listFiles(
  sourceRoot,
  (name) => /\.(ts|html|css)$/.test(name) && !name.endsWith('.spec.ts'),
).map((path) => readFileSync(path, 'utf8'));

const referencePattern = new RegExp(
  `['"(]/((?:${mediaDirectories.join('|')})/[^'")]+\\.[a-z0-9]+)['")]`,
  'g',
);
const referenced = new Set(
  sources.flatMap((source) => [...source.matchAll(referencePattern)].map((match) => match[1])),
);

for (const path of referenced) {
  if (!existsSync(resolve(assetRoot, path))) errors.push(`referenced asset is missing: ${path}`);
}

const spritePattern =
  /src:\s*['"]\/(images\/[^'"]+\.png)['"][\s\S]{0,240}?frameWidth:\s*(\d+),\s*frameHeight:\s*(\d+),\s*frameCount:\s*(\d+)(?:,\s*orientation:\s*['"](horizontal|vertical)['"])?(?:,\s*trailingPixels:\s*(\d+))?/g;
let spriteCount = 0;
for (const source of sources) {
  for (const match of source.matchAll(spritePattern)) {
    const [, path, width, height, count, orientation = 'horizontal', trailing = '0'] = match;
    const filePath = resolve(assetRoot, path);
    if (!existsSync(filePath)) continue;
    const dimensions = readPngDimensions(filePath);
    const [frameWidth, frameHeight, frameCount, trailingPixels] = [width, height, count, trailing].map(Number);
    const expected =
      orientation === 'vertical'
        ? { width: frameWidth, height: frameHeight * frameCount - trailingPixels }
        : { width: frameWidth * frameCount - trailingPixels, height: frameHeight };
    if (!dimensions || dimensions.width !== expected.width || dimensions.height !== expected.height) {
      errors.push(
        `${path} is ${dimensions ? `${dimensions.width}x${dimensions.height}` : 'not a PNG'}; expected ${expected.width}x${expected.height}`,
      );
    }
    spriteCount += 1;
  }
}

const shipped = mediaDirectories.flatMap((directory) =>
  listFiles(resolve(assetRoot, directory)).map((path) => relative(assetRoot, path)),
);
for (const path of shipped) {
  if (!referenced.has(path)) errors.push(`unreferenced asset is shipped: ${path}`);
}

if (errors.length) {
  console.error(`Asset verification failed:\n${errors.map((error) => `  - ${error}`).join('\n')}`);
  process.exit(1);
}
console.log(
  `Verified ${referenced.size} asset references and ${spriteCount} sprite strips in ${relative(projectRoot, assetRoot) || '.'}.`,
);
