import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { AUDIO, AudioPort } from './audio';
import { BROWSER_CLOCK, CLOCK, Clock, ClockHandle } from './clock';
import {
  chooseEnemyAction,
  CombatAction,
  determineFirstActor,
  resolveAction,
} from '../domain/combat-actions';
import {
  applyPowerUp,
  applyVictoryReward,
  calculateVictoryReward,
  MAX_POWER_UPS,
  MAX_POWER_UPS_PER_STAT,
} from '../domain/progression';
import { purchaseItem, purchasePotions, STORE_ITEMS, STORE_POTIONS } from '../domain/store';
import {
  enemyAssetFor,
  enemySpriteAssetFor,
  ENEMY_DEFINITIONS,
  findEnemyDefinition,
  generateEnemy,
} from '../domain/enemies';
import { DamageKind, DamageResult, resolveDamage } from '../domain/combat-rules';
import { INITIAL_COMBAT_STATE, CombatState, transitionCombat } from '../domain/combat-state';
import { CHARACTER_DEFINITIONS, createInitialPlayer } from '../domain/characters';
import { ASSET_MANIFEST } from '../domain/assets';
import {
  createRouteMap,
  findRouteNode,
  isRouteMapState,
  RouteMapState,
  RouteNodeKind,
} from '../domain/route-map';
import {
  CharacterDefinition,
  CombatLogEntry,
  DefeatedEnemy,
  EnemyState,
  MAX_COMBAT_LOG_ENTRIES,
  PlayerState,
  SpriteStripAsset,
  Stats,
} from '../domain/game-types';
import { RANDOM_SOURCE, RandomSource } from './random';
import { RECORDS_STORAGE, RecordsStoragePort } from './records-storage';
import { PREFERENCES_STORAGE, PreferencesStoragePort } from './preferences-storage';
import { SESSION_STORAGE, SessionStoragePort } from './storage';
import {
  createPersonalRecord,
  isStoredRecordsSnapshot,
  PersonalRecord,
  sortPersonalRecords,
} from '../domain/records';
import {
  AudioPreferences,
  clampVolume,
  DEFAULT_EFFECTS_VOLUME,
  DEFAULT_MUSIC_VOLUME,
  isStoredPreferencesSnapshot,
} from '../domain/preferences';

export type GameScreen = 'welcome' | 'character-select' | 'map' | 'combat' | 'store' | 'game-over';

export interface DefeatedEnemySummary {
  readonly enemyId: string;
  readonly name: string;
  readonly idleAsset: string;
  readonly count: number;
  readonly levelsLabel: string;
}

