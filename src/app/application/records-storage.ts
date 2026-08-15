import { InjectionToken } from '@angular/core';

export interface RecordsStoragePort {
  read(): string | null;
  write(value: string): void;
  clear(): void;
}

const RECORDS_STORAGE_KEY = 'hexakill.angular.records.v1';

export const BROWSER_RECORDS_STORAGE: RecordsStoragePort = {
  read: () => {
    try {
      return globalThis.localStorage?.getItem(RECORDS_STORAGE_KEY) ?? null;
    } catch {
      return null;
    }
  },
  write: (value) => {
    try {
      globalThis.localStorage?.setItem(RECORDS_STORAGE_KEY, value);
    } catch {
      // Records are an enhancement; storage failure must not break play.
    }
  },
  clear: () => {
    try {
      globalThis.localStorage?.removeItem(RECORDS_STORAGE_KEY);
    } catch {
      // See write: storage failure is intentionally non-fatal.
    }
  },
};

export const RECORDS_STORAGE = new InjectionToken<RecordsStoragePort>('RECORDS_STORAGE');
