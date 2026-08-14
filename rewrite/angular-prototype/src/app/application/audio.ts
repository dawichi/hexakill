import { InjectionToken } from '@angular/core';

export interface AudioPort {
  playSound(asset: string): void;
  playMusic(asset: string): void;
}

export const BROWSER_AUDIO: AudioPort = {
  playSound: (asset) => {
    try {
      const audio = new Audio(asset);
      audio.volume = 0.7;
      void audio.play().catch(() => undefined);
    } catch {
      // Autoplay policy or an unavailable asset must not block gameplay.
    }
  },
  playMusic: (asset) => {
    try {
      const audio = new Audio(asset);
      audio.loop = true;
      audio.volume = 0.35;
      void audio.play().catch(() => undefined);
    } catch {
      // Audio is an enhancement and is safe to omit.
    }
  },
};

export const AUDIO = new InjectionToken<AudioPort>('AUDIO');
