import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = resolve(new URL('..', import.meta.url).pathname);
const assetRoot = resolve(projectRoot, process.argv[2] ?? 'static');

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

console.log(`Verified ${requiredAssets.length} active asset paths under ${assetRoot}.`);
