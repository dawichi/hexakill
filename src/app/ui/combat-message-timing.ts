import { TextSpeed } from '../domain/preferences';

const CHARACTER_INTERVAL_MS = {
  normal: 22,
  slow: 42,
} as const;
const MESSAGE_PAUSE_MS = 400;

export function combatMessageCharacterInterval(speed: TextSpeed): number {
  return speed === 'instant' ? 0 : CHARACTER_INTERVAL_MS[speed];
}

/** Keep each event visible until its text has finished typing and can be read. */
export function combatMessagePresentationDelay(
  message: string,
  speed: TextSpeed,
  minimumMs = 0,
): number {
  if (speed === 'instant') return 0;
  return Math.max(
    minimumMs,
    message.length * combatMessageCharacterInterval(speed) + MESSAGE_PAUSE_MS,
  );
}
