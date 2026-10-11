import { describe, expect, it } from 'vitest';
import { CombatEvent, CombatEventBody, CombatSnapshot } from '../domain/combat';
import { combatEventMessage } from './combat-messages';

const snapshot: CombatSnapshot = {
  playerHealth: 50,
  playerMaxHealth: 100,
  playerBlock: 0,
  potions: 0,
  enemyHealth: 40,
  enemyMaxHealth: 80,
  enemyBlock: 0,
  enemyHexed: false,
  enemyVenom: 0,
  enemyCharged: false,
  intent: null,
};

function event(body: CombatEventBody): CombatEvent {
  return { ...body, snapshot } as CombatEvent;
}

describe('combatEventMessage', () => {
  it('keeps the complete hit result and names its target', () => {
    expect(
      combatEventMessage(
        event({
          type: 'hit',
          target: 'player',
          kind: 'attack',
          amount: 0,
          blocked: 12,
          critical: false,
          missed: false,
        }),
        'Fire Knight',
      ),
    ).toBe('Fire Knight dealt 0 attack damage; 12 Block absorbed.');
  });

  it('describes status and relic events from their event data', () => {
    expect(
      combatEventMessage(event({ type: 'status', target: 'enemy', status: 'venom', amount: 4 })),
    ).toBe('4 Venom applied.');
    expect(
      combatEventMessage(
        event({ type: 'relic', relicId: 'phoenix-feather', note: 'Phoenix Feather saved you.' }),
      ),
    ).toBe('Phoenix Feather saved you.');
  });

  it('uses boss technique labels and outcome names', () => {
    expect(
      combatEventMessage(
        event({ type: 'action', actor: 'enemy', action: 'charge', label: 'Cinderfall' }),
        'Fire Knight',
      ),
    ).toBe('Fire Knight uses Cinderfall.');
    expect(combatEventMessage(event({ type: 'victory' }), 'Bringer of Death')).toBe(
      'Bringer of Death is defeated. Choose a power-up, then continue.',
    );
  });
});