interface StoredSessionSnapshot {
  readonly version: 1;
  readonly screen: GameScreen;
  readonly playerName: string;
  readonly selectedCharacterId: string | null;
  readonly player: PlayerState | null;
  readonly combatState: CombatState;
  readonly routeFloor?: number;
  readonly routeMap?: RouteMapState | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

const STAT_KEYS: readonly (keyof Stats)[] = ['health', 'ad', 'ap', 'armor', 'mr', 'speed'];

function hasNumberFields(value: unknown, fields: readonly string[]): boolean {
  return (
    isRecord(value) &&
    fields.every(
      (field) =>
        typeof value[field] === 'number' && Number.isFinite(value[field]) && value[field] >= 0,
    )
  );
}

function isStats(value: unknown): value is Stats {
  return hasNumberFields(value, STAT_KEYS);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function isRestorablePlayer(value: unknown): value is PlayerState {
  if (
    !isRecord(value) ||
    typeof value['name'] !== 'string' ||
    value['name'].trim().length < 3 ||
    value['name'].length > 14 ||
    !isNonNegativeInteger(value['level']) ||
    value['level'] < 1 ||
    !isNonNegativeInteger(value['experience']) ||
    value['experience'] >= 100 ||
    !isStats(value['stats']) ||
    value['stats']['health'] <= 0 ||
    !isNonNegativeInteger(value['potions']) ||
    !isNonNegativeInteger(value['gold']) ||
    !isNonNegativeInteger(value['bossesDefeated']) ||
    value['bossesDefeated'] > 3 ||
    (value['defeatedEnemies'] !== undefined &&
      (!Array.isArray(value['defeatedEnemies']) ||
        !value['defeatedEnemies'].every(isRestorableDefeatedEnemy)))
  ) {
    return false;
  }

  const character = value['character'];
  const powerUps = value['powerUps'];
  const history = isRecord(powerUps) ? powerUps['history'] : null;
  const inventory = value['inventory'];
  const powerUpTypes = ['health', 'ad', 'ap', 'speed'] as const;

  if (
    !isRecord(character) ||
    !CHARACTER_DEFINITIONS.some((candidate) => candidate.id === character['id']) ||
    !Array.isArray(inventory) ||
    !inventory.every(
      (item) =>
        isRecord(item) &&
        typeof item['id'] === 'string' &&
        STORE_ITEMS.some((candidate) => candidate.id === item['id']),
    ) ||
    new Set(inventory.map((item) => (item as Record<string, unknown>)['id'])).size !==
      inventory.length ||
    !isRecord(powerUps) ||
    !isNonNegativeInteger(powerUps['pending']) ||
    powerUps['pending'] > MAX_POWER_UPS ||
    !isRecord(history) ||
    !powerUpTypes.every(
      (type) => isNonNegativeInteger(history[type]) && history[type] <= MAX_POWER_UPS_PER_STAT,
    )
  ) {
    return false;
  }

  const historyTotal = powerUpTypes.reduce((total, type) => total + Number(history[type]), 0);
  return Number(powerUps['pending']) + historyTotal <= MAX_POWER_UPS;
}

function isRestorableDefeatedEnemy(value: unknown): value is DefeatedEnemy {
  if (!isRecord(value)) return false;

  return (
    typeof value['enemyId'] === 'string' &&
    findEnemyDefinition(value['enemyId']) !== undefined &&
    isNonNegativeInteger(value['level']) &&
    value['level'] >= 1
  );
}

function isRestorableEnemy(value: unknown): value is EnemyState {
  if (!isRecord(value)) return false;

  const definition = value['definition'];
  return (
    isRecord(definition) &&
    typeof definition['id'] === 'string' &&
    (ENEMY_DEFINITIONS.some((candidate) => candidate.id === definition['id']) ||
      /^gold-slime-[1-3]$/.test(definition['id'])) &&
    typeof definition['name'] === 'string' &&
    ['basic', 'ad', 'ap', 'tank', 'boss'].includes(String(definition['archetype'])) &&
    isStats(definition['modifiers']) &&
    typeof definition['idleAsset'] === 'string' &&
    isNonNegativeInteger(value['level']) &&
    value['level'] >= 1 &&
    isStats(value['stats']) &&
    value['stats']['health'] > 0 &&
    isNonNegativeInteger(value['damageTaken']) &&
    value['damageTaken'] <= value['stats']['health'] &&
    isNonNegativeInteger(value['potions']) &&
    isNonNegativeInteger(value['gold'])
  );
}

function isDamageKind(value: unknown): value is DamageKind {
  return value === 'attack' || value === 'magic';
}

function isRestorableDamageResult(value: unknown): value is DamageResult {
  return (
    isRecord(value) &&
    isDamageKind(value['kind']) &&
    hasNumberFields(value, ['rawDamage', 'damageAfterResistance', 'damageTaken']) &&
    typeof value['critical'] === 'boolean' &&
    typeof value['missed'] === 'boolean'
  );
}

function isRestorableCombatState(value: unknown): value is CombatState {
  if (!isRecord(value)) return false;

  const enemy = value['enemy'];
  const lastResult = value['lastResult'];
  const coherentLastResult =
    lastResult === null ||
    (isRecord(enemy) &&
      isRestorableDamageResult(lastResult) &&
      typeof enemy['damageTaken'] === 'number' &&
      isRecord(enemy['stats']) &&
      typeof enemy['stats']['health'] === 'number' &&
      lastResult.damageTaken === enemy['damageTaken'] &&
      lastResult.damageTaken <= enemy['stats']['health']);

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
    (enemy === null || isRestorableEnemy(enemy)) &&
    isNonNegativeInteger(value['playerDamageTaken']) &&
    (enemy !== null || value['playerDamageTaken'] === 0) &&
    value['pendingAction'] === null &&
    coherentLastResult
  );
}

function isRestorableRouteFloor(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 1;
}

function strengthenEliteEnemy(enemy: EnemyState): EnemyState {
  const stats = { ...enemy.stats };
  (Object.keys(stats) as (keyof Stats)[]).forEach((stat) => {
    stats[stat] = Math.round(stats[stat] * 1.3);
  });
  return { ...enemy, stats, gold: Math.round(enemy.gold * 1.5) };
}

function hasCoherentSessionState(snapshot: Partial<StoredSessionSnapshot>): boolean {
  const hasPlayer = snapshot.player !== null && snapshot.player !== undefined;
  const hasEnemy = snapshot.combatState?.enemy !== null;
  const phase = snapshot.combatState?.phase;

  if (!hasPlayer) {
    return (
      (snapshot.screen === 'welcome' || snapshot.screen === 'character-select') &&
      phase === 'idle' &&
      !hasEnemy
    );
  }

  if (snapshot.screen === 'combat') {
    if (!hasEnemy || !snapshot.combatState?.enemy) return false;

    const enemyDefeated =
      snapshot.combatState.enemy.damageTaken >= snapshot.combatState.enemy.stats.health;
    return (
      (phase === 'awaiting-player-action' && !enemyDefeated) ||
      (phase === 'victory' && enemyDefeated)
    );
  }

  if (snapshot.screen === 'map') {
    const mapEnemy = snapshot.combatState?.enemy;
    return (
      phase === 'victory' &&
      mapEnemy !== null &&
      mapEnemy !== undefined &&
      mapEnemy.damageTaken >= mapEnemy.stats.health &&
      isRouteMapState(snapshot.routeMap)
    );
  }

  if (snapshot.screen === 'store') {
    const storeEnemy = snapshot.combatState?.enemy;
    return (
      phase === 'victory' &&
      storeEnemy !== null &&
      storeEnemy !== undefined &&
      storeEnemy.damageTaken >= storeEnemy.stats.health &&
      (snapshot.routeMap === null || snapshot.routeMap === undefined)
    );
  }

  return (
    snapshot.screen === 'game-over' &&
    phase === 'defeat' &&
    hasEnemy &&
    snapshot.player !== null &&
    snapshot.player !== undefined &&
    snapshot.combatState !== undefined &&
    snapshot.combatState.playerDamageTaken >= snapshot.player.stats.health
  );
}

@Injectable({ providedIn: 'root' })
export class GameSessionService {
  private readonly random: RandomSource = inject(RANDOM_SOURCE, { optional: true }) ?? Math.random;
  private readonly clock: Clock = inject(CLOCK, { optional: true }) ?? BROWSER_CLOCK;
  private readonly storage: SessionStoragePort | null = inject(SESSION_STORAGE, { optional: true });
  private readonly recordsStorage: RecordsStoragePort | null = inject(RECORDS_STORAGE, {
    optional: true,
  });
  private readonly preferencesStorage: PreferencesStoragePort | null = inject(PREFERENCES_STORAGE, {
    optional: true,
  });
  private readonly audio: AudioPort | null = inject(AUDIO, { optional: true });
  private pendingEnemyTurn: ClockHandle | null = null;
  private pendingEnemyAnimationReset: ClockHandle | null = null;
  private runGeneration = 0;
  readonly screen = signal<GameScreen>('welcome');
  readonly playerName = signal('');
  readonly selectedCharacter = signal<CharacterDefinition | null>(null);
  readonly player = signal<PlayerState | null>(null);
  readonly combatState = signal<CombatState>(INITIAL_COMBAT_STATE);
  readonly routeFloor = signal(1);
  readonly routeMap = signal<RouteMapState | null>(null);
  readonly enemy = computed(() => this.combatState().enemy);
  readonly enemyAnimation = signal<'idle' | 'attack' | 'hit' | 'defeat'>('idle');
  readonly enemyActionKind = signal<DamageKind | null>(null);
  readonly playerAnimation = signal<'idle' | 'action' | 'hit' | 'defeat'>('idle');
  readonly playerActionKind = signal<DamageKind | null>(null);
  readonly actionReady = signal(false);
  readonly playerActionAsset = computed<SpriteStripAsset | null>(() => {
    const player = this.player();
    if (!player) return null;
    if (this.playerActionKind() === 'magic') {
      return player.character.magicAsset ?? player.character.actionAsset ?? null;
    }
    return player.character.actionAsset ?? null;
  });
  readonly playerIdleSpriteAsset = computed<SpriteStripAsset | null>(
    () => this.player()?.character.idleSpriteAsset ?? null,
  );
  readonly playerHitAsset = computed<SpriteStripAsset | null>(
    () => this.player()?.character.hitAsset ?? null,
  );
  readonly enemyAsset = computed(
    () => enemyAssetFor(this.enemy()?.definition.id ?? '', this.enemyAnimation()) ?? '',
  );
  readonly enemySpriteAsset = computed<SpriteStripAsset | null>(
    () =>
      enemySpriteAssetFor(
        this.enemy()?.definition.id ?? '',
        this.enemyAnimation(),
        this.enemyActionKind() ?? 'attack',
      ) ?? null,
  );
  readonly defeatedEnemySummary = computed<readonly DefeatedEnemySummary[]>(() => {
    const history = this.player()?.defeatedEnemies ?? [];
    const grouped = new Map<string, number[]>();

    for (const defeatedEnemy of history) {
      const levels = grouped.get(defeatedEnemy.enemyId) ?? [];
      levels.push(defeatedEnemy.level);
      grouped.set(defeatedEnemy.enemyId, levels);
    }

    return [...grouped.entries()].map(([enemyId, levels]) => {
      const definition = findEnemyDefinition(enemyId);
      return {
        enemyId,
        name: definition?.name ?? enemyId,
        idleAsset: enemyAssetFor(enemyId, 'idle') ?? '',
        count: levels.length,
        levelsLabel: levels.join(', '),
      };
    });
  });
  readonly combatStatus = computed<'ready' | 'defeated'>(() =>
    this.combatState().phase === 'victory' || this.combatState().phase === 'defeat'
      ? 'defeated'
      : 'ready',
  );
  readonly playerRemainingHealth = computed(() => {
    const player = this.player();
    return player ? Math.max(0, player.stats.health - this.combatState().playerDamageTaken) : 0;
  });
  readonly canAct = computed(
    () => this.combatState().phase === 'awaiting-player-action' && this.actionReady(),
  );
  readonly storeItems = STORE_ITEMS;
  readonly storePotions = STORE_POTIONS;
  readonly lastActionAt = signal<number | null>(null);
  readonly combatMessage = signal('');
  readonly personalRecords = signal<readonly PersonalRecord[]>([]);
  readonly musicVolume = signal(DEFAULT_MUSIC_VOLUME);
  readonly effectsVolume = signal(DEFAULT_EFFECTS_VOLUME);
  readonly playerCombatLog = signal<readonly CombatLogEntry[]>([]);
  readonly enemyCombatLog = signal<readonly CombatLogEntry[]>([]);

