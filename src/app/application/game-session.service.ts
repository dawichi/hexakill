import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { AUDIO, AudioPort } from './audio';
import { BROWSER_CLOCK, CLOCK, Clock } from './clock';
import { chooseEnemyAction, CombatAction, resolveAction } from '../domain/combat-actions';
import { applyPowerUp, applyVictoryReward, calculateVictoryReward } from '../domain/progression';
import { purchaseItem, purchasePotions, STORE_ITEMS, STORE_POTIONS } from '../domain/store';
import { generateEnemy } from '../domain/enemies';
import { DamageKind, resolveDamage } from '../domain/combat-rules';
import { INITIAL_COMBAT_STATE, CombatState, transitionCombat } from '../domain/combat-state';
import { CHARACTER_DEFINITIONS, createInitialPlayer } from '../domain/characters';
import { ASSET_MANIFEST } from '../domain/assets';
import { CharacterDefinition, PlayerState } from '../domain/game-types';
import { RANDOM_SOURCE, RandomSource } from './random';
import { SESSION_STORAGE, SessionStoragePort } from './storage';

export type GameScreen =
  'welcome' | 'character-select' | 'combat-ready' | 'combat' | 'store' | 'game-over';

interface StoredSessionSnapshot {
  readonly version: 1;
  readonly screen: GameScreen;
  readonly playerName: string;
  readonly selectedCharacterId: string | null;
  readonly player: PlayerState | null;
  readonly combatState: CombatState;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hasNumberFields(value: unknown, fields: readonly string[]): boolean {
  return (
    isRecord(value) &&
    fields.every((field) => typeof value[field] === 'number' && Number.isFinite(value[field]))
  );
}

function isRestorablePlayer(value: unknown): value is PlayerState {
  if (!isRecord(value) || typeof value['name'] !== 'string' || typeof value['level'] !== 'number') {
    return false;
  }

  const character = value['character'];
  const powerUps = value['powerUps'];
  return (
    isRecord(character) &&
    typeof character['id'] === 'string' &&
    hasNumberFields(value['stats'], ['health', 'ad', 'ap', 'armor', 'mr', 'speed']) &&
    typeof value['experience'] === 'number' &&
    typeof value['potions'] === 'number' &&
    typeof value['gold'] === 'number' &&
    typeof value['bossesDefeated'] === 'number' &&
    Array.isArray(value['inventory']) &&
    isRecord(powerUps) &&
    typeof powerUps['pending'] === 'number' &&
    isRecord(powerUps['history'])
  );
}

function isRestorableCombatState(value: unknown): value is CombatState {
  if (!isRecord(value)) return false;

  const phases = [
    'idle',
    'awaiting-player-action',
    'resolving-player-action',
    'enemy-turn',
    'victory',
    'defeat',
  ];
  return (
    typeof value['phase'] === 'string' &&
    phases.includes(value['phase']) &&
    (value['enemy'] === null || isRecord(value['enemy'])) &&
    typeof value['playerDamageTaken'] === 'number'
  );
}

@Injectable({ providedIn: 'root' })
export class GameSessionService {
  private readonly random: RandomSource = inject(RANDOM_SOURCE, { optional: true }) ?? Math.random;
  private readonly clock: Clock = inject(CLOCK, { optional: true }) ?? BROWSER_CLOCK;
  private readonly storage: SessionStoragePort | null = inject(SESSION_STORAGE, { optional: true });
  private readonly audio: AudioPort | null = inject(AUDIO, { optional: true });
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
  readonly storeItems = STORE_ITEMS;
  readonly storePotions = STORE_POTIONS;
  readonly lastActionAt = signal<number | null>(null);
  readonly combatMessage = signal('');

  constructor() {
    this.restore();
    effect(() => this.persist());
  }
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
    this.audio?.playMusic(ASSET_MANIFEST.music.characterSelect);
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
    this.audio?.playMusic(ASSET_MANIFEST.music.dungeon);
  }

  findEnemy(): void {
    const player = this.player();

    if (!player) {
      return;
    }

    this.applyCombatEvent({
      type: 'enemy-spawned',
      enemy: generateEnemy(player.level, this.random(), this.random(), player.bossesDefeated),
    });
    this.combatMessage.set('The enemy has appeared. Choose an action.');
    this.screen.set('combat');
  }

  openStore(): void {
    if (!this.player() || (this.screen() === 'combat' && !this.canAct())) return;
    this.screen.set('store');
    this.combatMessage.set('');
    this.audio?.playMusic(ASSET_MANIFEST.music.store);
  }

  closeStore(): void {
    this.screen.set(this.enemy() ? 'combat' : 'combat-ready');
    this.audio?.playMusic(ASSET_MANIFEST.music.dungeon);
  }

