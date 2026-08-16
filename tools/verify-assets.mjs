import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const projectRoot = resolve(new URL('..', import.meta.url).pathname);
const artifactArgument = process.argv[2];
const assetRoot = resolve(projectRoot, artifactArgument ?? 'static');
const sourceAssetRoot = resolve(projectRoot, 'static');

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

function fileDigest(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

const idleEntities = [
  'adventurer',
  'archer',
  'armored-huntress',
  'bringer-of-death',
  'evil-tree',
  'evil-wizard',
  'fire-knight',
  'fire-worm',
  'knight',
  'martial-hero',
  'samurai',
  'slime-blue',
  'slime-gold',
  'slime-green',
  'slime-purple',
  'slime-red',
  'warrior',
  'water-priestess',
  'wild-huntress',
  'witch-blue',
  'wizard',
];

const requiredAssets = [
  ...idleEntities.map((entity) => `images/${entity}/idle.gif`),
  'images/evil-tree/attack.gif',
  'images/evil-tree/die.gif',
  'images/slime-blue/attack.gif',
  'images/slime-blue/die.gif',
  'images/slime-gold/attack.gif',
  'images/slime-gold/die.gif',
  'images/slime-green/attack.gif',
  'images/slime-green/die.gif',
  'images/slime-purple/attack.gif',
  'images/slime-purple/die.gif',
  'images/slime-red/attack.gif',
  'images/slime-red/die.gif',
  'images/evil-wizard/sprites/Death.png',
  'images/evil-wizard/sprites/Attack1.png',
  'images/fire-worm/Sprites/Worm/Death.png',
  'images/fire-worm/Sprites/Worm/Attack.png',
  'images/martial-hero/Sprite/Death.png',
  'images/martial-hero/Sprite/Attack1.png',
  'images/samurai/Sprites/Death.png',
  'images/wild-huntress/sprites/Death.png',
  'images/wild-huntress/sprites/Attack1.png',
  'images/witch-blue/assets/B_witch_attack.png',
  'images/witch-blue/assets/B_witch_death.png',
  'images/wizard/sprites/Attack1.png',
  'images/wizard/sprites/Death.png',
  'images/samurai/Sprites/Attack1.png',
  'images/items/orb.png',
  'images/items/sword.png',
  'images/items/wand.png',
  'music/boss.mp3',
  'music/champSelect.mp3',
  'music/dungeon.mp3',
  'music/store.mp3',
  'music/welcome.mp3',
  'sounds/attack.mp3',
  'sounds/coin.mp3',
  'sounds/enemy_killed.mp3',
  'sounds/error.mp3',
  'sounds/levelup.mp3',
  'sounds/magic.mp3',
  'sounds/potion.wav',
];

const missing = requiredAssets.filter((asset) => !existsSync(resolve(assetRoot, asset)));
if (missing.length > 0) {
  console.error(`Missing ${missing.length} required assets under ${assetRoot}:`);
  console.error(missing.map((asset) => `- ${asset}`).join('\n'));
  process.exit(1);
}

const activeImagePaths = new Set(requiredAssets.filter((asset) => asset.startsWith('images/')));
const allImagePaths = listFiles(resolve(assetRoot, 'images')).map((path) =>
  relative(assetRoot, path).split('\\').join('/'),
);
const deferredImageCount = allImagePaths.filter((asset) => !activeImagePaths.has(asset)).length;
if (deferredImageCount !== 61) {
  console.error(
    `Expected 61 deferred image sources from the asset catalog, found ${deferredImageCount}. Update docs/assets-sprite-sources.md and this verification boundary when assets change.`,
  );
  process.exit(1);
}

const sourceRegister = readFileSync(resolve(projectRoot, 'docs/assets-sprite-sources.md'), 'utf8');
const catalogedDeferredImagePaths = new Set();
for (const line of sourceRegister.split('\n')) {
  const retainedFilesCell = line.split('|')[3] ?? '';
  for (const match of retainedFilesCell.matchAll(/`([^`]+)`/g)) {
    catalogedDeferredImagePaths.add(`images/${match[1]}`);
  }
}
const actualDeferredImagePaths = new Set(
  allImagePaths.filter((asset) => !activeImagePaths.has(asset)),
);
const missingFromSourceRegister = [...actualDeferredImagePaths].filter(
  (asset) => !catalogedDeferredImagePaths.has(asset),
);
const staleInSourceRegister = [...catalogedDeferredImagePaths].filter(
  (asset) => !actualDeferredImagePaths.has(asset),
);
if (missingFromSourceRegister.length > 0 || staleInSourceRegister.length > 0) {
  console.error('The deferred asset register does not match the retained image tree.');
  if (missingFromSourceRegister.length > 0) {
    console.error(
      `- Deferred files missing from docs/assets-sprite-sources.md: ${missingFromSourceRegister.join(', ')}`,
    );
  }
  if (staleInSourceRegister.length > 0) {
    console.error(
      `- Catalog entries no longer present as deferred files: ${staleInSourceRegister.join(', ')}`,
    );
  }
  process.exit(1);
}

const sourceAssetPaths = new Set();
for (const sourcePath of listFiles(resolve(projectRoot, 'src/app'))) {
  const source = readFileSync(sourcePath, 'utf8');
  for (const match of source.matchAll(/["'`](\/(?:images|music|sounds)\/[^"'`\s)]+)["'`]/g)) {
    sourceAssetPaths.add(match[1].slice(1));
  }
}

const undeclaredSourceAssets = [...sourceAssetPaths].filter(
  (asset) => !requiredAssets.includes(asset),
);
const missingSourceDeclarations = requiredAssets.filter((asset) => !sourceAssetPaths.has(asset));
if (undeclaredSourceAssets.length > 0 || missingSourceDeclarations.length > 0) {
  console.error('The active source asset references and the verification contract have drifted.');
  if (undeclaredSourceAssets.length > 0) {
    console.error(
      `- Source references missing from requiredAssets: ${undeclaredSourceAssets.join(', ')}`,
    );
  }
  if (missingSourceDeclarations.length > 0) {
    console.error(
      `- requiredAssets not referenced by active source: ${missingSourceDeclarations.join(', ')}`,
    );
  }
  process.exit(1);
}

if (artifactArgument) {
  const sourceStaticPaths = new Set(
    listFiles(sourceAssetRoot).map((path) => relative(sourceAssetRoot, path).split('\\').join('/')),
  );
  const artifactStaticPaths = new Set(
    listFiles(assetRoot).map((path) => relative(assetRoot, path).split('\\').join('/')),
  );
  const missingCopiedAssets = [...sourceStaticPaths].filter(
    (asset) => !artifactStaticPaths.has(asset),
  );
  if (missingCopiedAssets.length > 0) {
    console.error('The publishable artifact is missing retained static assets:');
    console.error(missingCopiedAssets.map((asset) => `- ${asset}`).join('\n'));
    process.exit(1);
  }

  const changedCopiedAssets = [...sourceStaticPaths].filter((asset) => {
    const sourcePath = resolve(sourceAssetRoot, asset);
    const artifactPath = resolve(assetRoot, asset);
    return (
      statSync(sourcePath).size !== statSync(artifactPath).size ||
      fileDigest(sourcePath) !== fileDigest(artifactPath)
    );
  });
  if (changedCopiedAssets.length > 0) {
    console.error('The publishable artifact changed retained static assets:');
    console.error(changedCopiedAssets.map((asset) => `- ${asset}`).join('\n'));
    process.exit(1);
  }

  console.log(
    `Verified complete retained static-tree path and byte parity for ${sourceStaticPaths.size} files.`,
  );
}

console.log(
  `Verified ${requiredAssets.length} active asset paths, ${deferredImageCount} exact deferred image sources, source-reference parity, and deferred-register parity under ${assetRoot}.`,
);
