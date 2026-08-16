import { InjectionToken } from '@angular/core';

export interface AudioPort {
  playSound(asset: string): void;
  playMusic(asset: string): void;
  stopMusic(): void;
  setMusicVolume(volume: number): void;
  setEffectsVolume(volume: number): void;
}

let currentMusic: HTMLAudioElement | null = null;
let pendingMusicAsset: string | null = null;
let removeMusicResumeListeners: (() => void) | null = null;
let musicVolume = 0.05;
let effectsVolume = 0.2;

function clampVolume(volume: number): number {
  return Math.max(0, Math.min(0.5, Number.isFinite(volume) ? volume : 0));
}

function clearMusicResumeListeners(): void {
  removeMusicResumeListeners?.();
  removeMusicResumeListeners = null;
}

function retryPendingMusic(): void {
  const asset = pendingMusicAsset;
  if (!asset) return;
  pendingMusicAsset = null;
  BROWSER_AUDIO.playMusic(asset);
}

function waitForUserGesture(): void {
  if (removeMusicResumeListeners || typeof document === 'undefined') return;

  const retry = (): void => {
    clearMusicResumeListeners();
    retryPendingMusic();
  };
  document.addEventListener('pointerdown', retry, { once: true });
  document.addEventListener('keydown', retry, { once: true });
  removeMusicResumeListeners = () => {
    document.removeEventListener('pointerdown', retry);
    document.removeEventListener('keydown', retry);
  };
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
    pendingMusicAsset = asset;
    try {
      currentMusic?.pause();
      const audio = new Audio(asset);
      currentMusic = audio;
      audio.loop = true;
      audio.volume = musicVolume;
      const playback = audio.play();
      void playback.catch(() => {
        if (currentMusic !== audio) return;
        currentMusic = null;
        pendingMusicAsset = asset;
        waitForUserGesture();
      });
      pendingMusicAsset = null;
      clearMusicResumeListeners();
    } catch {
      // Audio is an enhancement and is safe to omit, but can retry after a gesture.
      waitForUserGesture();
    }
  },
  stopMusic: () => {
    currentMusic?.pause();
    currentMusic = null;
    pendingMusicAsset = null;
    clearMusicResumeListeners();
  },
  setMusicVolume: (volume) => {
    musicVolume = clampVolume(volume);
    if (!currentMusic) {
      if (musicVolume > 0) retryPendingMusic();
      return;
    }
    currentMusic.volume = musicVolume;
    if (musicVolume === 0) currentMusic.pause();
    else void currentMusic.play().catch(() => undefined);
  },
  setEffectsVolume: (volume) => {
    effectsVolume = clampVolume(volume);
  },
};

export const AUDIO = new InjectionToken<AudioPort>('AUDIO');
