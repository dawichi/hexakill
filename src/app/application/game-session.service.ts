import { effect, Injectable, inject, signal } from '@angular/core';
import { SoundEffect } from '../domain/assets';
import { CombatEvent, CombatSnapshot, EnemyMove, PlayerAction } from '../domain/combat';
import { DamageKind } from '../domain/game-types';
import { PowerUpType } from '../domain/player';
import { NAME_MAX, validatePlayerName } from '../domain/player-name';
import { Preferences, TextSpeed, volumeFromPercent } from '../domain/preferences';
import { dailyChallenge, formatSeed, parseSeed } from '../domain/random';
import { addPersonalRecord, PersonalRecord } from '../domain/records';
import { isRelicId, RelicId } from '../domain/relics';
import { FINAL_ROOM } from '../domain/route-map';
import {
  choosePowerUp as applyRunPowerUp,
  createRun,
  chooseRouteNode as enterRouteNode,
  isRunOver,
  leaveCombat,
  leaveStore,
  playerAction,
  purchasePotions,
  purchaseRelic,
  RunState,
  roomsCleared,
} from '../domain/run';
import { POTION_OFFERS, PotionOfferId } from '../domain/store';
import { combatMessagePresentationDelay } from '../ui/combat-message-timing';
import { combatEventMessage } from '../ui/combat-messages';
import { AUDIO, AudioPort } from './audio';
import { BROWSER_CLOCK, CLOCK, Clock } from './clock';
import { PresentationQueue } from './presentation-queue';
import { musicForScreen } from './screen-music';
import { SessionPersistence } from './session-persistence';
import type {
  CharacterView,
  CombatFeedback,
  CombatFeedbackKind,
  CombatUiPhase,
} from './session-view-model';
import { createSessionViews, phaseForRun } from './session-view-model';
import { BROWSER_STORAGE, KeyValueStore, STORAGE } from './storage';

export type {
  CharacterView,
  CombatFeedback,
  CombatFeedbackKind,
  DefeatedEnemySummary,
  EnemyIntentView,
  EnemyView,
  GameScreen,
  PlayerView,
  RouteLayerView,
  RouteMapView,
  RouteNodeView,
} from './session-view-model';

const PLAYER_ACTION_SOUND: Readonly<Record<EnemyMove['kind'] | PlayerAction, SoundEffect>> = {
  attack: 'attack',
  magic: 'magic',
  guard: 'guard',
  potion: 'potion',
  heal: 'potion',
  charge: 'magic',
};

