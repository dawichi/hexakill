import { describe, expect, it } from 'vitest';
import { SessionStoragePort } from './storage';

describe('session storage boundary', () => {
  it('can be implemented by an isolated in-memory adapter', () => {
    let value: string | null = null;
    const storage: SessionStoragePort = {
      read: () => value,
      write: (next) => (value = next),
      clear: () => (value = null),
    };

    storage.write('{"version":1}');
    expect(storage.read()).toBe('{"version":1}');
    storage.clear();
    expect(storage.read()).toBeNull();
  });
});
