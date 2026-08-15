import { InjectionToken } from '@angular/core';

export interface AudioPort {
  playSound(asset: string): void;
  playMusic(asset: string): void;
  stopMusic(): void;
  setMusicVolume(volume: number): void;
  setEffectsVolume(volume: number): void;
}

let currentMusic: HTMLAudioElement | null = null;
let musicVolume = 0.05;
let effectsVolume = 0.2;

function clampVolume(volume: number): number {
  return Math.max(0, Math.min(0.5, Number.isFinite(volume) ? volume : 0));
}

export const BROWSER_AUDIO: AudioPort = {
  playSound: (asset) => {
    try {
      const audio = new Audio(asset);
      audio.volume = effectsVolume;
      void audio.play().catch(() => undefined);
    } catch {
      // Autoplay policy or an unavailable asset must not block gameplay.
    }
  },
  playMusic: (asset) => {
    try {
      currentMusic?.pause();
      const audio = new Audio(asset);
      currentMusic = audio;
      audio.loop = true;
      audio.volume = musicVolume;
      void audio.play().catch(() => undefined);
    } catch {
      // Audio is an enhancement and is safe to omit.
    }
  },
  stopMusic: () => {
    currentMusic?.pause();
    currentMusic = null;
  },
  setMusicVolume: (volume) => {
    musicVolume = clampVolume(volume);
    if (!currentMusic) return;
    currentMusic.volume = musicVolume;
    if (musicVolume === 0) currentMusic.pause();
    else void currentMusic.play().catch(() => undefined);
  },
  setEffectsVolume: (volume) => {
    effectsVolume = clampVolume(volume);
  },
};

export const AUDIO = new InjectionToken<AudioPort>('AUDIO');
