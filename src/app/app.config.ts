import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { AUDIO, createBrowserAudio } from './application/audio';
import { BROWSER_CLOCK, CLOCK } from './application/clock';
import { BROWSER_STORAGE, STORAGE } from './application/storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: CLOCK, useValue: BROWSER_CLOCK },
    { provide: AUDIO, useFactory: createBrowserAudio },
    { provide: STORAGE, useValue: BROWSER_STORAGE },
  ],
};
