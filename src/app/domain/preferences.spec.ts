import { describe, expect, it } from 'vitest';
import {
  clampVolume,
  DEFAULT_EFFECTS_VOLUME,
  DEFAULT_MUSIC_VOLUME,
  isStoredPreferencesSnapshot,
} from './preferences';

describe('audio preferences', () => {
  it('preserves the observed defaults and clamps UI values', () => {
    expect(DEFAULT_MUSIC_VOLUME).toBe(0.05);
    expect(DEFAULT_EFFECTS_VOLUME).toBe(0.2);
    expect(clampVolume(-1)).toBe(0);
    expect(clampVolume(0.8)).toBe(0.5);
  });

  it('validates the versioned preferences envelope', () => {
    expect(isStoredPreferencesSnapshot({ version: 1, musicVolume: 0.05, effectsVolume: 0.2 })).toBe(
      true,
    );
    expect(isStoredPreferencesSnapshot({ version: 1, musicVolume: 2, effectsVolume: 0.2 })).toBe(
      false,
    );
  });

  it('rejects malformed preference values', () => {
    expect(isStoredPreferencesSnapshot({ version: 1, musicVolume: NaN, effectsVolume: 0.2 })).toBe(
      false,
    );
    expect(
      isStoredPreferencesSnapshot({ version: 1, musicVolume: 0.05, effectsVolume: undefined }),
    ).toBe(false);
    expect(
      isStoredPreferencesSnapshot({ version: 1, musicVolume: -0.01, effectsVolume: 0.2 }),
    ).toBe(false);
  });
});