  constructor() {
    this.restorePreferences();
    this.restorePersonalRecords();
    this.restore();
    this.syncMusicToScreen();
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
    this.routeFloor.set(1);
    this.routeMap.set(null);
    this.actionReady.set(false);
    this.enemyAnimation.set('idle');
    this.enemyActionKind.set(null);
    this.playerAnimation.set('idle');
    this.playerActionKind.set(null);
    this.clearCombatLogs();
    this.combatMessage.set('The first enemy is approaching.');
    this.audio?.playMusic(ASSET_MANIFEST.music.dungeon);
    this.findEnemy('battle');
  }

  findEnemy(routeKind: Extract<RouteNodeKind, 'battle' | 'elite'> = 'battle'): void {
    const player = this.player();

    if (!player || player.powerUps.pending > 0) {
      return;
    }

    const generatedEnemy = generateEnemy(
      player.level,
      this.random(),
      this.random(),
      player.bossesDefeated,
    );
    const spawnedEnemy =
      routeKind === 'elite' ? strengthenEliteEnemy(generatedEnemy) : generatedEnemy;
    if (
      !this.applyCombatEvent({
        type: 'enemy-spawned',
        enemy: spawnedEnemy,
      })
    ) {
      return;
    }
    this.routeMap.set(null);
    this.enemyAnimation.set('idle');
    this.playerAnimation.set('idle');
    this.actionReady.set(false);
    this.addCombatLog('enemy', {
      title: spawnedEnemy.definition.name,
      message: 'has appeared!',
    });
    this.screen.set('combat');
    this.audio?.playMusic(
      spawnedEnemy.definition.archetype === 'boss'
        ? ASSET_MANIFEST.music.boss
        : ASSET_MANIFEST.music.dungeon,
    );

    if (determineFirstActor(player.stats.speed, spawnedEnemy.stats.speed) === 'enemy') {
      this.combatMessage.set(`${spawnedEnemy.definition.name} attacks first.`);
      this.addCombatLog('enemy', {
        title: spawnedEnemy.definition.name,
        message: 'attacks first!',
      });
      this.startEnemyTurn();
    } else {
      this.actionReady.set(true);
      this.combatMessage.set('The enemy has appeared. Choose an action.');
      this.addCombatLog('player', { title: 'You', message: 'attack first!' });
    }
  }

