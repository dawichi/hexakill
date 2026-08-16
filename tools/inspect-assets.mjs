import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const projectRoot = resolve(new URL('..', import.meta.url).pathname);
const assetRoot = resolve(
  projectRoot,
  process.argv.slice(2).find((argument) => !argument.startsWith('--')) ?? 'static/images',
);
const jsonOutput = process.argv.includes('--json');

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

function readDimensions(path) {
  const data = readFileSync(path);
  const extension = path.slice(path.lastIndexOf('.')).toLowerCase();

  if (
    extension === '.png' &&
    data.length >= 24 &&
    data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  ) {
    return { format: 'png', width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
  }

  if (
    extension === '.gif' &&
    data.length >= 10 &&
    (data.subarray(0, 6).toString('ascii') === 'GIF87a' ||
      data.subarray(0, 6).toString('ascii') === 'GIF89a')
  ) {
    return { format: 'gif', width: data.readUInt16LE(6), height: data.readUInt16LE(8) };
  }

  return { format: extension.slice(1) || 'unknown', width: null, height: null };
}

if (!existsSync(assetRoot)) {
  console.error(`Asset directory does not exist: ${assetRoot}`);
  process.exit(1);
}

const assets = listFiles(assetRoot)
  .map((path) => ({
    path: relative(assetRoot, path).split('\\').join('/'),
    ...readDimensions(path),
  }))
  .sort((left, right) => left.path.localeCompare(right.path));

if (jsonOutput) {
  console.log(JSON.stringify({ root: relative(projectRoot, assetRoot), assets }, null, 2));
} else {
  console.log(`Asset dimensions under ${assetRoot}`);
  console.log('path\tformat\tdimensions');
  for (const asset of assets) {
    const dimensions = asset.width === null ? 'unknown' : `${asset.width}x${asset.height}`;
    console.log(`${asset.path}\t${asset.format}\t${dimensions}`);
  }
}
