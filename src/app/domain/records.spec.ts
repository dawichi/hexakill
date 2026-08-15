import { describe, expect, it } from 'vitest';
import {
  createPersonalRecord,
  isStoredRecordsSnapshot,
  PERSONAL_RECORD_LIMIT,
  sortPersonalRecords,
} from './records';

describe('personal records', () => {
  it('sorts newest results by level and keeps the top five', () => {
    const records = Array.from({ length: PERSONAL_RECORD_LIMIT + 1 }, (_, index) =>
      createPersonalRecord('wizard', `Agent${index}`, index + 1),
    );

    expect(sortPersonalRecords(records).map((record) => record.level)).toEqual([6, 5, 4, 3, 2]);
  });

  it('validates the versioned storage envelope', () => {
    const snapshot = {
      version: 1,
      records: [createPersonalRecord('samurai', 'Agent', 8)],
    };

    expect(isStoredRecordsSnapshot(snapshot)).toBe(true);
    expect(isStoredRecordsSnapshot({ version: 1, records: [{ name: 'Agent', level: 8 }] })).toBe(
      false,
    );
    expect(isStoredRecordsSnapshot({ version: 2, records: snapshot.records })).toBe(false);
  });

  it('rejects malformed record boundaries', () => {
    expect(
      isStoredRecordsSnapshot({
        version: 1,
        records: Array.from({ length: PERSONAL_RECORD_LIMIT + 1 }, () =>
          createPersonalRecord('wizard', 'Agent', 4),
        ),
      }),
    ).toBe(false);
    expect(
      isStoredRecordsSnapshot({
        version: 1,
        records: [{ characterId: 'wizard', name: '   ', level: 4 }],
      }),
    ).toBe(false);
    expect(
      isStoredRecordsSnapshot({
        version: 1,
        records: [{ characterId: 'wizard', name: 'Agent', level: 1.5 }],
      }),
    ).toBe(false);
  });
});