function readUrlSeed(): number | null {
  try {
    const raw = new URLSearchParams(globalThis.location?.search ?? '').get('seed');
    if (!raw) return null;
    if (/^\d+$/.test(raw)) {
      const decimal = Number(raw);
      if (Number.isSafeInteger(decimal) && decimal >= 0 && decimal <= 0xffff_ffff) return decimal;
    }
    return parseSeed(raw);
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class GameSessionService {
  private readonly storage: KeyValueStore = inject(STORAGE, { optional: true }) ?? BROWSER_STORAGE;
  private readonly persistence = new SessionPersistence(this.storage);
  private readonly audio: AudioPort | null = inject(AUDIO, { optional: true });
  private readonly clock: Clock = inject(CLOCK, { optional: true }) ?? BROWSER_CLOCK;
  private readonly presentationQueue = new PresentationQueue(this.clock);
  private readonly urlSeed = readUrlSeed();
  private readonly runState = signal<RunState | null>(this.persistence.restoreRun());
  private readonly preRunScreen = signal<'welcome' | 'character-select'>('welcome');
  private readonly preferencesState = signal<Preferences>(this.persistence.restorePreferences());
  private readonly visiblePhase = signal<CombatUiPhase>('player-turn');
  private readonly displaySnapshot = signal<CombatSnapshot | null>(null);
  private feedbackSequence = 0;
  private animationSequence = 0;

  readonly playerName = signal(this.runState()?.player.name ?? '');
  readonly selectedCharacter = signal<CharacterView | null>(null);
  readonly dailyRequested = signal(false);
  readonly isPresenting = signal(false);
  readonly personalRecords = signal<readonly PersonalRecord[]>(this.persistence.readRecords(false));
  readonly dailyRecords = signal<readonly PersonalRecord[]>(this.persistence.readRecords(true));
  readonly combatMessage = signal('');
  readonly enemyAnimation = signal<'idle' | 'attack' | 'hit' | 'defeat'>('idle');
  readonly enemyActionKind = signal<DamageKind | null>(null);
  readonly playerAnimation = signal<'idle' | 'action' | 'hit' | 'defeat'>('idle');
  readonly playerActionKind = signal<DamageKind | null>(null);
  readonly combatFeedback = signal<CombatFeedback | null>(null);
  readonly lastActionAt = signal<number | null>(null);
  private readonly views = createSessionViews({
    run: this.runState,
    preRunScreen: this.preRunScreen,
    isPresenting: this.isPresenting,
    visiblePhase: this.visiblePhase,
    displaySnapshot: this.displaySnapshot,
    playerName: this.playerName,
    selectedCharacter: this.selectedCharacter,
    dailyRequested: this.dailyRequested,
    preferences: this.preferencesState,
    playerActionKind: this.playerActionKind,
    enemyActionKind: this.enemyActionKind,
    enemyAnimation: this.enemyAnimation,
    now: () => this.clock.now(),
  });

  readonly characters = this.views.characters;
  readonly screen = this.views.screen;
  readonly player = this.views.player;
  readonly enemy = this.views.enemy;
  readonly routeMap = this.views.routeMap;
  readonly routeLayers = this.views.routeLayers;
  readonly storeItems = this.views.storeItems;
  readonly storePotions = POTION_OFFERS;
  readonly totalRooms = FINAL_ROOM;
  readonly completedRooms = this.views.completedRooms;
  readonly runProgressPercent = this.views.runProgressPercent;
  readonly playerRemainingHealth = this.views.playerRemainingHealth;
  readonly playerHealthTrail = this.views.playerHealthTrail;
  readonly enemyHealthTrail = this.views.enemyHealthTrail;
  readonly enemyIntent = this.views.enemyIntent;
  readonly playerDamageRanges = this.views.playerDamageRanges;
  readonly playerGuardAmount = this.views.playerGuardAmount;
  readonly playerBlock = this.views.playerBlock;
  readonly enemyBlock = this.views.enemyBlock;
  readonly enemyHexed = this.views.enemyHexed;
  readonly combatState = this.views.combatState;
  readonly combatStatus = this.views.combatStatus;
  readonly canAct = this.views.canAct;
  readonly playerActionAsset = this.views.playerActionAsset;
  readonly playerIdleSpriteAsset = this.views.playerIdleSpriteAsset;
  readonly playerHitAsset = this.views.playerHitAsset;
  readonly enemyAsset = this.views.enemyAsset;
  readonly enemySpriteAsset = this.views.enemySpriteAsset;
  readonly defeatedEnemySummary = this.views.defeatedEnemySummary;
  readonly validationMessage = this.views.validationMessage;
  readonly canStartRun = this.views.canStartRun;
  readonly musicVolume = this.views.musicVolume;
  readonly effectsVolume = this.views.effectsVolume;
  readonly muted = this.views.muted;
  readonly textSpeed = this.views.textSpeed;
  readonly shareSeed = this.views.shareSeed;
  readonly dailyLabel = this.views.dailyLabel;

  constructor() {
    this.audio?.setVolumes(
      this.preferencesState().muted ? 0 : this.preferencesState().musicVolume,
      this.preferencesState().muted ? 0 : this.preferencesState().effectsVolume,
    );
    effect(() => this.syncMusic());
    const restored = this.runState();
    if (restored) {
      this.selectedCharacter.set(
        this.characters.find((character) => character.id === restored.player.characterId) ?? null,
      );
      this.combatMessage.set('Your saved run was restored.');
    }
    this.persistRecords();
  }

  beginCharacterSelection(daily = false): void {
    this.dailyRequested.set(daily);
    this.preRunScreen.set('character-select');
    this.audio?.playMusic('characterSelect');
  }

  setPlayerName(name: string): void {
    this.playerName.set(name.slice(0, NAME_MAX));
  }

  selectCharacter(character: CharacterView): void {
    this.selectedCharacter.set(character);
  }

  startRun(): void {
    const character = this.selectedCharacter();
    const name = this.playerName().trim();
    if (!character || validatePlayerName(name)) return;
    const daily = this.dailyRequested() ? dailyChallenge(new Date(this.clock.now())) : null;
    const randomSeed = Math.floor(Math.random() * 0x1_0000_0000) >>> 0;
    const seed = daily?.seed ?? this.urlSeed ?? randomSeed;
    this.cancelAll();
    this.clearCombatPresentation();
    const run = createRun(seed, name, character.id, daily?.date ?? null);
    this.setRun(run);
    this.combatMessage.set(
      daily
        ? `${this.dailyLabel()} · today's route is ready.`
        : 'Choose a door. The dungeon will reveal what waits beyond it.',
    );
  }

  chooseRouteNode(nodeId: string): void {
    const run = this.runState();
    if (!run) return;
    const step = enterRouteNode(run, nodeId);
    if (step.run === run) return;
    this.setRun(step.run);
    this.handleNotice(step.notice);
    this.enqueueEvents(step.events);
    if (step.notice?.type === 'rest') {
      this.combatMessage.set(
        step.notice.healed > 0
          ? `The campfire restored ${step.notice.healed} HP for the next encounter.`
          : 'The campfire found you at full health. The next route awaits.',
      );
    }
  }

  openRouteMap(): void {
    const run = this.runState();
    if (run?.screen !== 'combat' || run.combat?.phase !== 'victory' || this.isPresenting()) return;
    this.setRun(leaveCombat(run).run);
    this.combatMessage.set('Choose your next route.');
  }

  closeStore(): void {
    const run = this.runState();
    if (run?.screen === 'store') this.setRun(leaveStore(run).run);
  }

  buyItem(itemId: string): void {
    const run = this.runState();
    if (!run || !isRelicId(itemId)) return;
    const step = purchaseRelic(run, itemId as RelicId);
    this.setRun(step.run);
    this.handleNotice(step.notice);
  }

  buyPotions(offerId: string): void {
    const run = this.runState();
    if (!run || !POTION_OFFERS.some((offer) => offer.id === offerId)) return;
    const step = purchasePotions(run, offerId as PotionOfferId);
    this.setRun(step.run);
    this.handleNotice(step.notice);
  }

  attack(kind: DamageKind): void {
    this.performAction(kind);
  }

  guard(): void {
    this.performAction('guard');
  }

  usePotion(): void {
    this.performAction('potion');
  }

  choosePowerUp(type: PowerUpType): void {
    const run = this.runState();
    if (!run || !['health', 'ad', 'ap', 'armor', 'mr', 'speed'].includes(type)) return;
    const step = applyRunPowerUp(run, type);
    if (step.run !== run) this.setRun(step.run);
  }

  clearPersonalRecords(): void {
    this.personalRecords.set([]);
    this.dailyRecords.set([]);
    this.persistRecords();
  }

  setMusicVolume(percent: number): void {
    this.updatePreferences({ musicVolume: volumeFromPercent(percent) });
  }

  setEffectsVolume(percent: number): void {
    this.updatePreferences({ effectsVolume: volumeFromPercent(percent) });
  }

  setTextSpeed(speed: TextSpeed): void {
    if (speed === 'slow' || speed === 'normal' || speed === 'instant')
      this.updatePreferences({ textSpeed: speed });
  }

  toggleMuted(): void {
    this.updatePreferences({ muted: !this.preferencesState().muted });
  }

  copySeed(): void {
    const seed = this.shareSeed();
    if (!seed) return;
    try {
      const clipboard = globalThis.navigator?.clipboard;
      if (clipboard)
        void clipboard.writeText(seed).then(
          () => this.combatMessage.set(`Seed ${seed} copied.`),
          () => this.combatMessage.set(`Share seed: ${seed}`),
        );
      else this.combatMessage.set(`Share seed: ${seed}`);
    } catch {
      this.combatMessage.set(`Share seed: ${seed}`);
    }
  }

  /** Skip the remaining presentation events and reveal the already-saved domain result. */
  skipPresentation(): void {
    if (!this.isPresenting()) return;
    this.presentationQueue.skip();
  }

  /** All transient animation and message work is stopped through this one reset path. */
  cancelAll(): void {
    this.presentationQueue.cancelAll();
    this.animationSequence += 1;
    this.isPresenting.set(false);
    this.displaySnapshot.set(null);
    this.visiblePhase.set(phaseForRun(this.runState()));
  }

  reset(): void {
    this.cancelAll();
    this.clearCombatPresentation();
    this.setRun(null);
    this.preRunScreen.set('welcome');
    this.dailyRequested.set(false);
    this.playerName.set('');
    this.selectedCharacter.set(null);
    this.combatMessage.set('');
  }

  private performAction(action: PlayerAction): void {
    if (!this.canAct()) return;
    const run = this.runState();
    if (!run) return;
    this.lastActionAt.set(this.clock.now());
    const step = playerAction(run, action);
    if (step.run === run) return;
    this.setRun(step.run);
    this.enqueueEvents(step.events);
  }

  private enqueueEvents(events: readonly CombatEvent[]): void {
    if (!events.length) return;
    this.isPresenting.set(true);
    const steps = events.map((event, index) => ({
      delayMs: index === 0 ? 0 : this.eventDelay(events[index - 1] ?? event),
      apply: (fastForward: boolean) => this.applyPresentationEvent(event, fastForward),
    }));
    const lastEvent = events[events.length - 1];
    if (lastEvent) {
      steps.push({
        delayMs: this.eventDelay(lastEvent),
        apply: () => this.finishPresentation(),
      });
    }
    this.presentationQueue.enqueue(steps);
  }

  private eventDelay(event: CombatEvent): number {
    const message = combatEventMessage(event, this.enemy()?.definition.name ?? 'The enemy');
    const minimumMs =
      event.type === 'combat-start'
        ? 650
        : event.type === 'action'
          ? event.actor === 'player'
            ? 320
            : 360
          : 0;
    return combatMessagePresentationDelay(message, this.textSpeed(), minimumMs);
  }

  private applyPresentationEvent(event: CombatEvent, fastForward = false): void {
    this.displaySnapshot.set(event.snapshot);
    const message = combatEventMessage(event, this.enemy()?.definition.name ?? 'The enemy');
    switch (event.type) {
      case 'combat-start':
        this.visiblePhase.set(event.opening === 'enemy' ? 'enemy-turn' : 'player-turn');
        this.combatMessage.set(message);
        break;
      case 'action':
        if (event.actor === 'player') {
          this.visiblePhase.set('player-turn');
          this.playerActionKind.set(
            event.action === 'attack' || event.action === 'magic' ? event.action : null,
          );
          this.playerAnimation.set(
            event.action === 'attack' || event.action === 'magic' ? 'action' : 'idle',
          );
          this.combatMessage.set(message);
          if (!fastForward) this.audio?.playSound(this.soundForPlayerAction(event.action));
        } else {
          this.visiblePhase.set('enemy-turn');
          this.enemyActionKind.set(
            event.action === 'attack' || event.action === 'magic' ? event.action : null,
          );
          this.enemyAnimation.set(
            event.action === 'attack' || event.action === 'magic' ? 'attack' : 'idle',
          );
          this.combatMessage.set(message);
        }
        if (!fastForward) this.resetAnimationsLater(520);
        break;
      case 'hit': {
        const target = event.target;
        const isDefeated =
          target === 'enemy' ? event.snapshot.enemyHealth <= 0 : event.snapshot.playerHealth <= 0;
        const kind: CombatFeedbackKind = event.missed
          ? 'miss'
          : event.critical
            ? 'critical'
            : event.amount === 0 && event.blocked > 0
              ? 'blocked'
              : 'damage';
        if (!fastForward)
          this.showFeedback({
            target,
            kind,
            amount: event.missed
              ? undefined
              : event.target === 'enemy'
                ? event.amount
                : event.blocked,
            action: event.kind,
          });
        if (target === 'enemy') {
          this.enemyAnimation.set(isDefeated ? 'defeat' : 'hit');
          this.enemyActionKind.set(null);
        } else {
          this.playerAnimation.set(isDefeated ? 'defeat' : 'hit');
        }
        this.combatMessage.set(message);
        if (!fastForward && !event.missed)
          this.audio?.playSound(target === 'enemy' ? 'enemyKilled' : event.kind);
        if (!fastForward) this.resetAnimationsLater(620);
        break;
      }
      case 'effect-damage':
        if (!fastForward)
          this.showFeedback({ target: event.target, kind: 'damage', amount: event.amount });
        this.combatMessage.set(message);
        break;
      case 'block':
        if (!fastForward)
          this.showFeedback({
            target: event.target,
            kind: event.source === 'guard' ? 'guard' : 'blocked',
            amount: event.amount,
          });
        this.combatMessage.set(message);
        break;
      case 'heal':
        if (!fastForward)
          this.showFeedback({ target: event.target, kind: 'heal', amount: event.amount });
        this.combatMessage.set(message);
        break;
      case 'status':
        if (!fastForward)
          this.showFeedback({
            target: event.target,
            kind: event.status === 'hex' ? 'hex' : 'guard',
            amount: event.amount,
          });
        this.combatMessage.set(message);
        break;
      case 'relic':
        this.combatMessage.set(message);
        break;
      case 'victory':
        this.visiblePhase.set('victory');
        this.combatMessage.set(message);
        if (!fastForward) this.audio?.playSound('enemyKilled');
        break;
      case 'defeat':
        this.visiblePhase.set('defeat');
        this.playerAnimation.set('defeat');
        this.combatMessage.set(message);
        break;
    }
  }

  private finishPresentation(): void {
    this.displaySnapshot.set(null);
    this.isPresenting.set(false);
    this.visiblePhase.set(phaseForRun(this.runState()));
    if (this.visiblePhase() !== 'defeat') this.playerAnimation.set('idle');
    if (this.visiblePhase() !== 'victory') this.enemyAnimation.set('idle');
    this.syncMusic();
  }

  private soundForPlayerAction(action: EnemyMove['kind'] | PlayerAction): SoundEffect {
    return PLAYER_ACTION_SOUND[action];
  }

  private showFeedback(feedback: Omit<CombatFeedback, 'id'>): void {
    const current = { ...feedback, id: ++this.feedbackSequence };
    this.combatFeedback.set(current);
    this.presentationQueue.schedule(850, () => {
      if (this.combatFeedback()?.id === current.id) this.combatFeedback.set(null);
    });
  }

  private resetAnimationsLater(delay: number): void {
    const currentSequence = ++this.animationSequence;
    this.presentationQueue.schedule(delay, () => {
      if (currentSequence !== this.animationSequence) return;
      if (this.enemyAnimation() !== 'defeat') this.enemyAnimation.set('idle');
      if (this.playerAnimation() !== 'defeat') this.playerAnimation.set('idle');
    });
  }

  private handleNotice(notice: ReturnType<typeof enterRouteNode>['notice']): void {
    if (notice?.type !== 'purchase') return;
    this.combatMessage.set(notice.message);
    this.audio?.playSound(notice.purchased ? 'coin' : 'error');
  }

  private setRun(run: RunState | null): void {
    this.runState.set(run);
    this.persistence.saveRun(run);
    if (run) {
      this.playerName.set(run.player.name);
      this.selectedCharacter.set(
        this.characters.find((character) => character.id === run.player.characterId) ?? null,
      );
      this.preRunScreen.set('welcome');
      this.writeRunRecordIfNeeded(run);
    }
    this.syncMusic();
  }

  private writeRunRecordIfNeeded(run: RunState): void {
    if (!isRunOver(run)) return;
    const record: PersonalRecord = {
      name: run.player.name,
      characterId: run.player.characterId,
      level: run.player.level,
      rooms: roomsCleared(run),
      victory: run.screen === 'run-complete',
      seed: formatSeed(run.seed),
      date: new Date(this.clock.now()).toISOString().slice(0, 10),
      daily: run.daily !== null,
    };
    const records = record.daily ? this.dailyRecords() : this.personalRecords();
    if (
      records.some(
        (item) =>
          item.seed === record.seed &&
          item.characterId === record.characterId &&
          item.name === record.name,
      )
    )
      return;
    const updated = addPersonalRecord(records, record);
    if (record.daily) this.dailyRecords.set(updated);
    else this.personalRecords.set(updated);
    this.persistRecords();
  }

  private persistRecords(): void {
    this.persistence.saveRecords(this.personalRecords(), this.dailyRecords());
  }

  private updatePreferences(changes: Partial<Preferences>): void {
    const preferences = { ...this.preferencesState(), ...changes };
    this.preferencesState.set(preferences);
    this.persistence.savePreferences(preferences);
    this.audio?.setVolumes(
      preferences.muted ? 0 : preferences.musicVolume,
      preferences.muted ? 0 : preferences.effectsVolume,
    );
  }

  private syncMusic(): void {
    const track = musicForScreen(this.screen(), this.runState());
    if (track) this.audio?.playMusic(track);
    else this.audio?.stopMusic();
  }

  private clearCombatPresentation(): void {
    this.playerAnimation.set('idle');
    this.enemyAnimation.set('idle');
    this.playerActionKind.set(null);
    this.enemyActionKind.set(null);
    this.combatFeedback.set(null);
    this.displaySnapshot.set(null);
  }
}