  openStore(): void {
    if (!this.player() || this.screen() !== 'map' || this.combatState().phase !== 'victory') return;
    this.screen.set('store');
    this.combatMessage.set('');
    this.audio?.playMusic(ASSET_MANIFEST.music.store);
  }

  closeStore(): void {
    if (this.screen() !== 'store') return;
    this.openRouteMap();
  }

  openRouteMap(): void {
    const player = this.player();
    if (!player || this.combatState().phase !== 'victory' || player.powerUps.pending > 0) return;
    if (!this.routeMap()) {
      this.routeMap.set(createRouteMap(this.routeFloor(), this.random()));
    }
    this.screen.set('map');
    this.actionReady.set(false);
    this.audio?.playMusic(ASSET_MANIFEST.music.dungeon);
  }

  chooseRouteNode(nodeId: string): void {
    const player = this.player();
    const map = this.routeMap();
    const node = map ? findRouteNode(map, nodeId) : undefined;
    if (!player || !map || !node || this.screen() !== 'map') return;

    this.routeMap.set(null);
    this.routeFloor.set(map.floor + 1);

    if (node.kind === 'store') {
      this.openStore();
      return;
    }

    if (node.kind === 'rest') {
      const damageTaken = this.combatState().playerDamageTaken;
      const healed = Math.trunc(damageTaken * 0.25);
      this.combatState.update((state) => ({
        ...state,
        playerDamageTaken: Math.max(0, state.playerDamageTaken - healed),
      }));
      this.combatMessage.set(
        healed > 0
          ? `The campfire restored ${healed} HP for the next encounter.`
          : 'The campfire found you at full health. The next route awaits.',
      );
      this.openRouteMap();
      return;
    }

    this.findEnemy(node.kind);
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
    this.actionReady.set(false);
    this.playerActionKind.set(kind);
    this.playerAnimation.set('action');
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
    this.addCombatLog('player', {
      title: player.name,
      message: result.missed ? `${kind} missed.` : '',
      ...(result.missed ? {} : { value: result.damageAfterResistance }),
      icon: kind === 'attack' ? '🔪' : '☄',
    });

    if (defeated) {
      this.enemyAnimation.set('defeat');
      const reward = calculateVictoryReward(player, enemy);
      this.player.set(applyVictoryReward(player, enemy));
      this.addCombatLog('enemy', {
        title: enemy.definition.name,
        message: `lv ${enemy.level} has been defeated! 🎉🎉`,
      });
      this.addCombatLog('player', {
        title: '',
        message: `Well done, you have gained ${reward.experience} exp!`,
      });
      if (reward.powerUpsGranted > 0) {
        this.addCombatLog('player', {
          title: '',
          message: 'You have leveled up! 🎉🎉',
        });
      }
      this.combatMessage.set(
        `The ${enemy.definition.name} was defeated. You gained ${reward.experience} exp and ${reward.gold} gold.`,
      );
      this.audio?.playSound(
        reward.levelsGained > 0 ? ASSET_MANIFEST.sounds.levelUp : ASSET_MANIFEST.sounds.enemyKilled,
      );
      return;
    }

    if (result.missed) {
      this.combatMessage.set(`Your ${kind} missed.`);
    } else {
      this.enemyAnimation.set('hit');
      this.enemyActionKind.set(null);
      const criticalMessage = result.critical ? ' Critical hit.' : '';
      this.combatMessage.set(
        `Your ${kind} dealt ${result.damageAfterResistance} damage.${criticalMessage}${
          defeated ? ` ${enemy.definition.name} was defeated.` : ''
        }`,
      );
    }

    if (this.combatState().phase === 'enemy-turn') {
      this.combatMessage.set(`${this.combatMessage()} The enemy is preparing its turn.`);
      this.scheduleEnemyTurn();
    }
  }

