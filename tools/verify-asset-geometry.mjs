import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = resolve(new URL('..', import.meta.url).pathname);
const assetRoot = resolve(
  projectRoot,
  process.argv.slice(2).find((argument) => !argument.startsWith('--')) ?? 'static',
);
const sourceRoot = resolve(projectRoot, 'src/app');

function fail(message) {
  console.error(`Asset geometry verification failed: ${message}`);
  process.exit(1);
}

function listSourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return listSourceFiles(path);
    return entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts') ? [path] : [];
  });
}

function readPngDimensions(path) {
  const data = readFileSync(path);
  if (
    data.length < 24 ||
    !data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  ) {
    fail(`${path} is not a readable PNG`);
  }

  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}

const sourceFiles = listSourceFiles(sourceRoot);
const metadata = new Map();
const spritePattern =
  /src:\s*['"](\/images\/[^'"]+)['"][\s\S]{0,240}?frameWidth:\s*(\d+),\s*frameHeight:\s*(\d+),\s*frameCount:\s*(\d+)(?:,\s*orientation:\s*['"](horizontal|vertical)['"])?(?:,\s*trailingPixels:\s*(\d+))?/g;

for (const sourcePath of sourceFiles) {
  const source = readFileSync(sourcePath, 'utf8');
  for (const match of source.matchAll(spritePattern)) {
    const [
      ,
      sourcePathname,
      frameWidth,
      frameHeight,
      frameCount,
      orientation = 'horizontal',
      trailingPixels = '0',
    ] = match;
    const asset = {
      sourcePath: sourcePathname,
      frameWidth: Number(frameWidth),
      frameHeight: Number(frameHeight),
      frameCount: Number(frameCount),
      orientation,
      trailingPixels: Number(trailingPixels),
    };
    const previous = metadata.get(sourcePathname);
    if (previous && JSON.stringify(previous) !== JSON.stringify(asset)) {
      fail(`conflicting metadata is declared for ${sourcePathname}`);
    }
    metadata.set(sourcePathname, asset);
  }
}

if (metadata.size === 0) fail('no typed SpriteStripAsset metadata was found under src/app');

for (const asset of metadata.values()) {
  const relativePath = asset.sourcePath.slice(1);
  const filePath = resolve(assetRoot, relativePath);
  if (!existsSync(filePath)) fail(`typed sprite source is missing: ${relativePath}`);

  const dimensions = readPngDimensions(filePath);
  const expected =
    asset.orientation === 'vertical'
      ? {
          width: asset.frameWidth,
          height: asset.frameHeight * asset.frameCount - asset.trailingPixels,
        }
      : {
          width: asset.frameWidth * asset.frameCount - asset.trailingPixels,
          height: asset.frameHeight,
        };

  const frameExtent = asset.orientation === 'vertical' ? asset.frameHeight : asset.frameWidth;
  if (asset.trailingPixels < 0 || asset.trailingPixels >= frameExtent) {
    fail(`${relativePath} declares an invalid trailing pixel crop`);
  }

  if (dimensions.width !== expected.width || dimensions.height !== expected.height) {
    fail(
      `${relativePath} is ${dimensions.width}x${dimensions.height}; expected ${expected.width}x${expected.height} from ${asset.frameWidth}x${asset.frameHeight} × ${asset.frameCount} ${asset.orientation} frames`,
    );
  }
}

console.log(`Verified frame geometry for ${metadata.size} typed sprite strips under ${assetRoot}.`);
