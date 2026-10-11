import { describe, expect, it } from 'vitest';
import { combatMessagePresentationDelay } from './combat-message-timing';

describe('combatMessagePresentationDelay', () => {
  it('matches the normal typewriter duration and reading pause', () => {
    expect(combatMessagePresentationDelay('You use Magic.', 'normal', 320)).toBe(708);
  });

  it('uses the slow typewriter duration', () => {
    expect(combatMessagePresentationDelay('You use Magic.', 'slow', 320)).toBe(988);
  });

  it('honors the event minimum and instant setting', () => {
    expect(combatMessagePresentationDelay('OK', 'normal', 500)).toBe(500);
    expect(combatMessagePresentationDelay('You use Magic.', 'instant', 320)).toBe(0);
  });
});
