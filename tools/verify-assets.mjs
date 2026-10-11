import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AUDIO_ASSETS } from '../src/app/domain/assets.ts';
import { CHARACTERS } from '../src/app/domain/characters.ts';
import { BOSSES, REGULAR_ENEMIES } from '../src/app/domain/enemies.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const staticRoot = path.join(root, 'static');
const failures = [];
const referenced = new Set();

function resolveAsset(url) {
  if (!url.startsWith('/')) {
    failures.push(`Asset URL must be root-relative: ${url}`);
    return null;
  }
  const file = path.resolve(staticRoot, `.${url}`);
  if (!file.startsWith(`${staticRoot}${path.sep}`)) {
    failures.push(`Asset URL escapes static/: ${url}`);
    return null;
  }
  referenced.add(file);
  return file;
}

function checkFile(url) {
  const file = resolveAsset(url);
  if (file && !existsSync(file)) failures.push(`Missing active asset: ${url}`);
}

function checkStrip(asset, owner) {
  checkFile(asset.src);
  const file = resolveAsset(asset.src);
  if (!file || !existsSync(file) || path.extname(file).toLowerCase() !== '.png') return;
  const png = readFileSync(file);
  if (png.length < 24 || png.toString('hex', 0, 8) !== '89504e470d0a1a0a') {
    failures.push(`Invalid PNG sprite strip for ${owner}: ${asset.src}`);
    return;
  }
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  const actual = asset.orientation === 'vertical' ? height : width;
  const expected =
    (asset.orientation === 'vertical' ? asset.frameHeight : asset.frameWidth) * asset.frameCount -
    (asset.trailingPixels ?? 0);
  const crossAxis = asset.orientation === 'vertical' ? width : height;
  const crossExpected = asset.orientation === 'vertical' ? asset.frameWidth : asset.frameHeight;
  if (actual !== expected || crossAxis !== crossExpected) {
    failures.push(
      `Sprite geometry for ${owner} (${asset.src}) is ${width}×${height}; expected ${asset.orientation === 'vertical' ? `${asset.frameWidth}×${expected}` : `${expected}×${asset.frameHeight}`}.`,
    );
  }
}

function checkSprites(owner, sprites) {
  checkFile(sprites.portrait);
  for (const [state, asset] of Object.entries(sprites.strips)) {
    if (asset) checkStrip(asset, `${owner} ${state}`);
  }
  for (const asset of Object.values(sprites.gifs ?? {})) {
    if (asset) checkFile(asset);
  }
}

for (const asset of Object.values(AUDIO_ASSETS.music)) checkFile(asset);
for (const asset of Object.values(AUDIO_ASSETS.sounds)) checkFile(asset);
for (const character of CHARACTERS) checkSprites(character.name, character.sprites);
for (const enemy of [...REGULAR_ENEMIES, ...BOSSES]) checkSprites(enemy.name, enemy.sprites);

if (failures.length) {
  console.error(
    `Asset verification failed (${failures.length} issue${failures.length === 1 ? '' : 's'}):`,
  );
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Verified ${referenced.size} active audio and image assets.`);
}
