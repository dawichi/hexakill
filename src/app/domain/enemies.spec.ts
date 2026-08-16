import { describe, expect, it } from 'vitest';
import { enemyAssetFor, enemySpriteAssetFor, generateEnemy } from './enemies';

describe('enemy generation', () => {
  it('selects a typed enemy and keeps the legacy level range', () => {
    const enemy = generateEnemy(4, 0.51, 0.99);

    expect(enemy.definition.name).toBe('Martial Hero');
    expect(enemy.level).toBe(7);
    expect(enemy.stats.health).toBe(1050);
    expect(enemy.damageTaken).toBe(0);
    expect(enemy.gold).toBe(438);
  });

  it('generates the lower bound for a low roll', () => {
    const enemy = generateEnemy(4, 0, 0);

    expect(enemy.definition.name).toBe('Adventurer');
    expect(enemy.level).toBe(2);
    expect(enemy.stats.health).toBe(300);
  });

  it('preserves the legacy fractional upper-bound level calculation', () => {
    const enemy = generateEnemy(3, 0, 0.99);

    expect(enemy.level).toBe(6);
  });

  it('keeps the lowest valid player level from producing a zero-health enemy', () => {
    const enemy = generateEnemy(1, 0, 0);

    expect(enemy.level).toBe(1);
    expect(enemy.stats.health).toBeGreaterThan(0);
  });

  it('opens the sequential gold-slime bosses at level ten', () => {
    const firstBoss = generateEnemy(10, 0.5, 0, 0);
    const secondBoss = generateEnemy(20, 0.5, 0, 1);

    expect(firstBoss.definition.name).toBe('Gold Slime 1');
    expect(firstBoss.level).toBe(15);
    expect(firstBoss.gold).toBe(1000);
    expect(secondBoss.definition.name).toBe('Gold Slime 2');
    expect(secondBoss.level).toBe(25);
  });

  it('rejects invalid random rolls', () => {
    expect(() => generateEnemy(4, 1, 0.5)).toThrow(RangeError);
    expect(() => generateEnemy(4, 0.5, -0.1)).toThrow(RangeError);
    expect(() => generateEnemy(4, Number.NaN, 0.5)).toThrow(RangeError);
    expect(() => generateEnemy(4, 0.5, Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });

  it('rejects non-finite player levels and fractional boss progress', () => {
    expect(() => generateEnemy(Number.NaN, 0.5, 0.5)).toThrow(RangeError);
    expect(() => generateEnemy(Number.POSITIVE_INFINITY, 0.5, 0.5)).toThrow(RangeError);
    expect(() => generateEnemy(1.5, 0.5, 0.5)).toThrow(RangeError);
    expect(() => generateEnemy(10, 0.5, 0.5, 0.5)).toThrow(RangeError);
  });

  it('uses observed attack and defeat assets, with idle fallback for other enemies', () => {
    expect(enemyAssetFor('slime-blue', 'attack')).toBe('/images/slime-blue/attack.gif');
    expect(enemyAssetFor('slime-blue', 'defeat')).toBe('/images/slime-blue/die.gif');
    expect(enemyAssetFor('knight', 'attack')).toBe('/images/knight/idle.gif');
    expect(enemyAssetFor('unknown', 'idle')).toBeUndefined();
    expect(enemySpriteAssetFor('evil-wizard', 'idle')).toEqual({
      src: '/images/evil-wizard/sprites/Idle.png',
      frameWidth: 250,
      frameHeight: 250,
      frameCount: 8,
    });
  });

  it('maps only observed single-row enemy defeat strips', () => {
    expect(enemySpriteAssetFor('wild-huntress', 'defeat')).toEqual({
      src: '/images/wild-huntress/sprites/Death.png',
      frameWidth: 150,
      frameHeight: 150,
      frameCount: 8,
    });
    expect(enemySpriteAssetFor('evil-wizard', 'defeat')).toEqual({
      src: '/images/evil-wizard/sprites/Death.png',
      frameWidth: 250,
      frameHeight: 250,
      frameCount: 7,
    });
    expect(enemySpriteAssetFor('fire-worm', 'defeat')).toEqual({
      src: '/images/fire-worm/Sprites/Worm/Death.png',
      frameWidth: 90,
      frameHeight: 90,
      frameCount: 8,
    });
    expect(enemySpriteAssetFor('martial-hero', 'defeat')).toEqual({
      src: '/images/martial-hero/Sprite/Death.png',
      frameWidth: 126,
      frameHeight: 126,
      frameCount: 11,
    });
    expect(enemySpriteAssetFor('knight', 'defeat')).toBeUndefined();
    expect(enemySpriteAssetFor('knight', 'idle')).toEqual({
      src: '/images/knight/idle.png',
      frameWidth: 42,
      frameHeight: 42,
      frameCount: 4,
    });
  });

  it('maps observed single-row enemy attack strips', () => {
    expect(enemySpriteAssetFor('evil-wizard', 'attack')).toEqual({
      src: '/images/evil-wizard/sprites/Attack1.png',
      frameWidth: 250,
      frameHeight: 250,
      frameCount: 8,
    });
    expect(enemySpriteAssetFor('fire-worm', 'attack')).toEqual({
      src: '/images/fire-worm/Sprites/Worm/Attack.png',
      frameWidth: 90,
      frameHeight: 90,
      frameCount: 16,
    });
    expect(enemySpriteAssetFor('martial-hero', 'attack')).toEqual({
      src: '/images/martial-hero/Sprite/Attack1.png',
      frameWidth: 126,
      frameHeight: 126,
      frameCount: 7,
    });
    expect(enemySpriteAssetFor('wild-huntress', 'attack')).toEqual({
      src: '/images/wild-huntress/sprites/Attack1.png',
      frameWidth: 150,
      frameHeight: 150,
      frameCount: 5,
    });
    expect(enemySpriteAssetFor('evil-wizard', 'attack', 'magic')).toEqual({
      src: '/images/evil-wizard/sprites/Attack2.png',
      frameWidth: 250,
      frameHeight: 250,
      frameCount: 8,
    });
    expect(enemySpriteAssetFor('evil-wizard', 'attack', 'attack')).toEqual({
      src: '/images/evil-wizard/sprites/Attack1.png',
      frameWidth: 250,
      frameHeight: 250,
      frameCount: 8,
    });
    expect(enemySpriteAssetFor('evil-wizard', 'hit')).toEqual({
      src: '/images/evil-wizard/sprites/Take hit.png',
      frameWidth: 250,
      frameHeight: 250,
      frameCount: 3,
    });
    expect(enemySpriteAssetFor('fire-worm', 'hit')).toEqual({
      src: '/images/fire-worm/Sprites/Worm/Get Hit.png',
      frameWidth: 90,
      frameHeight: 90,
      frameCount: 3,
    });
    expect(enemySpriteAssetFor('martial-hero', 'hit')).toEqual({
      src: '/images/martial-hero/Sprite/Take Hit.png',
      frameWidth: 126,
      frameHeight: 126,
      frameCount: 3,
    });
    expect(enemySpriteAssetFor('wild-huntress', 'hit')).toEqual({
      src: '/images/wild-huntress/sprites/Take hit.png',
      frameWidth: 150,
      frameHeight: 150,
      frameCount: 3,
    });
  });

  it('maps the explicitly named single-row enemy idle strips', () => {
    expect(enemySpriteAssetFor('fire-worm', 'idle')).toEqual({
      src: '/images/fire-worm/Sprites/Worm/Idle.png',
      frameWidth: 90,
      frameHeight: 90,
      frameCount: 9,
    });
    expect(enemySpriteAssetFor('martial-hero', 'idle')).toEqual({
      src: '/images/martial-hero/Sprite/Idle.png',
      frameWidth: 126,
      frameHeight: 126,
      frameCount: 10,
    });
    expect(enemySpriteAssetFor('wild-huntress', 'idle')).toEqual({
      src: '/images/wild-huntress/sprites/Idle.png',
      frameWidth: 150,
      frameHeight: 150,
      frameCount: 8,
    });
  });

  it('maps the observed Witch Blue vertical attack and defeat strips', () => {
    expect(enemySpriteAssetFor('witch-blue', 'idle')).toEqual({
      src: '/images/witch-blue/assets/B_witch_idle.png',
      frameWidth: 32,
      frameHeight: 32,
      frameCount: 9,
      orientation: 'vertical',
    });
    expect(enemySpriteAssetFor('witch-blue', 'attack')).toEqual({
      src: '/images/witch-blue/assets/B_witch_attack.png',
      frameWidth: 104,
      frameHeight: 104,
      frameCount: 4,
      orientation: 'vertical',
      trailingPixels: 2,
    });
    expect(enemySpriteAssetFor('witch-blue', 'defeat')).toEqual({
      src: '/images/witch-blue/assets/B_witch_death.png',
      frameWidth: 32,
      frameHeight: 32,
      frameCount: 15,
      orientation: 'vertical',
    });
    expect(enemySpriteAssetFor('witch-blue', 'attack', 'magic')).toEqual({
      src: '/images/witch-blue/assets/B_witch_charge.png',
      frameWidth: 48,
      frameHeight: 48,
      frameCount: 5,
      orientation: 'vertical',
    });
    expect(enemySpriteAssetFor('witch-blue', 'hit')).toEqual({
      src: '/images/witch-blue/assets/B_witch_take_damage.png',
      frameWidth: 32,
      frameHeight: 32,
      frameCount: 5,
      orientation: 'vertical',
      trailingPixels: 16,
    });
  });
});
