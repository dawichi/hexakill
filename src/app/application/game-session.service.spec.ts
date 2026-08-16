import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CHARACTER_DEFINITIONS } from '../domain/characters';
import { GameSessionService } from './game-session.service';
import { CLOCK, Clock } from './clock';
import { RANDOM_SOURCE } from './random';
import { RECORDS_STORAGE, RecordsStoragePort } from './records-storage';
import { AUDIO, AudioPort } from './audio';
import { SESSION_STORAGE, SessionStoragePort } from './storage';
import { INITIAL_COMBAT_STATE } from '../domain/combat-state';

describe('GameSessionService', () => {
  let service: GameSessionService;
  let rolls: number[];
  let recordsValue: string | null;
  let scheduledTask: (() => void) | undefined;
  let cancelled = false;
  let playedSounds: string[];
  let sessionValue: string | null;
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
    sessionValue = null;
    playedSounds = [];
    const recordsStorage: RecordsStoragePort = {
      read: () => recordsValue,
      write: (value) => (recordsValue = value),
      clear: () => (recordsValue = null),
    };
    const audio: AudioPort = {
      playSound: (asset) => playedSounds.push(asset),
      playMusic: () => undefined,
      stopMusic: () => undefined,
      setMusicVolume: () => undefined,
      setEffectsVolume: () => undefined,
    };
    const sessionStorage: SessionStoragePort = {
      read: () => sessionValue,
      write: (value) => (sessionValue = value),
      clear: () => (sessionValue = null),
    };
    TestBed.configureTestingModule({
      providers: [
        GameSessionService,
        { provide: CLOCK, useValue: testClock },
        { provide: RANDOM_SOURCE, useValue: () => rolls.shift() ?? 0.5 },
        { provide: RECORDS_STORAGE, useValue: recordsStorage },
        { provide: SESSION_STORAGE, useValue: sessionStorage },
        { provide: AUDIO, useValue: audio },
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
    expect(service.playerCombatLog()[1]).toEqual({
      title: 'David',
      message: '',
      value: 17,
      icon: '🔪',
    });

    scheduledTask?.();

    expect(service.combatState().phase).toBe('awaiting-player-action');
    expect(service.playerRemainingHealth()).toBeLessThan(200);
    expect(service.enemyAnimation()).toBe('attack');
    expect(service.playerAnimation()).toBe('hit');
    expect(service.enemyCombatLog()[1]).toMatchObject({
      title: 'Adventurer',
      value: expect.any(Number),
      icon: expect.stringMatching(/🔪|☄/),
    });

    scheduledTask?.();
    expect(service.enemyAnimation()).toBe('idle');
    expect(service.playerAnimation()).toBe('idle');

    service.usePotion();
    expect(service.player()?.potions).toBe(4);
    expect(service.combatState().phase).toBe('enemy-turn');

    service.combatState.update((state) => ({
      ...state,
      enemy: state.enemy
        ? { ...state.enemy, damageTaken: state.enemy.stats.health - 1, potions: 1 }
        : null,
    }));
    scheduledTask?.();
    expect(service.enemyAnimation()).toBe('idle');
    expect(service.combatMessage()).toContain('healed');
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

  it('plays the legacy level-up sound when a victory crosses a level', () => {
    service.setPlayerName('David');
    service.selectCharacter(CHARACTER_DEFINITIONS[0]);
    service.startRun();
    service.findEnemy();

    const player = service.player();
    const enemy = service.enemy();
    if (!player || !enemy) throw new Error('Expected an active player and enemy.');

    service.player.set({ ...player, experience: 75 });
    service.combatState.set({
      phase: 'awaiting-player-action',
      enemy: { ...enemy, stats: { ...enemy.stats, health: 1 } },
      playerDamageTaken: 0,
      pendingAction: null,
      lastResult: null,
    });

    service.attack('attack');

    expect(playedSounds).toContain('/sounds/levelup.mp3');
    expect(playedSounds).not.toContain('/sounds/enemy_killed.mp3');
    expect(service.enemyCombatLog()).toContainEqual({
      title: 'Adventurer',
      message: expect.stringContaining('has been defeated'),
    });
    expect(service.playerCombatLog()).toContainEqual({
      title: '',
      message: expect.stringContaining('gained'),
    });
    expect(service.playerCombatLog()).toContainEqual({
      title: '',
      message: expect.stringContaining('leveled up'),
    });
  });

  it('keeps each combat log to the legacy eight-entry window', () => {
    service.setPlayerName('David');
    service.selectCharacter(CHARACTER_DEFINITIONS[0]);
    service.startRun();
    service.player.update((player) =>
      player ? { ...player, stats: { ...player.stats, speed: 100 } } : player,
    );

    for (let index = 0; index < 9; index += 1) {
      service.combatState.set(INITIAL_COMBAT_STATE);
      service.findEnemy();
    }

    expect(service.enemyCombatLog()).toHaveLength(8);
    expect(service.playerCombatLog()).toHaveLength(8);
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

  it('discards snapshots with impossible terminal combat damage', () => {
    sessionValue = JSON.stringify({
      version: 1,
      screen: 'game-over',
      playerName: 'David',
      selectedCharacterId: 'wizard',
      player: {
        name: 'David',
        character: CHARACTER_DEFINITIONS[0],
        level: 4,
        experience: 0,
        stats: { health: 200, ad: 200, ap: 60, armor: 20, mr: 20, speed: 50 },
        potions: 5,
        gold: 2000,
        inventory: [],
        powerUps: { pending: 0, history: { health: 0, ad: 0, ap: 0, speed: 0 } },
        bossesDefeated: 0,
        defeatedEnemies: [],
      },
      combatState: {
        phase: 'defeat',
        enemy: {
          definition: {
            id: 'adventurer',
            name: 'Adventurer',
            archetype: 'basic',
            modifiers: { health: 1, ad: 1, ap: 1, armor: 1, mr: 1, speed: 1 },
            idleAsset: '/images/adventurer/idle.gif',
          },
          level: 2,
          stats: { health: 100, ad: 10, ap: 10, armor: 10, mr: 10, speed: 10 },
          damageTaken: 0,
          potions: 0,
          gold: 125,
        },
        playerDamageTaken: 0,
        pendingAction: null,
        lastResult: null,
      },
    });

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        GameSessionService,
        {
          provide: SESSION_STORAGE,
          useValue: {
            read: () => sessionValue,
            write: () => undefined,
            clear: () => (sessionValue = null),
          },
        },
        {
          provide: RECORDS_STORAGE,
          useValue: { read: () => null, write: () => undefined, clear: () => undefined },
        },
      ],
    });
    const restored = TestBed.inject(GameSessionService);

    expect(restored.screen()).toBe('welcome');
    expect(sessionValue).toBeNull();
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
