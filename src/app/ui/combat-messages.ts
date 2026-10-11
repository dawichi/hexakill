import { CombatEvent } from '../domain/combat';

function assertNever(value: never): never {
  throw new Error(`Unexpected combat status: ${value}`);
}

export function combatEventMessage(event: CombatEvent, enemyName = 'The enemy'): string {
  switch (event.type) {
    case 'combat-start':
      return event.opening === 'enemy' ? 'The enemy acts first.' : 'Choose your response.';
    case 'action':
      if (event.actor === 'player') {
        if (event.action === 'guard') return 'You raise your guard.';
        if (event.action === 'potion') return 'You drink a potion.';
        return `You use ${event.action === 'attack' ? 'Attack' : 'Magic'}.`;
      }
      if (event.label) return `${enemyName} uses ${event.label}.`;
      return `${enemyName} prepares ${event.action === 'heal' ? 'to heal' : event.action === 'charge' ? 'a charged attack' : event.action}.`;
    case 'hit': {
      const subject = event.target === 'enemy' ? 'You' : enemyName;
      const possessive = event.target === 'enemy' ? 'Your' : `${enemyName}'s`;
      return event.missed
        ? `${possessive} ${event.kind} missed.`
        : `${subject} dealt ${event.amount} ${event.kind} damage${event.blocked ? `; ${event.blocked} Block absorbed` : ''}${event.critical ? ' · critical hit' : ''}.`;
    }
    case 'effect-damage':
      return `${event.source.replaceAll('-', ' ')} dealt ${event.amount} effect damage.`;
    case 'block':
      return `${event.target === 'player' ? 'You' : enemyName} gained ${event.amount} Block.`;
    case 'heal':
      return `${event.target === 'player' ? 'You' : enemyName} restored ${event.amount} Health.`;
    case 'status':
      switch (event.status) {
        case 'hex':
          return 'Arcane mark applied. Your next Attack deals bonus damage.';
        case 'hex-consumed':
          return 'Your Attack consumed the Arcane mark.';
        case 'venom':
          return `${event.amount ?? 0} Venom applied.`;
        case 'charged':
          return 'The enemy is charging a powerful attack.';
        case 'cleansed':
          return 'The Water Priestess cleansed its Hex and Venom.';
        default:
          return assertNever(event.status);
      }
    case 'relic':
      return event.note;
    case 'victory':
      return `${enemyName} is defeated. Choose a power-up, then continue.`;
    case 'defeat':
      return 'You have been defeated.';
  }
}
