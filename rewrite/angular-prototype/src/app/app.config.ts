import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BROWSER_CLOCK, CLOCK } from './application/clock';
import { AUDIO, BROWSER_AUDIO } from './application/audio';
import { RANDOM_SOURCE } from './application/random';
import { BROWSER_SESSION_STORAGE, SESSION_STORAGE } from './application/storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: CLOCK, useValue: BROWSER_CLOCK },
    { provide: AUDIO, useValue: BROWSER_AUDIO },
    { provide: RANDOM_SOURCE, useValue: Math.random },
    { provide: SESSION_STORAGE, useValue: BROWSER_SESSION_STORAGE },
  ],
};
