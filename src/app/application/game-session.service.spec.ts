import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { createRun } from '../domain/run';
import { AUDIO, AudioPort } from './audio';
import { CLOCK, Clock, ClockHandle } from './clock';
import { GameSessionService } from './game-session.service';
import { parseRun, serializeRun } from './run-storage';
import { KeyValueStore, memoryStore, readJson, STORAGE, STORAGE_KEYS } from './storage';

describe('GameSessionService', () => {
  let service: GameSessionService;
  let storage: KeyValueStore & { readonly data: Map<string, string> };
  let scheduled: Array<{ task: () => void; cancelled: boolean; delay: number }>;
  let played: string[];
  let appliedVolumes: Array<readonly [number, number]>;
  const testClock: Clock = {
    now: () => Date.UTC(2026, 9, 11),
    schedule: (task, delay) => {
      const item = { task, cancelled: false, delay };
      scheduled.push(item);
      return { cancel: () => (item.cancelled = true) } satisfies ClockHandle;
    },
  };

  function flushOne(): void {
    const item = scheduled.find((candidate) => !candidate.cancelled);
    if (!item) return;
    item.cancelled = true;
    item.task();
  }

  function configure(): void {
    TestBed.configureTestingModule({
      providers: [
        GameSessionService,
        { provide: STORAGE, useValue: storage },
        { provide: CLOCK, useValue: testClock },
        {
          provide: AUDIO,
          useValue: {
            playSound: (name: string) => played.push(name),
            playMusic: () => undefined,
            stopMusic: () => undefined,
            setVolumes: (music: number, effects: number) => appliedVolumes.push([music, effects]),
          } satisfies AudioPort,
        },
      ],
    });
    service = TestBed.inject(GameSessionService);
  }

  function characterAt(index: number) {
    const character = service.characters[index];
    if (!character) throw new Error(`No character configured at index ${index}.`);
    return character;
  }

  beforeEach(() => {
    TestBed.resetTestingModule();
    storage = memoryStore();
    scheduled = [];
    played = [];
    appliedVolumes = [];
    configure();
  });

  it('starts a v2 run and restores the same route, player, and random cursor', () => {
    service.beginCharacterSelection();
    service.setPlayerName('David');
    service.selectCharacter(characterAt(0));
    service.startRun();

    const saved = parseRun(readJson(storage, STORAGE_KEYS.run));
    expect(saved).not.toBeNull();
    expect(saved?.screen).toBe('map');
    expect(saved?.player.characterId).toBe('wizard');
    expect(saved?.seed).toBeTypeOf('number');
    expect(service.routeMap()?.nodes).toHaveLength(3);

    TestBed.resetTestingModule();
    configure();
    expect(service.screen()).toBe('map');
    expect(service.playerName()).toBe('David');
    expect(service.routeMap()).toEqual(expect.objectContaining({ floor: 1 }));
    expect(service.combatMessage()).toContain('saved run was restored');
  });

  it('saves the resolved domain turn before presenting its event sequence', () => {
    service.beginCharacterSelection();
    service.setPlayerName('Hero');
    service.selectCharacter(characterAt(1));
    service.startRun();
    const before = parseRun(readJson(storage, STORAGE_KEYS.run));
    const encounter = service.routeMap()?.nodes.find((node) => node.kind === 'battle');
    if (!before || !encounter) throw new Error('Expected a saved run and a battle route.');
    service.chooseRouteNode(encounter.id);
    service.skipPresentation();
    expect(service.screen()).toBe('combat');
    expect(service.canAct()).toBe(true);

    const priorCursor = parseRun(readJson(storage, STORAGE_KEYS.run))?.rngState;
    service.attack('attack');
    const after = parseRun(readJson(storage, STORAGE_KEYS.run));
    expect(after).not.toBeNull();
    expect(after?.rngState).not.toBe(priorCursor);
    expect(service.isPresenting()).toBe(true);
    expect(service.canAct()).toBe(false);
    service.skipPresentation();
    expect(service.isPresenting()).toBe(false);
    expect(service.combatState().phase).toMatch(/player-turn|victory|defeat/);
  });

  it('restores a run from a saved v2 checkpoint and discards an in-progress v1 save', () => {
    const initial = createRun(17, 'Hero', 'warrior');
    storage.write(STORAGE_KEYS.run, serializeRun(initial));
    storage.write(STORAGE_KEYS.legacyRun, JSON.stringify({ version: 1, screen: 'combat' }));
    TestBed.resetTestingModule();
    configure();
    expect(service.screen()).toBe('map');
    expect(storage.read(STORAGE_KEYS.legacyRun)).toBeNull();

    storage.write(STORAGE_KEYS.run, JSON.stringify({ version: 2, run: { screen: 'combat' } }));
    TestBed.resetTestingModule();
    configure();
    expect(service.screen()).toBe('welcome');
    expect(storage.read(STORAGE_KEYS.run)).toBeNull();
  });

  it('persists percent-based audio controls, mute, and text speed', () => {
    service.setMusicVolume(100);
    service.setEffectsVolume(40);
    service.setTextSpeed('instant');
    service.toggleMuted();
    expect(service.musicVolume()).toBe(100);
    expect(service.effectsVolume()).toBe(40);
    expect(service.muted()).toBe(true);
    expect(service.textSpeed()).toBe('instant');
    expect(appliedVolumes.at(-1)).toEqual([0, 0]);
    expect(readJson(storage, STORAGE_KEYS.preferences)).toMatchObject({
      version: 2,
      musicVolume: 0.5,
      effectsVolume: 0.2,
      muted: true,
      textSpeed: 'instant',
    });
  });

  it('cancels queued animation and feedback work when reset', () => {
    service.beginCharacterSelection();
    service.setPlayerName('Hero');
    service.selectCharacter(characterAt(0));
    service.startRun();
    const encounter = service.routeMap()?.nodes.find((node) => node.kind === 'battle');
    if (!encounter) throw new Error('Expected a battle route.');
    service.chooseRouteNode(encounter.id);
    expect(service.isPresenting()).toBe(true);
    service.reset();
    expect(service.isPresenting()).toBe(false);
    expect(service.screen()).toBe('welcome');
    expect(scheduled.every((item) => item.cancelled)).toBe(true);
  });

  it('keeps store and daily records in separate storage lists', () => {
    expect(readJson(storage, STORAGE_KEYS.records)).toEqual({ version: 2, records: [] });
    expect(readJson(storage, STORAGE_KEYS.dailyRecords)).toEqual({ version: 2, records: [] });
    service.beginCharacterSelection(true);
    expect(service.dailyRequested()).toBe(true);
    expect(service.screen()).toBe('character-select');
  });

  it('advances event presentation with the injected clock', () => {
    service.beginCharacterSelection();
    service.setPlayerName('Hero');
    service.selectCharacter(characterAt(0));
    service.startRun();
    const encounter = service.routeMap()?.nodes.find((node) => node.kind === 'battle');
    if (!encounter) throw new Error('Expected a battle route.');
    service.chooseRouteNode(encounter.id);
    service.skipPresentation();
    service.attack('attack');
    expect(service.isPresenting()).toBe(true);
    flushOne();
    expect(service.isPresenting()).toBe(true);
  });
});
