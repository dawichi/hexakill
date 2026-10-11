/** A seeded pseudo-random source whose whole state is one 32-bit integer (mulberry32). */
export interface Rng {
  next(): number;
  readonly state: number;
}

export function createRng(state: number): Rng {
  let current = state >>> 0;
  return {
    next() {
      current = (current + 0x6d2b79f5) >>> 0;
      let t = current;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
    },
    get state() {
      return current;
    },
  };
}

/** Pick an element of a non-empty list. */
export function pick<T>(rng: Rng, values: readonly T[]): T {
  const value = values[Math.floor(rng.next() * values.length)];
  if (value === undefined) throw new RangeError('Cannot pick from an empty list.');
  return value;
}

export function shuffle<T>(rng: Rng, values: readonly T[]): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(rng.next() * (index + 1));
    [result[index], result[target]] = [result[target] as T, result[index] as T];
  }
  return result;
}

/** FNV-1a hash, used to turn shareable seed text into a numeric seed. */
export function seedFromText(text: string): number {
  let hash = 0x811c9dc5;
  for (const character of text) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Seeds are shown to players as short base-36 codes. */
export function formatSeed(seed: number): string {
  return (seed >>> 0).toString(36).toUpperCase().padStart(7, '0');
}

export function parseSeed(code: string): number | null {
  const normalized = code.trim().toLowerCase();
  if (!/^[0-9a-z]{1,7}$/.test(normalized)) return null;
  const seed = Number.parseInt(normalized, 36);
  return Number.isSafeInteger(seed) && seed <= 0xffffffff ? seed : null;
}

export interface DailyChallenge {
  readonly seed: number;
  readonly date: string;
}

export function dailyChallenge(now: Date): DailyChallenge {
  const date = now.toISOString().slice(0, 10);
  return { seed: seedFromText(`hexakill-daily-${date}`), date };
}
