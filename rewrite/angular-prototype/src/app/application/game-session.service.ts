import { Injectable, computed, inject, signal } from '@angular/core';
import { BROWSER_CLOCK, CLOCK, Clock } from './clock';
import { chooseEnemyAction, CombatAction, resolveAction } from '../domain/combat-actions';
import { generateEnemy } from '../domain/enemies';
import { DamageKind, resolveDamage } from '../domain/combat-rules';
import { INITIAL_COMBAT_STATE, CombatState, transitionCombat } from '../domain/combat-state';
import { CHARACTER_DEFINITIONS, createInitialPlayer } from '../domain/characters';
import { CharacterDefinition, PlayerState } from '../domain/game-types';
import { RANDOM_SOURCE, RandomSource } from './random';

export type GameScreen = 'welcome' | 'character-select' | 'combat-ready' | 'combat';

@Injectable({ providedIn: 'root' })
export class GameSessionService {
  private readonly random: RandomSource = inject(RANDOM_SOURCE, { optional: true }) ?? Math.random;
  private readonly clock: Clock = inject(CLOCK, { optional: true }) ?? BROWSER_CLOCK;
  readonly screen = signal<GameScreen>('welcome');
  readonly playerName = signal('');
  readonly selectedCharacter = signal<CharacterDefinition | null>(null);
  readonly player = signal<PlayerState | null>(null);
  readonly combatState = signal<CombatState>(INITIAL_COMBAT_STATE);
  readonly enemy = computed(() => this.combatState().enemy);
  readonly combatStatus = computed<'ready' | 'defeated'>(() =>
    this.combatState().phase === 'victory' || this.combatState().phase === 'defeat'
      ? 'defeated'
      : 'ready',
  );
  readonly playerRemainingHealth = computed(() => {
    const player = this.player();
    return player ? Math.max(0, player.stats.health - this.combatState().playerDamageTaken) : 0;
  });
  readonly canAct = computed(() => this.combatState().phase === 'awaiting-player-action');
  readonly lastActionAt = signal<number | null>(null);
  readonly combatMessage = signal('');
  readonly validationMessage = computed(() => {
    const name = this.playerName().trim();

    if (!name) {
      return 'Enter a name to continue.';
    }

    if (name.length < 3 || name.length > 14) {
      return 'Name must contain between 3 and 14 characters.';
    }

    if (!this.selectedCharacter()) {
      return 'Choose a character to continue.';
    }

    return '';
  });

  readonly canStartRun = computed(() => this.validationMessage() === '');

  beginCharacterSelection(): void {
    this.screen.set('character-select');
  }

  setPlayerName(name: string): void {
    this.playerName.set(name.slice(0, 14));
  }

  selectCharacter(character: CharacterDefinition): void {
    this.selectedCharacter.set(character);
  }

  startRun(): void {
    const character = this.selectedCharacter();
    const name = this.playerName().trim();

    if (!character || name.length < 3 || name.length > 14) {
      return;
    }

    this.player.set(createInitialPlayer(name, character));
    this.combatState.set(INITIAL_COMBAT_STATE);
    this.combatMessage.set('Find an enemy to begin combat.');
    this.screen.set('combat-ready');
  }

  findEnemy(): void {
    const player = this.player();

    if (!player) {
      return;
    }

    this.applyCombatEvent({
      type: 'enemy-spawned',
      enemy: generateEnemy(player.level, this.random(), this.random()),
    });
    this.combatMessage.set('The enemy has appeared. Choose an action.');
    this.screen.set('combat');
  }

  attack(kind: DamageKind): void {
    const player = this.player();
    const enemy = this.enemy();

    if (!player || !enemy || this.combatStatus() === 'defeated') {
      return;
    }

    if (!this.applyCombatEvent({ type: 'player-action-started', kind })) {
      return;
    }
    this.lastActionAt.set(this.clock.now());

    const result = resolveDamage({ stats: player.stats }, enemy, kind, {
      damageRoll: this.random(),
      chanceRoll: this.random(),
    });
    const defeated = result.damageTaken >= enemy.stats.health;

    this.applyCombatEvent({ type: 'player-action-resolved', result });

    if (result.missed) {
      this.combatMessage.set(`Your ${kind} missed.`);
    } else {
      const criticalMessage = result.critical ? ' Critical hit.' : '';
      this.combatMessage.set(
        `Your ${kind} dealt ${result.damageAfterResistance} damage.${criticalMessage}${
          defeated ? ` ${enemy.definition.name} was defeated.` : ''
        }`,
      );
    }

    if (this.combatState().phase === 'enemy-turn') {
      this.combatMessage.set(`${this.combatMessage()} The enemy is preparing its turn.`);
      this.clock.schedule(() => this.resolveEnemyTurn(), 300);
    }
  }

  reset(): void {
    this.screen.set('welcome');
    this.playerName.set('');
    this.selectedCharacter.set(null);
    this.player.set(null);
    this.applyCombatEvent({ type: 'reset' });
    this.lastActionAt.set(null);
    this.combatMessage.set('');
  }

  private applyCombatEvent(event: Parameters<typeof transitionCombat>[1]): boolean {
    const transition = transitionCombat(this.combatState(), event);

    if (!transition.accepted) {
      return false;
    }

    this.combatState.set(transition.state);
    return true;
  }

  private resolveEnemyTurn(): void {
    const player = this.player();
    const enemy = this.enemy();

    if (!player || !enemy || this.combatState().phase !== 'enemy-turn') {
      return;
    }

    const action: CombatAction = chooseEnemyAction(enemy, this.random());
    const result = resolveAction(
      { stats: enemy.stats },
      enemy.damageTaken,
      { stats: player.stats, damageTaken: this.combatState().playerDamageTaken },
      action,
      { damageRoll: this.random(), chanceRoll: this.random() },
    );

    if ('action' in result) {
      this.combatState.update((state) => ({
        ...state,
        enemy: state.enemy
          ? {
              ...state.enemy,
              damageTaken: result.damageTaken,
              potions: Math.max(0, state.enemy.potions - 1),
            }
          : null,
      }));
      this.combatMessage.set(`${enemy.definition.name} healed ${result.healed} HP.`);
    } else {
      this.combatMessage.set(
        result.missed
          ? `${enemy.definition.name}'s ${action} missed.`
          : `${enemy.definition.name}'s ${action} dealt ${result.damageAfterResistance} damage.`,
      );
    }

    const playerDamageTaken =
      'action' in result ? this.combatState().playerDamageTaken : result.damageTaken;
    this.applyCombatEvent({
      type: 'enemy-action-resolved',
      playerDamageTaken,
      playerHealth: player.stats.health,
    });
  }

  get characters(): readonly CharacterDefinition[] {
    return CHARACTER_DEFINITIONS;
  }
}
