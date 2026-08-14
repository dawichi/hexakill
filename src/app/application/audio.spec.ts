import { describe, expect, it } from 'vitest';
import { AudioPort } from './audio';

describe('audio boundary', () => {
  it('keeps playback behind a replaceable port', () => {
    const played: string[] = [];
    const audio: AudioPort = {
      playSound: (asset) => played.push(asset),
      playMusic: (asset) => played.push(asset),
      stopMusic: () => played.push('stop'),
    };

    audio.playSound('/sounds/attack.mp3');
    audio.playMusic('/music/dungeon.mp3');
    audio.stopMusic();
    expect(played).toEqual(['/sounds/attack.mp3', '/music/dungeon.mp3', 'stop']);
  });
});
