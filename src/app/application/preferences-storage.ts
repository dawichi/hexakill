import { InjectionToken } from '@angular/core';

export interface PreferencesStoragePort {
  read(): string | null;
  write(value: string): void;
  clear(): void;
}

const PREFERENCES_STORAGE_KEY = 'hexakill.angular.preferences.v1';

export const BROWSER_PREFERENCES_STORAGE: PreferencesStoragePort = {
  read: () => {
    try {
      return globalThis.localStorage?.getItem(PREFERENCES_STORAGE_KEY) ?? null;
    } catch {
      return null;
    }
  },
  write: (value) => {
    try {
      globalThis.localStorage?.setItem(PREFERENCES_STORAGE_KEY, value);
    } catch {
      // Preferences are an enhancement; storage failure must not break play.
    }
  },
  clear: () => {
    try {
      globalThis.localStorage?.removeItem(PREFERENCES_STORAGE_KEY);
    } catch {
      // See write: storage failure is intentionally non-fatal.
    }
  },
};

export const PREFERENCES_STORAGE = new InjectionToken<PreferencesStoragePort>(
  'PREFERENCES_STORAGE',
);
