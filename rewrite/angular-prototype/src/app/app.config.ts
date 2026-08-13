import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BROWSER_CLOCK, CLOCK } from './application/clock';
import { RANDOM_SOURCE } from './application/random';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: CLOCK, useValue: BROWSER_CLOCK },
    { provide: RANDOM_SOURCE, useValue: Math.random },
  ],
};
