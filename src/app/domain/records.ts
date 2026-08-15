import { CHARACTER_DEFINITIONS } from './characters';
import { CharacterId } from './game-types';

export const PERSONAL_RECORD_LIMIT = 5;

export interface PersonalRecord {
  readonly characterId: CharacterId;
  readonly name: string;
  readonly level: number;
}

export interface StoredRecordsSnapshot {
  readonly version: 1;
  readonly records: readonly PersonalRecord[];
}

export function sortPersonalRecords(records: readonly PersonalRecord[]): PersonalRecord[] {
  return [...records]
    .sort((left, right) => right.level - left.level)
    .slice(0, PERSONAL_RECORD_LIMIT);
}

export function createPersonalRecord(
  characterId: CharacterId,
  name: string,
  level: number,
): PersonalRecord {
  return { characterId, name, level };
}

export function isStoredRecordsSnapshot(value: unknown): value is StoredRecordsSnapshot {
  if (typeof value !== 'object' || value === null) return false;
  const snapshot = value as { version?: unknown; records?: unknown };

  return (
    snapshot.version === 1 &&
    Array.isArray(snapshot.records) &&
    snapshot.records.length <= PERSONAL_RECORD_LIMIT &&
    snapshot.records.every(isPersonalRecord)
  );
}

function isPersonalRecord(value: unknown): value is PersonalRecord {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as { characterId?: unknown; name?: unknown; level?: unknown };

  return (
    typeof record.characterId === 'string' &&
    CHARACTER_DEFINITIONS.some((character) => character.id === record.characterId) &&
    typeof record.name === 'string' &&
    record.name.length >= 3 &&
    record.name.length <= 14 &&
    typeof record.level === 'number' &&
    Number.isInteger(record.level) &&
    record.level >= 1
  );
}
