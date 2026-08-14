import { InjectionToken } from '@angular/core';

export interface SessionStoragePort {
  read(): string | null;
  write(value: string): void;
  clear(): void;
}

const STORAGE_KEY = 'hexakill.angular.session.v1';

export const BROWSER_SESSION_STORAGE: SessionStoragePort = {
  read: () => {
    try {
      return globalThis.localStorage?.getItem(STORAGE_KEY) ?? null;
    } catch {
      return null;
    }
  },
  write: (value) => {
    try {
      globalThis.localStorage?.setItem(STORAGE_KEY, value);
    } catch {
      // Storage is an enhancement; a blocked or full store must not break play.
    }
  },
  clear: () => {
    try {
      globalThis.localStorage?.removeItem(STORAGE_KEY);
    } catch {
      // See write: storage failure is intentionally non-fatal.
    }
  },
};

export const SESSION_STORAGE = new InjectionToken<SessionStoragePort>('SESSION_STORAGE');
