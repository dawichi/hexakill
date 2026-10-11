import { isCharacterId } from './characters';
import { CharacterId } from './game-types';

export const PERSONAL_RECORD_LIMIT = 5;

export interface PersonalRecord {
  readonly name: string;
  readonly characterId: CharacterId;
  readonly level: number;
  readonly rooms: number;
  readonly victory: boolean;
  /** Daily records are stored and ranked separately from shareable seeded runs. */
  readonly daily?: boolean;
  /** The shareable seed code, or the daily challenge date. */
  readonly seed: string;
  /** ISO date the run ended. */
  readonly date: string;
}

/** Wins first, then the deepest runs, then the highest level. */
export function sortPersonalRecords(records: readonly PersonalRecord[]): PersonalRecord[] {
  return [...records]
    .sort(
      (left, right) =>
        Number(right.victory) - Number(left.victory) ||
        right.rooms - left.rooms ||
        right.level - left.level,
    )
    .slice(0, PERSONAL_RECORD_LIMIT);
}

export function addPersonalRecord(
  records: readonly PersonalRecord[],
  record: PersonalRecord,
): PersonalRecord[] {
  return sortPersonalRecords([...records, record]);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isLevel(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 1;
}

function isName(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length >= 3 && value.length <= 14;
}

/**
 * Read stored records. Version 1 records only kept name, character, and level; they migrate with
 * zero rooms and no seed so they still rank below any new run of the same level.
 */
export function parseStoredRecords(value: unknown): PersonalRecord[] {
  if (!isRecord(value) || !Array.isArray(value['records'])) return [];
  const records = value['records'].filter(isRecord);
  if (value['version'] === 1) {
    return sortPersonalRecords(
      records.flatMap((record) =>
        isName(record['name']) && isCharacterId(record['characterId']) && isLevel(record['level'])
          ? [
              {
                name: record['name'],
                characterId: record['characterId'],
                level: record['level'],
                rooms: 0,
                victory: false,
                daily: false,
                seed: '',
                date: '',
              },
            ]
          : [],
      ),
    );
  }
  if (value['version'] !== 2) return [];
  return sortPersonalRecords(
    records.flatMap((record) =>
      isName(record['name']) &&
      isCharacterId(record['characterId']) &&
      isLevel(record['level']) &&
      typeof record['rooms'] === 'number' &&
      Number.isSafeInteger(record['rooms']) &&
      record['rooms'] >= 0 &&
      typeof record['victory'] === 'boolean' &&
      typeof record['seed'] === 'string' &&
      typeof record['date'] === 'string'
        ? [
            {
              name: record['name'],
              characterId: record['characterId'],
              level: record['level'],
              rooms: record['rooms'],
              victory: record['victory'],
              daily: record['daily'] === true,
              seed: record['seed'],
              date: record['date'],
            },
          ]
        : [],
    ),
  );
}

export function serializeRecords(records: readonly PersonalRecord[]): string {
  return JSON.stringify({
    version: 2,
    records: records.map((record) => ({ ...record, daily: record.daily === true })),
  });
}
