import { InjectionToken } from '@angular/core';

/** String key-value persistence. Every method is safe to call when storage is unavailable. */
export interface KeyValueStore {
  read(key: string): string | null;
  write(key: string, value: string): void;
  remove(key: string): void;
}

export const STORAGE_KEYS = {
  run: 'hexakill.session.v2',
  records: 'hexakill.records.v2',
  dailyRecords: 'hexakill.daily-records.v2',
  preferences: 'hexakill.preferences.v2',
  legacyRun: 'hexakill.angular.session.v1',
  legacyRecords: 'hexakill.angular.records.v1',
  legacyPreferences: 'hexakill.angular.preferences.v1',
} as const;

export const BROWSER_STORAGE: KeyValueStore = {
  read: (key) => {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },
  write: (key, value) => {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      // Storage is an enhancement; a blocked or full store must not break play.
    }
  },
  remove: (key) => {
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      // See write: storage failure is intentionally non-fatal.
    }
  },
};

export function memoryStore(initial: Record<string, string> = {}): KeyValueStore & {
  readonly data: Map<string, string>;
} {
  const data = new Map(Object.entries(initial));
  return {
    data,
    read: (key) => data.get(key) ?? null,
    write: (key, value) => void data.set(key, value),
    remove: (key) => void data.delete(key),
  };
}

export const STORAGE = new InjectionToken<KeyValueStore>('STORAGE');

/** Parse JSON without throwing. */
export function readJson(store: KeyValueStore, key: string): unknown {
  const raw = store.read(key);
  if (raw === null) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}