  usePotion(): void {
    const player = this.player();
    const enemy = this.enemy();
    if (!player || !enemy || !this.canAct() || player.potions <= 0) return;

    const healed = Math.trunc(this.combatState().playerDamageTaken * 0.2);
    if (!this.applyCombatEvent({ type: 'player-potion-used' })) return;

    this.actionReady.set(false);
    this.player.set({ ...player, potions: player.potions - 1 });
    this.combatState.update((state) => ({
      ...state,
      playerDamageTaken: Math.max(0, state.playerDamageTaken - healed),
    }));
    this.combatMessage.set(`You used a potion and healed ${healed} HP.`);
    this.addCombatLog('player', {
      title: player.name,
      message: `healed ${healed} HP.`,
      icon: '❤',
    });
    this.audio?.playSound(ASSET_MANIFEST.sounds.potion);
    this.scheduleEnemyTurn();
  }

  choosePowerUp(type: Parameters<typeof applyPowerUp>[1]): void {
    const player = this.player();
    if (!player) return;
    this.player.set(applyPowerUp(player, type));
  }

  clearPersonalRecords(): void {
    this.personalRecords.set([]);
    this.recordsStorage?.clear();
  }

  setMusicVolume(volume: number): void {
    const next = clampVolume(volume);
    this.musicVolume.set(next);
    this.audio?.setMusicVolume(next);
    this.persistPreferences();
  }

