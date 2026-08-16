import { describe, expect, it } from 'vitest';
import { BASE_STATS, CHARACTER_DEFINITIONS, createInitialPlayer } from './characters';

describe('character asset contracts', () => {
  it('records observed action-strip geometry for supported player animations', () => {
    expect(
      CHARACTER_DEFINITIONS.find((character) => character.id === 'wizard')?.actionAsset,
    ).toEqual({
      src: '/images/wizard/sprites/Attack1.png',
      frameWidth: 231,
      frameHeight: 190,
      frameCount: 8,
    });
    expect(
      CHARACTER_DEFINITIONS.find((character) => character.id === 'samurai')?.actionAsset,
    ).toEqual({
      src: '/images/samurai/Sprites/Attack1.png',
      frameWidth: 200,
      frameHeight: 200,
      frameCount: 6,
    });
    expect(
      CHARACTER_DEFINITIONS.find((character) => character.id === 'wizard')?.magicAsset,
    ).toEqual({
      src: '/images/wizard/sprites/Attack2.png',
      frameWidth: 231,
      frameHeight: 190,
      frameCount: 8,
    });
    expect(
      CHARACTER_DEFINITIONS.find((character) => character.id === 'samurai')?.magicAsset,
    ).toEqual({
      src: '/images/samurai/Sprites/Attack2.png',
      frameWidth: 200,
      frameHeight: 200,
      frameCount: 6,
    });
    expect(CHARACTER_DEFINITIONS.find((character) => character.id === 'wizard')?.hitAsset).toEqual({
      src: '/images/wizard/sprites/Hit.png',
      frameWidth: 231,
      frameHeight: 190,
      frameCount: 4,
    });
    expect(CHARACTER_DEFINITIONS.find((character) => character.id === 'samurai')?.hitAsset).toEqual(
      {
        src: '/images/samurai/Sprites/Take Hit.png',
        frameWidth: 200,
        frameHeight: 200,
        frameCount: 4,
      },
    );
    expect(CHARACTER_DEFINITIONS.find((character) => character.id === 'warrior')?.actionAsset).toBe(
      undefined,
    );
    expect(CHARACTER_DEFINITIONS.find((character) => character.id === 'warrior')?.hitAsset).toBe(
      undefined,
    );
  });

  it('records observed defeat-strip geometry for supported player animations', () => {
    expect(
      CHARACTER_DEFINITIONS.find((character) => character.id === 'wizard')?.defeatAsset,
    ).toEqual({
      src: '/images/wizard/sprites/Death.png',
      frameWidth: 231,
      frameHeight: 190,
      frameCount: 7,
    });
    expect(
      CHARACTER_DEFINITIONS.find((character) => character.id === 'samurai')?.defeatAsset,
    ).toEqual({
      src: '/images/samurai/Sprites/Death.png',
      frameWidth: 200,
      frameHeight: 200,
      frameCount: 6,
    });
    expect(CHARACTER_DEFINITIONS.find((character) => character.id === 'warrior')?.defeatAsset).toBe(
      undefined,
    );

    const player = createInitialPlayer('David', CHARACTER_DEFINITIONS[0]);
    expect(player.level).toBe(4);
    expect(player.stats).toEqual(BASE_STATS);
  });
});
