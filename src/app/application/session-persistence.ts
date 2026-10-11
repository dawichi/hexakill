import { Preferences, parseStoredPreferences, serializePreferences } from '../domain/preferences';
import { PersonalRecord, parseStoredRecords, serializeRecords } from '../domain/records';
import { RunState } from '../domain/run';
import { parseRun, serializeRun } from './run-storage';
import { KeyValueStore, readJson, STORAGE_KEYS } from './storage';

export class SessionPersistence {
  constructor(private readonly storage: KeyValueStore) {}

  restoreRun(): RunState | null {
    const saved = parseRun(readJson(this.storage, STORAGE_KEYS.run));
    // A v1 in-progress session cannot be represented safely by the v2 state model.
    this.storage.remove(STORAGE_KEYS.legacyRun);
    if (!saved) this.storage.remove(STORAGE_KEYS.run);
    return saved;
  }

  saveRun(run: RunState | null): void {
    if (run) this.storage.write(STORAGE_KEYS.run, serializeRun(run));
    else this.storage.remove(STORAGE_KEYS.run);
  }

  restorePreferences(): Preferences {
    const current = readJson(this.storage, STORAGE_KEYS.preferences);
    const legacy =
      current === undefined ? readJson(this.storage, STORAGE_KEYS.legacyPreferences) : undefined;
    const preferences = parseStoredPreferences(current ?? legacy);
    this.savePreferences(preferences);
    if (legacy !== undefined) this.storage.remove(STORAGE_KEYS.legacyPreferences);
    return preferences;
  }

  savePreferences(preferences: Preferences): void {
    this.storage.write(STORAGE_KEYS.preferences, serializePreferences(preferences));
  }

  readRecords(daily: boolean): PersonalRecord[] {
    const currentKey = daily ? STORAGE_KEYS.dailyRecords : STORAGE_KEYS.records;
    const current = readJson(this.storage, currentKey);
    const legacy =
      !daily && current === undefined
        ? readJson(this.storage, STORAGE_KEYS.legacyRecords)
        : undefined;
    const records = parseStoredRecords(current ?? legacy);
    return records.filter((record) => (record.daily === true) === daily);
  }

  saveRecords(
    personalRecords: readonly PersonalRecord[],
    dailyRecords: readonly PersonalRecord[],
  ): void {
    this.storage.write(STORAGE_KEYS.records, serializeRecords(personalRecords));
    this.storage.write(STORAGE_KEYS.dailyRecords, serializeRecords(dailyRecords));
  }
}
