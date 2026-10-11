import { InjectionToken } from '@angular/core';
import { AUDIO_ASSETS, MusicTrack, SoundEffect } from '../domain/assets';

export interface AudioPort {
  playSound(effect: SoundEffect): void;
  /** Loop a track; replaying the current track is a no-op. */
  playMusic(track: MusicTrack): void;
  stopMusic(): void;
  /** Gains from 0 to 0.5; zero music pauses the track. */
  setVolumes(music: number, effects: number): void;
}

/** Browser audio. Autoplay rejections wait for the first user gesture, then retry. */
export function createBrowserAudio(): AudioPort {
  let music: HTMLAudioElement | null = null;
  let track: MusicTrack | null = null;
  let musicVolume = 0;
  let effectsVolume = 0;
  let waitingForGesture = false;

  const resume = (): void => {
    if (!music || musicVolume === 0) return;
    void music.play().catch(() => waitForGesture());
  };

  const waitForGesture = (): void => {
    if (waitingForGesture || typeof document === 'undefined') return;
    waitingForGesture = true;
    const retry = (): void => {
      waitingForGesture = false;
      document.removeEventListener('pointerdown', retry);
      document.removeEventListener('keydown', retry);
      resume();
    };
    document.addEventListener('pointerdown', retry);
    document.addEventListener('keydown', retry);
  };

  return {
    playSound: (effect) => {
      if (effectsVolume === 0) return;
      try {
        const sound = new Audio(AUDIO_ASSETS.sounds[effect]);
        sound.volume = effectsVolume;
        void sound.play().catch(() => undefined);
      } catch {
        // Sound effects are an enhancement.
      }
    },
    playMusic: (next) => {
      if (track === next && music) return;
      music?.pause();
      track = next;
      try {
        music = new Audio(AUDIO_ASSETS.music[next]);
        music.loop = true;
        music.volume = musicVolume;
        resume();
      } catch {
        music = null;
      }
    },
    stopMusic: () => {
      music?.pause();
      music = null;
      track = null;
    },
    setVolumes: (nextMusic, nextEffects) => {
      musicVolume = nextMusic;
      effectsVolume = nextEffects;
      if (!music) return;
      music.volume = musicVolume;
      if (musicVolume === 0) music.pause();
      else if (music.paused) resume();
    },
  };
}

export const AUDIO = new InjectionToken<AudioPort>('AUDIO');