  setEffectsVolume(volume: number): void {
    const next = clampVolume(volume);
    this.effectsVolume.set(next);
    this.audio?.setEffectsVolume(next);
    this.persistPreferences();
  }

  reset(): void {
    this.cancelPendingEnemyTurn();
    this.cancelPendingEnemyAnimationReset();
    this.runGeneration += 1;
    this.screen.set('welcome');
    this.playerName.set('');
    this.selectedCharacter.set(null);
    this.player.set(null);
    this.routeFloor.set(1);
    this.routeMap.set(null);
    this.actionReady.set(false);
    this.applyCombatEvent({ type: 'reset' });
    this.enemyAnimation.set('idle');
    this.enemyActionKind.set(null);
    this.playerAnimation.set('idle');
    this.playerActionKind.set(null);
    this.clearCombatLogs();
    this.lastActionAt.set(null);
    this.combatMessage.set('');
    this.storage?.clear();
    this.audio?.stopMusic();
    this.audio?.playMusic(ASSET_MANIFEST.music.welcome);
  }

  private syncMusicToScreen(): void {
    const asset =
      this.screen() === 'welcome'
        ? ASSET_MANIFEST.music.welcome
        : this.screen() === 'character-select'
          ? ASSET_MANIFEST.music.characterSelect
          : this.screen() === 'store'
            ? ASSET_MANIFEST.music.store
            : this.screen() === 'combat' && this.enemy()?.definition.archetype === 'boss'
              ? ASSET_MANIFEST.music.boss
              : ASSET_MANIFEST.music.dungeon;
    this.audio?.playMusic(asset);
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
    this.pendingEnemyTurn = null;
    const player = this.player();
    const enemy = this.enemy();

    if (!player || !enemy || this.combatState().phase !== 'enemy-turn') {
      return;
    }

    this.cancelPendingEnemyAnimationReset();
    const action: CombatAction = chooseEnemyAction(enemy, this.random());
    const isDamageAction = action === 'magic' || action === 'attack';
    this.enemyActionKind.set(isDamageAction ? action : null);
    this.enemyAnimation.set(isDamageAction ? 'attack' : 'idle');
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
      this.addCombatLog('enemy', {
        title: enemy.definition.name,
        message: `healed ${result.healed} HP.`,
        icon: '❤',
      });
      this.audio?.playSound(ASSET_MANIFEST.sounds.potion);
    } else {
      this.addCombatLog('enemy', {
        title: enemy.definition.name,
        message: result.missed ? `${action} missed.` : '',
        ...(result.missed ? {} : { value: result.damageAfterResistance }),
        icon: action === 'attack' ? '🔪' : '☄',
      });
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
      this.playerAnimation.set('defeat');
      this.addCombatLog('player', {
        title: 'Oh no!',
        message: 'You have been defeated! 😭',
      });
      this.addPersonalRecord(player);
      this.screen.set('game-over');
      this.combatMessage.set('You have been defeated. Start a new run to try again.');
    } else {
      this.scheduleEnemyAnimationReset();
      const playerWasHit = isDamageAction && !('action' in result) && !result.missed;
      this.playerAnimation.set(playerWasHit ? 'hit' : 'idle');
    }
  }

