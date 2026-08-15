import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CHARACTER_DEFINITIONS } from '../domain/characters';
import { GameSessionService } from './game-session.service';
import { CLOCK, Clock } from './clock';
import { RANDOM_SOURCE } from './random';
import { RECORDS_STORAGE, RecordsStoragePort } from './records-storage';

describe('GameSessionService', () => {
  let service: GameSessionService;
  let rolls: number[];
  let recordsValue: string | null;
  let scheduledTask: (() => void) | undefined;
  let cancelled = false;
  const testClock: Clock = {
    now: () => 1234,
    schedule: (task) => {
      scheduledTask = task;
      cancelled = false;
      return { cancel: () => (cancelled = true) };
    },
  };

  beforeEach(() => {
    rolls = [0, 0, 0.5, 0.5];
    recordsValue = null;
    const recordsStorage: RecordsStoragePort = {
      read: () => recordsValue,
      write: (value) => (recordsValue = value),
      clear: () => (recordsValue = null),
    };
    TestBed.configureTestingModule({
      providers: [
        GameSessionService,
        { provide: CLOCK, useValue: testClock },
        { provide: RANDOM_SOURCE, useValue: () => rolls.shift() ?? 0.5 },
        { provide: RECORDS_STORAGE, useValue: recordsStorage },
      ],
    });
    service = TestBed.inject(GameSessionService);
  });

  it('generates an enemy and applies the first attack action', () => {
    service.setPlayerName('David');
    service.selectCharacter(CHARACTER_DEFINITIONS[0]);
    service.startRun();
    service.player.update((player) =>
      player ? { ...player, stats: { ...player.stats, speed: 100 } } : player,
    );
    service.findEnemy();

    expect(service.screen()).toBe('combat');
    expect(service.enemy()?.definition.name).toBe('Adventurer');
    expect(service.enemy()?.level).toBe(2);

    service.attack('attack');

    expect(service.enemy()?.damageTaken).toBe(17);
    expect(service.combatState().phase).toBe('enemy-turn');
    expect(service.combatMessage()).toContain('dealt 17 damage');
    expect(service.lastActionAt()).toBe(1234);

    scheduledTask?.();

    expect(service.combatState().phase).toBe('awaiting-player-action');
    expect(service.playerRemainingHealth()).toBeLessThan(200);
    expect(service.enemyAnimation()).toBe('attack');

    scheduledTask?.();
    expect(service.enemyAnimation()).toBe('idle');

    service.usePotion();
    expect(service.player()?.potions).toBe(4);
    expect(service.combatState().phase).toBe('enemy-turn');
  });

  it('writes one local personal record when a run reaches defeat', () => {
    service.setPlayerName('David');
    service.selectCharacter(CHARACTER_DEFINITIONS[0]);
    service.startRun();
    service.findEnemy();

    const player = service.player();
    const enemy = service.enemy();
    if (!player || !enemy) throw new Error('Expected an active run and enemy.');

    service.player.set({ ...player, stats: { ...player.stats, health: 1 } });
    service.combatState.set({
      phase: 'awaiting-player-action',
      enemy: { ...enemy, stats: { ...enemy.stats, ad: 10_000, ap: 10_000 }, potions: 0 },
      playerDamageTaken: 1,
      pendingAction: null,
      lastResult: null,
    });

    service.usePotion();
    scheduledTask?.();

    expect(service.screen()).toBe('game-over');
    expect(service.personalRecords()).toEqual([{ characterId: 'wizard', name: 'David', level: 4 }]);
    expect(recordsValue).toContain('"version":1');
  });

  it('keeps records when the run is reset', () => {
    service.personalRecords.set([{ characterId: 'warrior', name: 'Alex', level: 9 }]);

    service.reset();

    expect(service.personalRecords()).toHaveLength(1);
  });

  it('cancels delayed enemy turns when a run is reset', () => {
    service.setPlayerName('David');
    service.selectCharacter(CHARACTER_DEFINITIONS[0]);
    service.startRun();
    service.findEnemy();
    service.attack('attack');

    service.reset();

    expect(cancelled).toBe(true);
    scheduledTask?.();
    expect(service.screen()).toBe('welcome');
    expect(service.player()).toBeNull();
  });

  it('lets a faster enemy take the opening turn', () => {
    service.setPlayerName('David');
    service.selectCharacter(CHARACTER_DEFINITIONS[0]);
    service.startRun();
    const player = service.player();
    if (!player) throw new Error('Expected a player.');

    service.player.set({ ...player, stats: { ...player.stats, speed: 1 } });
    service.findEnemy();

    expect(service.combatState().phase).toBe('enemy-turn');
    expect(service.combatMessage()).toContain('attacks first');
    expect(service.canAct()).toBe(false);

    scheduledTask?.();
    expect(service.combatState().phase).toBe('awaiting-player-action');
    expect(service.enemyAnimation()).toBe('attack');
    scheduledTask?.();
    expect(service.enemyAnimation()).toBe('idle');
  });
});
