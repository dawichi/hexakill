import { InjectionToken } from '@angular/core';

export interface ClockHandle {
  cancel(): void;
}

export interface Clock {
  now(): number;
  schedule(task: () => void, delayMs: number): ClockHandle;
}

export const BROWSER_CLOCK: Clock = {
  now: () => Date.now(),
  schedule: (task, delayMs) => {
    const timeoutId = globalThis.setTimeout(task, delayMs);
    return { cancel: () => globalThis.clearTimeout(timeoutId) };
  },
};

export const CLOCK = new InjectionToken<Clock>('CLOCK');
