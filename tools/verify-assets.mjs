import { existsSync, readdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const projectRoot = resolve(new URL('..', import.meta.url).pathname);
const assetRoot = resolve(projectRoot, process.argv[2] ?? 'static');

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
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
  'images/wizard/sprites/Attack1.png',
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
if (deferredImageCount !== 73) {
  console.error(
    `Expected 73 deferred image sources from the asset catalog, found ${deferredImageCount}. Update docs/assets-sprite-sources.md and this verification boundary when assets change.`,
  );
  process.exit(1);
}

console.log(
  `Verified ${requiredAssets.length} active asset paths and ${deferredImageCount} cataloged deferred image sources under ${assetRoot}.`,
);
