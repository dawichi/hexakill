export const DEFAULT_MUSIC_VOLUME = 0.05;
export const DEFAULT_EFFECTS_VOLUME = 0.2;
export const MAX_VOLUME = 0.5;

export interface AudioPreferences {
  readonly musicVolume: number;
  readonly effectsVolume: number;
}

export interface StoredPreferencesSnapshot extends AudioPreferences {
  readonly version: 1;
}

export function clampVolume(volume: number): number {
  return Math.max(0, Math.min(MAX_VOLUME, Number.isFinite(volume) ? volume : 0));
}

export function isStoredPreferencesSnapshot(value: unknown): value is StoredPreferencesSnapshot {
  if (typeof value !== 'object' || value === null) return false;
  const snapshot = value as {
    version?: unknown;
    musicVolume?: unknown;
    effectsVolume?: unknown;
  };

  return (
    snapshot.version === 1 &&
    typeof snapshot.musicVolume === 'number' &&
    Number.isFinite(snapshot.musicVolume) &&
    snapshot.musicVolume >= 0 &&
    snapshot.musicVolume <= MAX_VOLUME &&
    typeof snapshot.effectsVolume === 'number' &&
    Number.isFinite(snapshot.effectsVolume) &&
    snapshot.effectsVolume >= 0 &&
    snapshot.effectsVolume <= MAX_VOLUME
  );
}