  buyItem(itemId: string): void {
    const player = this.player();
    if (!player) return;
    const result = purchaseItem(player, itemId);
    this.player.set(result.player);
    this.combatMessage.set(result.purchased ? result.message : result.reason);
    this.audio?.playSound(
      result.purchased ? ASSET_MANIFEST.sounds.coin : ASSET_MANIFEST.sounds.error,
    );
  }

  buyPotions(offerId: string): void {
    const player = this.player();
    if (!player) return;
    const result = purchasePotions(player, offerId);
    this.player.set(result.player);
    this.combatMessage.set(result.purchased ? result.message : result.reason);
    this.audio?.playSound(
      result.purchased ? ASSET_MANIFEST.sounds.potion : ASSET_MANIFEST.sounds.error,
    );
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
    this.audio?.playSound(
      kind === 'attack' ? ASSET_MANIFEST.sounds.attack : ASSET_MANIFEST.sounds.magic,
    );

    const result = resolveDamage({ stats: player.stats }, enemy, kind, {
      damageRoll: this.random(),
      chanceRoll: this.random(),
    });
    const defeated = result.damageTaken >= enemy.stats.health;

    this.applyCombatEvent({ type: 'player-action-resolved', result });

    if (defeated) {
      const reward = calculateVictoryReward(player, enemy);
      this.player.set(applyVictoryReward(player, enemy));
      this.combatMessage.set(
        `The ${enemy.definition.name} was defeated. You gained ${reward.experience} exp and ${reward.gold} gold.`,
      );
      this.audio?.playSound(ASSET_MANIFEST.sounds.enemyKilled);
      return;
    }

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

  usePotion(): void {
    const player = this.player();
    const enemy = this.enemy();
    if (!player || !enemy || !this.canAct() || player.potions <= 0) return;

    const healed = Math.trunc(this.combatState().playerDamageTaken * 0.2);
    if (!this.applyCombatEvent({ type: 'player-potion-used' })) return;

    this.player.set({ ...player, potions: player.potions - 1 });
    this.combatState.update((state) => ({
      ...state,
      playerDamageTaken: Math.max(0, state.playerDamageTaken - healed),
    }));
    this.combatMessage.set(`You used a potion and healed ${healed} HP.`);
    this.audio?.playSound(ASSET_MANIFEST.sounds.potion);
    this.clock.schedule(() => this.resolveEnemyTurn(), 300);
  }

  choosePowerUp(type: Parameters<typeof applyPowerUp>[1]): void {
    const player = this.player();
    if (!player) return;
    this.player.set(applyPowerUp(player, type));
  }

  reset(): void {
    this.screen.set('welcome');
    this.playerName.set('');
    this.selectedCharacter.set(null);
    this.player.set(null);
    this.applyCombatEvent({ type: 'reset' });
    this.lastActionAt.set(null);
    this.combatMessage.set('');
    this.storage?.clear();
    this.audio?.stopMusic();
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
      this.audio?.playSound(ASSET_MANIFEST.sounds.potion);
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
    if (this.combatState().phase === 'defeat') {
      this.screen.set('game-over');
      this.combatMessage.set('You have been defeated. Start a new run to try again.');
    }
  }

  get characters(): readonly CharacterDefinition[] {
    return CHARACTER_DEFINITIONS;
  }

  private persist(): void {
    if (!this.storage) return;

    const phase = this.combatState().phase;
    if (phase === 'resolving-player-action' || phase === 'enemy-turn') return;

    if (this.screen() === 'welcome' && !this.player() && !this.playerName()) {
      this.storage.clear();
      return;
    }

    this.storage.write(
      JSON.stringify({
        version: 1,
        screen:
          this.screen() === 'store' ? (this.enemy() ? 'combat' : 'combat-ready') : this.screen(),
        playerName: this.playerName(),
        selectedCharacterId: this.selectedCharacter()?.id ?? null,
        player: this.player(),
        combatState: this.combatState(),
      }),
    );
  }

  private restore(): void {
    const raw = this.storage?.read();
    if (!raw) return;

    try {
      const snapshot = JSON.parse(raw) as Partial<StoredSessionSnapshot>;
      if (
        snapshot.version !== 1 ||
        typeof snapshot.playerName !== 'string' ||
        !isRestorableCombatState(snapshot.combatState) ||
        (snapshot.player !== null && !isRestorablePlayer(snapshot.player))
      ) {
        this.storage?.clear();
        return;
      }

      const character = CHARACTER_DEFINITIONS.find(
        (item) => item.id === snapshot.selectedCharacterId,
      );
      if (character) this.selectedCharacter.set(character);
      this.playerName.set(snapshot.playerName.slice(0, 14));
      if (snapshot.player) {
        this.player.set(snapshot.player);
        this.combatState.set(snapshot.combatState);
        this.screen.set(
          snapshot.screen === 'combat'
            ? 'combat'
            : snapshot.screen === 'game-over'
              ? 'game-over'
              : 'combat-ready',
        );
        this.combatMessage.set('Your saved run was restored.');
      }
    } catch {
      this.storage?.clear();
    }
  }
}