  private startEnemyTurn(): void {
    this.actionReady.set(false);
    if (!this.applyCombatEvent({ type: 'enemy-turn-started' })) return;
    this.scheduleEnemyTurn();
  }

  private scheduleEnemyTurn(): void {
    this.cancelPendingEnemyTurn();
    const generation = this.runGeneration;
    this.pendingEnemyTurn = this.clock.schedule(() => {
      if (generation !== this.runGeneration) return;
      this.resolveEnemyTurn();
    }, 1_100);
  }

  private cancelPendingEnemyTurn(): void {
    this.pendingEnemyTurn?.cancel();
    this.pendingEnemyTurn = null;
  }

  private scheduleEnemyAnimationReset(): void {
    const generation = this.runGeneration;
    this.pendingEnemyAnimationReset = this.clock.schedule(() => {
      this.pendingEnemyAnimationReset = null;
      if (
        generation !== this.runGeneration ||
        this.combatState().phase !== 'awaiting-player-action'
      ) {
        return;
      }
      this.enemyAnimation.set('idle');
      this.enemyActionKind.set(null);
      this.playerAnimation.set('idle');
      this.actionReady.set(true);
    }, 900);
  }

  private cancelPendingEnemyAnimationReset(): void {
    this.pendingEnemyAnimationReset?.cancel();
    this.pendingEnemyAnimationReset = null;
  }

  private addCombatLog(side: 'player' | 'enemy', entry: CombatLogEntry): void {
    const log = side === 'player' ? this.playerCombatLog : this.enemyCombatLog;
    log.update((entries) =>
      entries.length >= MAX_COMBAT_LOG_ENTRIES ? [...entries.slice(1), entry] : [...entries, entry],
    );
  }

