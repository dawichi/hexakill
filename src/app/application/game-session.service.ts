import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { AUDIO, AudioPort } from './audio';
import { BROWSER_CLOCK, CLOCK, Clock, ClockHandle } from './clock';
import {
  chooseEnemyIntent,
  determineFirstActor,
  guardBlockAmount,
  resolveHeal,
  resolveAction,
} from '../domain/combat-actions';
import {
  applyPowerUp,
  applyVictoryReward,
  calculateVictoryReward,
  MAX_POWER_UPS,
  MAX_POWER_UPS_PER_STAT,
} from '../domain/progression';
import {
  purchaseItem,
  purchasePotions,
  generateStoreOffers,
  relicGuardBlockMultiplier,
  relicGuardBreakMultiplier,
  relicPotionHealingFraction,
  relicVictoryHealAmount,
  STORE_ITEMS,
  STORE_POTIONS,
} from '../domain/store';
import {
  relicBloodLedgerHeal,
  relicCrownOfThornsDamage,
  relicCrownOfThornsVenom,
  relicDamageRules,
  relicGuardBonus,
  relicIncomingDamageMultiplier,
  relicLethalProtectionAvailable,
  relicMagicBlock,
  relicMagicVenom,
  relicPotionBlock,
  relicPotionIsFree,
  relicStartEnemyDamage,
  relicStartOfCombatBlock,
  relicThornsDamage,
  relicVictoryMaxHealthBonus,
  RelicCombatContext,
} from '../domain/relic-rules';
import {
  enemyAssetFor,
  enemySpriteAssetFor,
  ENEMY_DEFINITIONS,
  findEnemyDefinition,
  generateEnemy,
} from '../domain/enemies';
import { damageDealt, DamageKind, DamageResult, resolveDamage } from '../domain/combat-rules';
import { hasRelic } from '../domain/relics';
import {
  EnemyIntent,
  INITIAL_COMBAT_STATE,
  CombatState,
  transitionCombat,
} from '../domain/combat-state';
import { CHARACTER_DEFINITIONS, createInitialPlayer } from '../domain/characters';
import { ASSET_MANIFEST } from '../domain/assets';
import {
  createRouteMap,
  findRouteNode,
  isRouteMapState,
  revealHiddenRouteNodes,
  RouteMapState,
  RouteNodeKind,
} from '../domain/route-map';
import {
  CharacterDefinition,
  CombatLogEntry,
  DefeatedEnemy,
  EnemyState,
  ItemState,
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

export type CombatFeedbackKind =
  'damage' | 'critical' | 'miss' | 'blocked' | 'heal' | 'guard' | 'hex';

export interface CombatFeedback {
  readonly id: number;
  readonly target: 'player' | 'enemy';
  readonly kind: CombatFeedbackKind;
  readonly amount?: number;
  readonly action?: DamageKind;
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
  const relicCharges = value['relicCharges'];
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
    (relicCharges !== undefined &&
      (!isRecord(relicCharges) ||
        Object.entries(relicCharges).some(
          ([id, charge]) =>
            !STORE_ITEMS.some((candidate) => candidate.id === id) || !isNonNegativeInteger(charge),
        ))) ||
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
  const combatCounters = [
    'playerActions',
    'damagingActions',
    'attackCount',
    'magicActions',
    'potionUses',
    'enemyDamageActions',
    'enemyVenom',
    'turn',
  ] as const;
  const relicFlags = value['relicFlags'];
  return (
    typeof value['phase'] === 'string' &&
    phases.includes(value['phase']) &&
    (enemy === null || isRestorableEnemy(enemy)) &&
    isNonNegativeInteger(value['playerDamageTaken']) &&
    (enemy !== null || value['playerDamageTaken'] === 0) &&
    value['pendingAction'] === null &&
    combatCounters.every(
      (counter) => value[counter] === undefined || isNonNegativeInteger(value[counter]),
    ) &&
    (value['openingActor'] === undefined ||
      value['openingActor'] === null ||
      value['openingActor'] === 'player' ||
      value['openingActor'] === 'enemy') &&
    (relicFlags === undefined ||
      (isRecord(relicFlags) &&
        Object.values(relicFlags).every((flag) => typeof flag === 'boolean'))) &&
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
  return { ...enemy, stats, gold: Math.round(enemy.gold * 1.5), elite: true };
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
  private pendingPlayerImpact: ClockHandle | null = null;
  private pendingCombatFeedbackReset: ClockHandle | null = null;
  private runGeneration = 0;
  private feedbackSequence = 0;
  readonly screen = signal<GameScreen>('welcome');
  readonly playerName = signal('');
  readonly selectedCharacter = signal<CharacterDefinition | null>(null);
  readonly player = signal<PlayerState | null>(null);
  readonly combatState = signal<CombatState>(INITIAL_COMBAT_STATE);
  readonly routeFloor = signal(1);
  readonly routeMap = signal<RouteMapState | null>(null);
  readonly enemy = computed(() => this.combatState().enemy);
  readonly enemyIntent = computed(() => this.combatState().enemyIntent ?? null);
  readonly playerBlock = computed(() => this.combatState().playerBlock ?? 0);
  readonly enemyBlock = computed(() => this.combatState().enemyBlock ?? 0);
  readonly enemyHexed = computed(() => this.combatState().enemyHexed ?? false);
  readonly playerHealthTrail = signal(0);
  readonly enemyHealthTrail = signal(0);
  readonly enemyAnimation = signal<'idle' | 'attack' | 'hit' | 'defeat'>('idle');
  readonly enemyActionKind = signal<DamageKind | null>(null);
  readonly playerAnimation = signal<'idle' | 'action' | 'hit' | 'defeat'>('idle');
  readonly playerActionKind = signal<DamageKind | null>(null);
  readonly combatFeedback = signal<CombatFeedback | null>(null);
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
  readonly storeItems = signal<readonly ItemState[]>([]);
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
    this.playerHealthTrail.set(100);
    this.enemyHealthTrail.set(0);
    this.routeFloor.set(1);
    this.routeMap.set(null);
    this.storeItems.set([]);
    this.actionReady.set(false);
    this.enemyAnimation.set('idle');
    this.enemyActionKind.set(null);
    this.playerAnimation.set('idle');
    this.playerActionKind.set(null);
    this.clearCombatLogs();
    this.combatMessage.set('Choose a door. The dungeon will reveal what waits beyond it.');
    this.audio?.playMusic(ASSET_MANIFEST.music.dungeon);
    this.showRouteMap();
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
    const openingActor = determineFirstActor(player.stats.speed, spawnedEnemy.stats.speed);
    if (
      !this.applyCombatEvent({
        type: 'enemy-spawned',
        enemy: spawnedEnemy,
      })
    ) {
      return;
    }
    this.routeMap.set(null);
    this.syncHealthTrail('player', this.playerRemainingHealth(), player.stats.health);
    this.syncHealthTrail('enemy', spawnedEnemy.stats.health, spawnedEnemy.stats.health);
    this.enemyAnimation.set('idle');
    this.playerAnimation.set('idle');
    this.enemyActionKind.set(null);
    this.playerActionKind.set(null);
    this.actionReady.set(false);
    const intent = chooseEnemyIntent(spawnedEnemy, player.stats, this.random(), 0);
    this.combatState.update((state) => ({
      ...state,
      enemyIntent: intent,
      turn: 0,
      openingActor,
      playerBlock: relicStartOfCombatBlock(player),
    }));
    this.addCombatLog('enemy', {
      title: spawnedEnemy.definition.name,
      message: 'has appeared and revealed its intent.',
    });
    this.screen.set('combat');
    this.audio?.playMusic(
      spawnedEnemy.definition.archetype === 'boss'
        ? ASSET_MANIFEST.music.boss
        : ASSET_MANIFEST.music.dungeon,
    );

    if (openingActor === 'enemy') {
      this.combatMessage.set(this.enemyIntentMessage(spawnedEnemy, intent));
      this.addCombatLog('enemy', {
        title: spawnedEnemy.definition.name,
        message: 'acts first!',
      });
      this.startEnemyTurn();
    } else {
      this.actionReady.set(true);
      this.combatMessage.set(
        `${this.enemyIntentMessage(spawnedEnemy, intent)} Choose your response.`,
      );
      this.addCombatLog('player', { title: 'You', message: 'attack first!' });
    }
  }

  openStore(): void {
    if (!this.player() || this.screen() !== 'map') return;
    const player = this.player();
    if (!player) return;
    this.storeItems.set(
      generateStoreOffers(player, { floor: this.routeFloor(), random: this.random }),
    );
    this.screen.set('store');
    this.combatMessage.set('');
    this.audio?.playMusic(ASSET_MANIFEST.music.store);
  }

  closeStore(): void {
    if (this.screen() !== 'store') return;
    this.showRouteMap();
  }

  openRouteMap(): void {
    const player = this.player();
    if (!player || this.combatState().phase !== 'victory' || player.powerUps.pending > 0) return;
    this.showRouteMap();
  }

  private showRouteMap(): void {
    const player = this.player();
    if (!player) return;
    if (!this.routeMap()) {
      const map = createRouteMap(this.routeFloor(), this.random());
      const hasCompass = this.player()?.inventory.some((item) => item.id === 'travelers-compass');
      this.routeMap.set(hasCompass ? revealHiddenRouteNodes(map, 1) : map);
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
      const restResult = resolveHeal(damageTaken, player.stats.health, 0.3);
      this.combatState.update((state) => ({
        ...state,
        playerDamageTaken: Math.max(0, state.playerDamageTaken - restResult.healed),
      }));
      this.combatMessage.set(
        restResult.healed > 0
          ? `The campfire restored ${restResult.healed} HP for the next encounter.`
          : 'The campfire found you at full health. The next route awaits.',
      );
      this.showRouteMap();
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
    this.beginPlayerAction(kind);
  }

  guard(): void {
    this.beginPlayerAction('guard');
  }

  private beginPlayerAction(kind: DamageKind | 'guard'): void {
    if (!this.player() || !this.enemy() || !this.canAct()) return;
    if (!this.applyCombatEvent({ type: 'player-action-started', kind })) return;

    this.actionReady.set(false);
    this.playerActionKind.set(kind === 'guard' ? null : kind);
    this.playerAnimation.set(kind === 'guard' ? 'idle' : 'action');
    this.lastActionAt.set(this.clock.now());
    this.combatMessage.set(
      kind === 'guard'
        ? 'You raise your guard and prepare for the incoming action.'
        : `You use ${kind === 'attack' ? 'Attack' : 'Magic'}.`,
    );
    this.audio?.playSound(
      kind === 'guard'
        ? ASSET_MANIFEST.sounds.guard
        : kind === 'attack'
          ? ASSET_MANIFEST.sounds.attack
          : ASSET_MANIFEST.sounds.magic,
    );
    this.pendingPlayerImpact = this.clock.schedule(() => {
      this.pendingPlayerImpact = null;
      if (kind === 'guard') this.resolvePlayerGuard();
      else this.resolvePlayerDamage(kind);
    }, 320);
  }

  private resolvePlayerGuard(): void {
    const player = this.player();
    const enemy = this.enemy();
    if (!player || !enemy || this.combatState().pendingAction !== 'guard') return;

    const block =
      guardBlockAmount(player.stats, relicGuardBlockMultiplier(player)) + relicGuardBonus(player);
    if (!this.applyCombatEvent({ type: 'player-guard-resolved', block })) return;
    this.combatState.update((state) => ({
      ...state,
      playerActions: (state.playerActions ?? 0) + 1,
    }));

    this.showCombatFeedback({ target: 'player', kind: 'guard', amount: block });
    this.combatMessage.set(`Guard raised ${block} Block. ${this.enemyIntentMessage(enemy)}`);
    this.addCombatLog('player', {
      title: player.name,
      message: `raised ${block} Block.`,
      value: block,
      icon: '🛡',
    });
    this.scheduleEnemyTurn();
  }

  private relicContext(player: PlayerState): RelicCombatContext {
    const state = this.combatState();
    return {
      playerHealth: player.stats.health,
      playerDamageTaken: state.playerDamageTaken,
      playerActions: state.playerActions ?? 0,
      damagingActions: state.damagingActions ?? 0,
      attackCount: state.attackCount ?? 0,
      magicActions: state.magicActions ?? 0,
      potionUses: state.potionUses ?? 0,
      enemyDamageActions: state.enemyDamageActions ?? 0,
      openingActor: state.openingActor ?? null,
      relicFlags: state.relicFlags ?? {},
    };
  }

  private resolvePlayerDamage(kind: DamageKind): void {
    const player = this.player();
    const enemy = this.enemy();
    if (!player || !enemy || this.combatState().pendingAction !== kind) return;

    const stateBeforeAction = this.combatState();
    const enemyHexed = stateBeforeAction.enemyHexed ?? false;
    const previousEnemyHealth = enemy.stats.health - enemy.damageTaken;
    const damageRules = relicDamageRules(player, kind, this.relicContext(player));
    const damageMultiplier =
      damageRules.damageMultiplier * (kind === 'attack' && enemyHexed ? 1.45 : 1);
    const result = resolveDamage(
      { stats: player.stats },
      enemy,
      kind,
      {
        damageRoll: this.random(),
        chanceRoll: damageRules.guaranteedHit ? Math.max(0.11, this.random()) : this.random(),
      },
      {
        damageMultiplier,
        block:
          (this.combatState().enemyBlock ?? 0) /
          (kind === 'attack' ? relicGuardBreakMultiplier(player) : 1),
      },
    );
    if (!this.applyCombatEvent({ type: 'player-action-resolved', result })) return;

    const dealt = damageDealt(result);
    this.combatState.update((state) => ({
      ...state,
      playerActions: (state.playerActions ?? 0) + 1,
      damagingActions: (state.damagingActions ?? 0) + 1,
      attackCount: (state.attackCount ?? 0) + (kind === 'attack' ? 1 : 0),
      magicActions: (state.magicActions ?? 0) + (kind === 'magic' ? 1 : 0),
      relicFlags:
        kind === 'magic' && dealt > 0
          ? { ...state.relicFlags, 'arcane-battery-used': true }
          : state.relicFlags,
      playerBlock:
        (state.playerBlock ?? 0) +
        (kind === 'magic' && dealt > 0 ? relicMagicBlock(player, this.relicContext(player)) : 0),
      enemyVenom:
        (state.enemyVenom ?? 0) + (kind === 'magic' && dealt > 0 ? relicMagicVenom(player) : 0),
    }));

    if (dealt > 0) {
      this.showHealthDamageTrail(
        'enemy',
        previousEnemyHealth,
        enemy.stats.health - result.damageTaken,
        enemy.stats.health,
      );
    }
    const defeated = result.damageTaken >= enemy.stats.health;
    this.addCombatLog('player', {
      title: player.name,
      message: result.missed ? `${kind} missed.` : '',
      ...(result.missed ? {} : { value: dealt }),
      icon: kind === 'attack' ? '🔪' : '☄',
    });

    if (result.missed) {
      this.showCombatFeedback({ target: 'enemy', kind: 'miss', action: kind });
      this.combatMessage.set(`Your ${kind} missed. ${this.enemyIntentMessage(enemy)}`);
    } else if (dealt === 0 && (result.blocked ?? 0) > 0) {
      this.showCombatFeedback({
        target: 'enemy',
        kind: 'blocked',
        amount: result.blocked,
        action: kind,
      });
      this.combatMessage.set(`${enemy.definition.name} blocked the ${kind}.`);
    } else {
      this.enemyAnimation.set(defeated ? 'defeat' : 'hit');
      this.enemyActionKind.set(null);
      this.showCombatFeedback({
        target: 'enemy',
        kind: result.critical ? 'critical' : 'damage',
        amount: dealt,
        action: kind,
      });
      const criticalMessage = result.critical ? ' Critical hit!' : '';
      const hexMessage =
        kind === 'magic' && !result.missed
          ? ' Arcane mark applied: your next Attack hits harder.'
          : '';
      this.combatMessage.set(`Your ${kind} dealt ${dealt} damage.${criticalMessage}${hexMessage}`);
    }

    if (defeated) {
      this.finishVictory(player, enemy);
      return;
    }

    this.combatMessage.set(`${this.combatMessage()} ${this.enemyIntentMessage(enemy)}`);
    this.scheduleEnemyTurn();
  }

  usePotion(): void {
    const player = this.player();
    const enemy = this.enemy();
    if (!player || !enemy || !this.canAct() || player.potions <= 0) return;

    const relicContext = this.relicContext(player);
    const freeTurn = relicPotionIsFree(player, relicContext);
    const potionBlock = relicPotionBlock(player, relicContext);

    const healResult = resolveHeal(
      this.combatState().playerDamageTaken,
      player.stats.health,
      relicPotionHealingFraction(player),
    );
    if (!this.applyCombatEvent({ type: 'player-potion-used', freeTurn })) return;

    this.actionReady.set(freeTurn);
    this.player.set({ ...player, potions: player.potions - 1 });
    this.combatState.update((state) => ({
      ...state,
      playerDamageTaken: Math.max(0, state.playerDamageTaken - healResult.healed),
      playerActions: (state.playerActions ?? 0) + 1,
      potionUses: (state.potionUses ?? 0) + 1,
      playerBlock: (state.playerBlock ?? 0) + potionBlock,
    }));
    this.syncHealthTrail('player', this.playerRemainingHealth(), player.stats.health);
    this.combatMessage.set(`You used a potion and healed ${healResult.healed} HP.`);
    this.addCombatLog('player', {
      title: player.name,
      message: `healed ${healResult.healed} HP.`,
      icon: '❤',
    });
    this.showCombatFeedback({ target: 'player', kind: 'heal', amount: healResult.healed });
    this.audio?.playSound(ASSET_MANIFEST.sounds.potion);
    if (!freeTurn) this.scheduleEnemyTurn();
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
    this.cancelPendingPlayerImpact();
    this.cancelPendingCombatFeedbackReset();
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
    this.combatFeedback.set(null);
    this.playerHealthTrail.set(0);
    this.enemyHealthTrail.set(0);
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

  private finishVictory(player: PlayerState, enemy: EnemyState): void {
    const reward = calculateVictoryReward(player, enemy);
    const rewardedPlayerBase = applyVictoryReward(player, enemy);
    const maxHealthBonus = relicVictoryMaxHealthBonus(rewardedPlayerBase);
    const rewardedPlayer =
      maxHealthBonus > 0
        ? {
            ...rewardedPlayerBase,
            stats: {
              ...rewardedPlayerBase.stats,
              health: rewardedPlayerBase.stats.health + maxHealthBonus,
            },
          }
        : rewardedPlayerBase;
    this.player.set(rewardedPlayer);
    const victoryHeal = relicVictoryHealAmount(rewardedPlayer);
    if (victoryHeal > 0) {
      this.combatState.update((state) => ({
        ...state,
        playerDamageTaken: Math.max(0, state.playerDamageTaken - victoryHeal),
      }));
    }
    this.addCombatLog('enemy', {
      title: enemy.definition.name,
      message: `lv ${enemy.level} has been defeated!`,
    });
    this.addCombatLog('player', {
      title: '',
      message: `Well done, you have gained ${reward.experience} exp!`,
    });
    if (reward.powerUpsGranted > 0) {
      this.addCombatLog('player', {
        title: '',
        message: 'You have leveled up!',
      });
    }
    this.combatMessage.set(
      `The ${enemy.definition.name} was defeated. You gained ${reward.experience} exp and ${reward.gold} gold.`,
    );
    this.audio?.playSound(
      reward.levelsGained > 0 ? ASSET_MANIFEST.sounds.levelUp : ASSET_MANIFEST.sounds.enemyKilled,
    );
  }

  private beginEnemyAction(): void {
    this.pendingEnemyTurn = null;
    const enemy = this.enemy();
    const player = this.player();
    let intent = this.combatState().enemyIntent;
    if (!player || !enemy || this.combatState().phase !== 'enemy-turn') return;
    if (!intent) {
      intent = chooseEnemyIntent(
        enemy,
        this.player()?.stats ?? enemy.stats,
        this.random(),
        this.combatState().turn ?? 0,
      );
      this.combatState.update((state) => ({ ...state, enemyIntent: intent }));
    }

    const currentVenom = this.combatState().enemyVenom ?? 0;
    const startDamage = relicStartEnemyDamage(player) + currentVenom;
    if (startDamage > 0) {
      const damageTaken = Math.min(enemy.stats.health, enemy.damageTaken + startDamage);
      const enemyAfterStart = { ...enemy, damageTaken };
      this.combatState.update((state) => ({
        ...state,
        enemy: enemyAfterStart,
        enemyVenom: Math.max(0, currentVenom - (currentVenom > 0 ? 1 : 0)),
      }));
      this.showHealthDamageTrail(
        'enemy',
        enemy.stats.health - enemy.damageTaken,
        enemy.stats.health - damageTaken,
        enemy.stats.health,
      );
      this.showCombatFeedback({ target: 'enemy', kind: 'damage', amount: startDamage });
      this.combatMessage.set(
        currentVenom > 0
          ? `${enemy.definition.name} suffered ${startDamage} damage from Venom.`
          : `${enemy.definition.name} suffered ${startDamage} damage from Soot Charm.`,
      );
      if (damageTaken >= enemy.stats.health) {
        this.enemyAnimation.set('defeat');
        this.combatState.update((state) => ({ ...state, phase: 'victory' }));
        this.finishVictory(player, enemyAfterStart);
        return;
      }
    }

    this.cancelPendingEnemyAnimationReset();
    const damageAction = intent.kind === 'attack' || intent.kind === 'magic';
    this.enemyActionKind.set(damageAction ? (intent.kind as DamageKind) : null);
    this.enemyAnimation.set(damageAction ? 'attack' : 'idle');
    this.combatMessage.set(`${enemy.definition.name} ${this.intentVerb(intent)}.`);
    if (damageAction) {
      this.audio?.playSound(
        intent.kind === 'attack' ? ASSET_MANIFEST.sounds.attack : ASSET_MANIFEST.sounds.magic,
      );
    } else if (intent.kind === 'guard') {
      this.audio?.playSound(ASSET_MANIFEST.sounds.guard);
    } else {
      this.audio?.playSound(ASSET_MANIFEST.sounds.potion);
    }

    const generation = this.runGeneration;
    this.pendingEnemyTurn = this.clock.schedule(() => {
      if (generation !== this.runGeneration) return;
      this.resolveEnemyTurn();
    }, 360);
  }

  private resolveEnemyTurn(): void {
    this.pendingEnemyTurn = null;
    const player = this.player();
    const enemy = this.enemy();
    const intent = this.combatState().enemyIntent;

    if (!player || !enemy || !intent || this.combatState().phase !== 'enemy-turn') return;

    const currentPlayerBlock = this.combatState().playerBlock ?? 0;
    let playerDamageTaken = this.combatState().playerDamageTaken;
    const previousPlayerHealth = player.stats.health - playerDamageTaken;
    let remainingPlayerBlock = currentPlayerBlock;
    let updatedEnemy = enemy;
    let reactiveEnemyDamage = 0;
    let addedVenom = 0;
    let bloodHeal = 0;
    let playerForTurn = player;
    let result: DamageResult | null = null;

    if (intent.kind === 'guard') {
      const block = guardBlockAmount(enemy.stats);
      updatedEnemy = enemy;
      this.combatState.update((state) => ({ ...state, enemyBlock: block }));
      this.showCombatFeedback({ target: 'enemy', kind: 'guard', amount: block });
      this.combatMessage.set(`${enemy.definition.name} raised ${block} Block.`);
      this.addCombatLog('enemy', {
        title: enemy.definition.name,
        message: `raised ${block} Block.`,
        value: block,
        icon: '🛡',
      });
    } else if (intent.kind === 'heal') {
      const healResult = resolveHeal(enemy.damageTaken, enemy.stats.health);
      updatedEnemy = {
        ...enemy,
        damageTaken: healResult.damageTaken,
        potions: Math.max(0, enemy.potions - 1),
      };
      this.combatState.update((state) => ({ ...state, enemy: updatedEnemy }));
      this.showCombatFeedback({ target: 'enemy', kind: 'heal', amount: healResult.healed });
      this.combatMessage.set(`${enemy.definition.name} recovered ${healResult.healed} HP.`);
      this.addCombatLog('enemy', {
        title: enemy.definition.name,
        message: `recovered ${healResult.healed} HP.`,
        icon: '❤',
      });
      this.audio?.playSound(ASSET_MANIFEST.sounds.potion);
    } else {
      const incomingDamageMultiplier = relicIncomingDamageMultiplier(
        player,
        this.relicContext(player),
      );
      result = resolveDamage(
        { stats: enemy.stats },
        { stats: player.stats, damageTaken: this.combatState().playerDamageTaken },
        intent.kind,
        { damageRoll: this.random(), chanceRoll: this.random() },
        { receivedDamageMultiplier: incomingDamageMultiplier, block: currentPlayerBlock },
      );
      playerDamageTaken = result.damageTaken;
      remainingPlayerBlock = Math.max(0, currentPlayerBlock - (result.blocked ?? 0));
      const dealt = damageDealt(result);

      if (result.damageTaken >= player.stats.health && relicLethalProtectionAvailable(player)) {
        playerDamageTaken = Math.max(0, player.stats.health - 1);
        remainingPlayerBlock += 30;
        playerForTurn = {
          ...player,
          relicCharges: { ...player.relicCharges, 'phoenix-feather': 0 },
        };
        this.player.set(playerForTurn);
        this.combatMessage.set('Phoenix Feather saved you from a lethal hit and shattered.');
      }

      const contextAfterHit: RelicCombatContext = {
        ...this.relicContext(player),
        playerDamageTaken,
      };
      const bloodLedgerUsed = this.combatState().relicFlags?.['blood-ledger-used'] ?? false;
      bloodHeal = bloodLedgerUsed ? 0 : relicBloodLedgerHeal(player, contextAfterHit);
      if (bloodHeal > 0) playerDamageTaken = Math.max(0, playerDamageTaken - bloodHeal);

      const blocked = result.blocked ?? 0;
      reactiveEnemyDamage += relicThornsDamage(player, blocked);
      reactiveEnemyDamage += relicCrownOfThornsDamage(player, blocked);
      addedVenom += relicCrownOfThornsVenom(player, blocked);
      if (intent.kind === 'magic' && dealt > 0 && hasRelic(player, 'mirror-of-night')) {
        reactiveEnemyDamage += Math.trunc(dealt * 0.25);
      }
      if (reactiveEnemyDamage > 0) {
        updatedEnemy = {
          ...enemy,
          damageTaken: Math.min(enemy.stats.health, enemy.damageTaken + reactiveEnemyDamage),
        };
      }
      if (dealt > 0) {
        this.showHealthDamageTrail(
          'player',
          previousPlayerHealth,
          player.stats.health - playerDamageTaken,
          player.stats.health,
        );
      }
      this.addCombatLog('enemy', {
        title: enemy.definition.name,
        message: result.missed ? `${intent.kind} missed.` : '',
        ...(result.missed ? {} : { value: dealt }),
        icon: intent.kind === 'attack' ? '🔪' : '☄',
      });
      if (bloodHeal > 0) {
        this.showCombatFeedback({ target: 'player', kind: 'heal', amount: bloodHeal });
        this.combatMessage.set(`${this.combatMessage()} Blood Ledger restored ${bloodHeal} HP.`);
      }
      if (result.missed) {
        this.showCombatFeedback({ target: 'player', kind: 'miss', action: intent.kind });
        this.combatMessage.set(`${enemy.definition.name}'s ${intent.kind} missed.`);
      } else if (dealt === 0 && (result.blocked ?? 0) > 0) {
        this.showCombatFeedback({
          target: 'player',
          kind: 'blocked',
          amount: result.blocked,
          action: intent.kind,
        });
        this.combatMessage.set(`${enemy.definition.name}'s attack was blocked.`);
      } else {
        this.showCombatFeedback({
          target: 'player',
          kind: result.critical ? 'critical' : 'damage',
          amount: dealt,
          action: intent.kind,
        });
        this.combatMessage.set(
          `${enemy.definition.name}'s ${intent.kind} dealt ${dealt} damage.${
            result.critical ? ' Critical hit!' : ''
          }`,
        );
      }
      this.audio?.playSound(
        result.missed || dealt === 0 ? ASSET_MANIFEST.sounds.miss : ASSET_MANIFEST.sounds.impact,
      );
    }

    if (result && !result.missed && damageDealt(result) > 0) {
      this.playerAnimation.set('hit');
    } else {
      this.playerAnimation.set('idle');
    }

    const nextTurn = (this.combatState().turn ?? 0) + 1;
    const nextEnemy = updatedEnemy;
    const enemyDefeatedByReaction = nextEnemy.damageTaken >= nextEnemy.stats.health;
    const nextIntent = enemyDefeatedByReaction
      ? null
      : chooseEnemyIntent(nextEnemy, playerForTurn.stats, this.random(), nextTurn);
    if (
      !this.applyCombatEvent({
        type: 'enemy-action-resolved',
        playerDamageTaken,
        playerHealth: playerForTurn.stats.health,
        playerBlock: remainingPlayerBlock,
        enemyIntent: nextIntent,
        turn: nextTurn,
        allowPlayerHealing: bloodHeal > 0,
      })
    ) {
      return;
    }

    this.combatState.update((state) => ({
      ...state,
      enemyDamageActions:
        (state.enemyDamageActions ?? 0) +
        (intent.kind === 'attack' || intent.kind === 'magic' ? 1 : 0),
      enemyVenom: (state.enemyVenom ?? 0) + addedVenom,
      relicFlags:
        bloodHeal > 0 ? { ...state.relicFlags, 'blood-ledger-used': true } : state.relicFlags,
      enemy: nextEnemy,
    }));
    if (updatedEnemy !== enemy) {
      this.syncHealthTrail(
        'enemy',
        updatedEnemy.stats.health - updatedEnemy.damageTaken,
        updatedEnemy.stats.health,
      );
    }

    if (enemyDefeatedByReaction) {
      this.enemyAnimation.set('defeat');
      this.combatState.update((state) => ({ ...state, phase: 'victory' }));
      this.finishVictory(playerForTurn, nextEnemy);
      return;
    }

    if (this.combatState().phase === 'defeat') {
      this.playerAnimation.set('defeat');
      this.addCombatLog('player', {
        title: 'Oh no!',
        message: 'You have been defeated!',
      });
      this.addPersonalRecord(playerForTurn);
      this.screen.set('game-over');
      this.combatMessage.set('You have been defeated. Start a new run to try again.');
    } else {
      this.combatMessage.set(
        `${this.combatMessage()} ${this.enemyIntentMessage(nextEnemy, nextIntent)}`,
      );
      this.scheduleEnemyAnimationReset();
    }
  }

  private startEnemyTurn(): void {
    this.actionReady.set(false);
    if (!this.applyCombatEvent({ type: 'enemy-turn-started' })) return;
    this.combatMessage.set(this.enemyIntentMessage(this.enemy()));
    this.scheduleEnemyTurn();
  }

  private scheduleEnemyTurn(): void {
    this.cancelPendingEnemyTurn();
    const generation = this.runGeneration;
    this.pendingEnemyTurn = this.clock.schedule(() => {
      if (generation !== this.runGeneration) return;
      this.beginEnemyAction();
    }, 650);
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
      this.syncHealthTrails();
      this.actionReady.set(true);
    }, 700);
  }

  private cancelPendingEnemyAnimationReset(): void {
    this.pendingEnemyAnimationReset?.cancel();
    this.pendingEnemyAnimationReset = null;
  }

  private cancelPendingPlayerImpact(): void {
    this.pendingPlayerImpact?.cancel();
    this.pendingPlayerImpact = null;
  }

  private cancelPendingCombatFeedbackReset(): void {
    this.pendingCombatFeedbackReset?.cancel();
    this.pendingCombatFeedbackReset = null;
  }

  private showHealthDamageTrail(
    target: 'player' | 'enemy',
    previousHealth: number,
    currentHealth: number,
    maximumHealth: number,
  ): void {
    const previousPercent = this.healthPercent(previousHealth, maximumHealth);
    const currentPercent = this.healthPercent(currentHealth, maximumHealth);
    const trail = Math.max(previousPercent, currentPercent);
    if (target === 'player') this.playerHealthTrail.set(trail);
    else this.enemyHealthTrail.set(trail);
  }

  private syncHealthTrail(
    target: 'player' | 'enemy',
    remainingHealth: number,
    maximumHealth: number,
  ): void {
    const percent = this.healthPercent(remainingHealth, maximumHealth);
    if (target === 'player') this.playerHealthTrail.set(percent);
    else this.enemyHealthTrail.set(percent);
  }

  private syncHealthTrails(): void {
    const player = this.player();
    const enemy = this.enemy();
    if (player) {
      this.syncHealthTrail('player', this.playerRemainingHealth(), player.stats.health);
    }
    if (enemy) {
      this.syncHealthTrail('enemy', enemy.stats.health - enemy.damageTaken, enemy.stats.health);
    }
  }

  private healthPercent(remainingHealth: number, maximumHealth: number): number {
    if (maximumHealth <= 0) return 0;
    return Math.max(0, Math.min(100, (remainingHealth / maximumHealth) * 100));
  }

  private showCombatFeedback(feedback: Omit<CombatFeedback, 'id'>): void {
    this.cancelPendingCombatFeedbackReset();
    this.combatFeedback.set({ ...feedback, id: ++this.feedbackSequence });
    const generation = this.runGeneration;
    this.pendingCombatFeedbackReset = this.clock.schedule(() => {
      this.pendingCombatFeedbackReset = null;
      if (generation === this.runGeneration) this.combatFeedback.set(null);
    }, 850);
  }

  private intentVerb(intent: EnemyIntent): string {
    if (intent.kind === 'guard') return `raises ${intent.maxValue} Block`;
    if (intent.kind === 'heal') return `prepares to recover ${intent.maxValue} HP`;
    return `prepares ${intent.kind === 'attack' ? 'Attack' : 'Magic'}`;
  }

  private enemyIntentMessage(
    enemy: EnemyState | null,
    intent = this.combatState().enemyIntent,
  ): string {
    if (!enemy || !intent) return 'Choose your action.';
    if (intent.kind === 'guard')
      return `${enemy.definition.name} intends to Guard for ${intent.maxValue} Block.`;
    if (intent.kind === 'heal')
      return `${enemy.definition.name} intends to recover ${intent.maxValue} HP.`;
    const range =
      intent.minValue === intent.maxValue
        ? `${intent.maxValue}`
        : `${intent.minValue}–${intent.maxValue}`;
    return `${enemy.definition.name} intends to use ${intent.kind === 'attack' ? 'Attack' : 'Magic'} for ${range} damage.`;
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
          relicCharges: snapshot.player.relicCharges ?? {},
          defeatedEnemies: snapshot.player.defeatedEnemies ?? [],
        });
        const restoredEnemy = snapshot.combatState.enemy;
        const restoredIntent =
          snapshot.combatState.enemyIntent ??
          (restoredEnemy
            ? chooseEnemyIntent(
                restoredEnemy,
                snapshot.player.stats,
                this.random(),
                snapshot.combatState.turn ?? 0,
              )
            : null);
        this.combatState.set({
          ...snapshot.combatState,
          enemyIntent: restoredIntent,
          playerBlock: snapshot.combatState.playerBlock ?? 0,
          enemyBlock: snapshot.combatState.enemyBlock ?? 0,
          enemyHexed: snapshot.combatState.enemyHexed ?? false,
          turn: snapshot.combatState.turn ?? 0,
          playerActions: snapshot.combatState.playerActions ?? 0,
          damagingActions: snapshot.combatState.damagingActions ?? 0,
          attackCount: snapshot.combatState.attackCount ?? 0,
          magicActions: snapshot.combatState.magicActions ?? 0,
          potionUses: snapshot.combatState.potionUses ?? 0,
          enemyDamageActions: snapshot.combatState.enemyDamageActions ?? 0,
          enemyVenom: snapshot.combatState.enemyVenom ?? 0,
          openingActor: snapshot.combatState.openingActor ?? null,
          relicFlags: snapshot.combatState.relicFlags ?? {},
          enemy: restoredEnemy
            ? {
                ...restoredEnemy,
                definition:
                  findEnemyDefinition(restoredEnemy.definition.id) ?? restoredEnemy.definition,
              }
            : null,
        });
        this.syncHealthTrails();
        this.enemyAnimation.set('idle');
        this.enemyActionKind.set(null);
        this.playerAnimation.set(
          snapshot.screen === 'game-over' && snapshot.combatState.phase === 'defeat'
            ? 'defeat'
            : 'idle',
        );
        this.screen.set(snapshot.screen as GameScreen);
        if (snapshot.screen === 'store') {
          this.storeItems.set(
            generateStoreOffers(this.player()!, { floor: routeFloor, random: this.random }),
          );
        }
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
