import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CHARACTER_DEFINITIONS } from '../domain/characters';
import { GameSessionService } from './game-session.service';
import { CLOCK, Clock } from './clock';
import { RANDOM_SOURCE } from './random';

describe('GameSessionService', () => {
  let service: GameSessionService;
  let rolls: number[];
  const testClock: Clock = {
    now: () => 1234,
    schedule: () => ({ cancel: () => undefined }),
  };

  beforeEach(() => {
    rolls = [0, 0, 0.5, 0.5];
    TestBed.configureTestingModule({
      providers: [
        GameSessionService,
        { provide: CLOCK, useValue: testClock },
        { provide: RANDOM_SOURCE, useValue: () => rolls.shift() ?? 0.5 },
      ],
    });
    service = TestBed.inject(GameSessionService);
  });

  it('generates an enemy and applies the first attack action', () => {
    service.setPlayerName('David');
    service.selectCharacter(CHARACTER_DEFINITIONS[0]);
    service.startRun();
    service.findEnemy();

    expect(service.screen()).toBe('combat');
    expect(service.enemy()?.definition.name).toBe('Slime Blue');
    expect(service.enemy()?.level).toBe(2);

    service.attack('attack');

    expect(service.enemy()?.damageTaken).toBe(17);
    expect(service.combatStatus()).toBe('ready');
    expect(service.combatMessage()).toContain('dealt 17 damage');
    expect(service.lastActionAt()).toBe(1234);
  });
});