  private clearCombatLogs(): void {
    this.playerCombatLog.set([]);
    this.enemyCombatLog.set([]);
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
        screen: this.screen(),
        playerName: this.playerName(),
        selectedCharacterId: this.selectedCharacter()?.id ?? null,
        player: this.player(),
        combatState: this.combatState(),
        routeFloor: this.routeFloor(),
        routeMap: this.routeMap(),
      }),
    );
  }

  private addPersonalRecord(player: PlayerState): void {
    const records = sortPersonalRecords([
      ...this.personalRecords(),
      createPersonalRecord(player.character.id, player.name, player.level),
    ]);
    this.personalRecords.set(records);
    this.recordsStorage?.write(JSON.stringify({ version: 1, records }));
  }

  private restorePersonalRecords(): void {
    const raw = this.recordsStorage?.read();
    if (!raw) return;

    try {
      const snapshot: unknown = JSON.parse(raw);
      if (!isStoredRecordsSnapshot(snapshot)) {
        this.recordsStorage?.clear();
        return;
      }

      this.personalRecords.set(sortPersonalRecords(snapshot.records));
    } catch {
      this.recordsStorage?.clear();
    }
  }

  private persistPreferences(): void {
    const preferences: AudioPreferences = {
      musicVolume: this.musicVolume(),
      effectsVolume: this.effectsVolume(),
    };
    this.preferencesStorage?.write(JSON.stringify({ version: 1, ...preferences }));
  }

  private restorePreferences(): void {
    const applyPreferences = (preferences: AudioPreferences): void => {
      this.musicVolume.set(preferences.musicVolume);
      this.effectsVolume.set(preferences.effectsVolume);
      this.audio?.setMusicVolume(preferences.musicVolume);
      this.audio?.setEffectsVolume(preferences.effectsVolume);
    };
    const raw = this.preferencesStorage?.read();
    if (!raw) {
      applyPreferences({
        musicVolume: DEFAULT_MUSIC_VOLUME,
        effectsVolume: DEFAULT_EFFECTS_VOLUME,
      });
      return;
    }

    try {
      const snapshot: unknown = JSON.parse(raw);
      if (!isStoredPreferencesSnapshot(snapshot)) {
        this.preferencesStorage?.clear();
        applyPreferences({
          musicVolume: DEFAULT_MUSIC_VOLUME,
          effectsVolume: DEFAULT_EFFECTS_VOLUME,
        });
        return;
      }

      applyPreferences(snapshot);
    } catch {
      this.preferencesStorage?.clear();
      applyPreferences({
        musicVolume: DEFAULT_MUSIC_VOLUME,
        effectsVolume: DEFAULT_EFFECTS_VOLUME,
      });
    }
  }

  private restore(): void {
    const raw = this.storage?.read();
    if (!raw) return;

    try {
      const snapshot = JSON.parse(raw) as Partial<StoredSessionSnapshot>;
      const selectedCharacter = CHARACTER_DEFINITIONS.find(
        (item) => item.id === snapshot.selectedCharacterId,
      );
      const playerCharacterId = isRecord(snapshot.player?.character)
        ? snapshot.player.character['id']
        : undefined;
      const playerHealth = isRestorablePlayer(snapshot.player)
        ? snapshot.player.stats.health
        : null;
      const routeFloor = snapshot.routeFloor ?? 1;
      if (
        snapshot.version !== 1 ||
        typeof snapshot.playerName !== 'string' ||
        snapshot.selectedCharacterId === undefined ||
        !['welcome', 'character-select', 'map', 'combat', 'store', 'game-over'].includes(
          String(snapshot.screen),
        ) ||
        !isRestorableRouteFloor(routeFloor) ||
        (snapshot.routeMap !== undefined &&
          snapshot.routeMap !== null &&
          !isRouteMapState(snapshot.routeMap)) ||
        !isRestorableCombatState(snapshot.combatState) ||
        (snapshot.player !== null && !isRestorablePlayer(snapshot.player)) ||
        (snapshot.selectedCharacterId !== null && !selectedCharacter) ||
        (playerCharacterId !== undefined && selectedCharacter?.id !== playerCharacterId) ||
        (playerHealth !== null && snapshot.combatState.playerDamageTaken > playerHealth) ||
        !hasCoherentSessionState(snapshot)
      ) {
        this.storage?.clear();
        return;
      }

      const character = selectedCharacter;
      if (character) this.selectedCharacter.set(character);
      this.playerName.set(snapshot.playerName.slice(0, 14));
      this.routeFloor.set(routeFloor);
      this.routeMap.set(snapshot.routeMap ?? null);
      if (snapshot.player) {
        const inventory = snapshot.player.inventory.map(
          (item) => STORE_ITEMS.find((candidate) => candidate.id === item.id) ?? item,
        );
        this.player.set({
          ...snapshot.player,
          character: character ?? snapshot.player.character,
          inventory,
          defeatedEnemies: snapshot.player.defeatedEnemies ?? [],
        });
        const restoredEnemy = snapshot.combatState.enemy;
        this.combatState.set({
          ...snapshot.combatState,
          enemy: restoredEnemy
            ? {
                ...restoredEnemy,
                definition:
                  findEnemyDefinition(restoredEnemy.definition.id) ?? restoredEnemy.definition,
              }
            : null,
        });
        this.enemyAnimation.set('idle');
        this.enemyActionKind.set(null);
        this.playerAnimation.set(
          snapshot.screen === 'game-over' && snapshot.combatState.phase === 'defeat'
            ? 'defeat'
            : 'idle',
        );
        this.screen.set(snapshot.screen as GameScreen);
        this.actionReady.set(
          snapshot.screen === 'combat' && snapshot.combatState.phase === 'awaiting-player-action',
        );
        this.combatMessage.set('Your saved run was restored.');
      } else {
        this.screen.set(snapshot.screen === 'character-select' ? 'character-select' : 'welcome');
      }
    } catch {
      this.storage?.clear();
    }
  }
}
