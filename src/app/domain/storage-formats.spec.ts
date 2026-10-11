import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PREFERENCES,
  parseStoredPreferences,
  serializePreferences,
  volumeFromPercent,
  volumePercent,
} from './preferences';
import { addPersonalRecord, PersonalRecord, parseStoredRecords, serializeRecords } from './records';

const record = (overrides: Partial<PersonalRecord> = {}): PersonalRecord => ({
  name: 'Hero',
  characterId: 'wizard',
  level: 10,
  rooms: 12,
  victory: false,
  daily: false,
  seed: 'ABC1234',
  date: '2026-10-10',
  ...overrides,
});

describe('personal records', () => {
  it('ranks wins first, then rooms, then level, keeping the top five', () => {
    let records: PersonalRecord[] = [];
    records = addPersonalRecord(records, record({ name: 'Deep', rooms: 25, level: 15 }));
    records = addPersonalRecord(
      records,
      record({ name: 'Winner', victory: true, rooms: 30, level: 12 }),
    );
    records = addPersonalRecord(records, record({ name: 'High', rooms: 25, level: 20 }));
    for (let index = 0; index < 4; index += 1) records = addPersonalRecord(records, record());
    expect(records.map((entry) => entry.name).slice(0, 3)).toEqual(['Winner', 'High', 'Deep']);
    expect(records).toHaveLength(5);
  });

  it('round-trips version 2 and migrates version 1 records', () => {
    const records = [record()];
    expect(parseStoredRecords(JSON.parse(serializeRecords(records)))).toEqual(records);
    const legacy = { version: 1, records: [{ characterId: 'samurai', name: 'Old', level: 9 }] };
    expect(parseStoredRecords(legacy)).toEqual([
      {
        name: 'Old',
        characterId: 'samurai',
        level: 9,
        rooms: 0,
        victory: false,
        daily: false,
        seed: '',
        date: '',
      },
    ]);
  });

  it('drops malformed records', () => {
    expect(parseStoredRecords({ version: 2, records: [{ name: 'x' }, record()] })).toHaveLength(1);
    expect(parseStoredRecords('nope')).toEqual([]);
  });
});

describe('preferences', () => {
  it('round-trips and migrates version 1 volumes', () => {
    const preferences = { ...DEFAULT_PREFERENCES, muted: true, textSpeed: 'instant' as const };
    expect(parseStoredPreferences(JSON.parse(serializePreferences(preferences)))).toEqual(
      preferences,
    );
    expect(parseStoredPreferences({ version: 1, musicVolume: 0.1, effectsVolume: 0.3 })).toEqual({
      ...DEFAULT_PREFERENCES,
      musicVolume: 0.1,
      effectsVolume: 0.3,
    });
    expect(parseStoredPreferences({ version: 1, musicVolume: 9 }).musicVolume).toBe(
      DEFAULT_PREFERENCES.musicVolume,
    );
  });

  it('maps slider percentages onto the gain range', () => {
    expect(volumePercent(0.5)).toBe(100);
    expect(volumePercent(volumeFromPercent(40))).toBe(40);
  });
});
