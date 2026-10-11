export const DEFAULT_MUSIC_VOLUME = 0.05;
export const DEFAULT_EFFECTS_VOLUME = 0.2;
/** Audio gain at 100% on the volume sliders. */
export const MAX_VOLUME = 0.5;

export type TextSpeed = 'slow' | 'normal' | 'instant';

export const TEXT_SPEEDS: readonly TextSpeed[] = ['slow', 'normal', 'instant'];

export interface Preferences {
  readonly musicVolume: number;
  readonly effectsVolume: number;
  readonly muted: boolean;
  readonly textSpeed: TextSpeed;
}

export const DEFAULT_PREFERENCES: Preferences = {
  musicVolume: DEFAULT_MUSIC_VOLUME,
  effectsVolume: DEFAULT_EFFECTS_VOLUME,
  muted: false,
  textSpeed: 'normal',
};

export function clampVolume(volume: number): number {
  return Math.max(0, Math.min(MAX_VOLUME, Number.isFinite(volume) ? volume : 0));
}

/** Sliders show 0-100%; storage keeps the raw gain. */
export function volumePercent(volume: number): number {
  return Math.round((clampVolume(volume) / MAX_VOLUME) * 100);
}

export function volumeFromPercent(percent: number): number {
  return clampVolume((percent / 100) * MAX_VOLUME);
}

function isVolume(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= MAX_VOLUME;
}

/** Read stored preferences; version 1 only had the two volumes. */
export function parseStoredPreferences(value: unknown): Preferences {
  if (typeof value !== 'object' || value === null) return DEFAULT_PREFERENCES;
  const stored = value as Record<string, unknown>;
  if (stored['version'] !== 1 && stored['version'] !== 2) return DEFAULT_PREFERENCES;
  const textSpeed = stored['textSpeed'];
  return {
    musicVolume: isVolume(stored['musicVolume']) ? stored['musicVolume'] : DEFAULT_MUSIC_VOLUME,
    effectsVolume: isVolume(stored['effectsVolume'])
      ? stored['effectsVolume']
      : DEFAULT_EFFECTS_VOLUME,
    muted: stored['muted'] === true,
    textSpeed: TEXT_SPEEDS.includes(textSpeed as TextSpeed)
      ? (textSpeed as TextSpeed)
      : DEFAULT_PREFERENCES.textSpeed,
  };
}

export function serializePreferences(preferences: Preferences): string {
  return JSON.stringify({ version: 2, ...preferences });
}
