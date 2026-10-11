import { computed, Signal } from '@angular/core';
import { CHARACTERS, CharacterDefinition, startingStats } from '../domain/characters';
import {
  CombatSnapshot,
  EnemyMove,
  intentRange,
  playerDamagePreview,
  playerGuardBlock,
} from '../domain/combat';
import {
  EnemyDefinition,
  EnemyState,
  enemyRemainingHealth,
  findEnemyDefinition,
} from '../domain/enemies';
import { DamageKind, SpriteStripAsset, Stats } from '../domain/game-types';
import { PlayerState, remainingHealth } from '../domain/player';
import { validatePlayerName } from '../domain/player-name';
import { Preferences, TextSpeed, volumePercent } from '../domain/preferences';
import { dailyChallenge, formatSeed } from '../domain/random';
import { RelicView, relicView } from '../domain/relics';
import {
  FINAL_ROOM,
  findRouteNode,
  RouteGraph,
  RouteNode,
  RouteNodeKind,
  routeNodeCopy,
} from '../domain/route-map';
import { frontier, isRunOver, RunScreen, RunState, roomsCleared, routeGraph } from '../domain/run';

export type GameScreen = 'welcome' | 'character-select' | RunScreen;
export type CombatUiPhase = 'player-turn' | 'enemy-turn' | 'victory' | 'defeat';
export type CombatFeedbackKind =
  | 'damage'
  | 'critical'
  | 'miss'
  | 'blocked'
  | 'heal'
  | 'guard'
  | 'hex';

export interface CombatFeedback {
  readonly id: number;
  readonly target: 'player' | 'enemy';
  readonly kind: CombatFeedbackKind;
  readonly amount?: number;
  readonly action?: DamageKind;
}

export interface CharacterView extends CharacterDefinition {
  readonly startingStats: Stats;
  readonly idleAsset: string;
  readonly idleSpriteAsset: SpriteStripAsset | null;
  readonly actionAsset: SpriteStripAsset | null;
  readonly magicAsset: SpriteStripAsset | null;
  readonly hitAsset: SpriteStripAsset | null;
  readonly defeatAsset: SpriteStripAsset | null;
}

export interface PlayerView extends PlayerState {
  readonly character: CharacterView;
  readonly inventory: readonly RelicView[];
  readonly powerUps: PlayerState['powerUps'] & { readonly pending: number };
}

export interface EnemyView extends EnemyState {
  readonly definition: EnemyDefinition;
}

export interface EnemyIntentView extends EnemyMove {
  readonly minValue: number;
  readonly maxValue: number;
}

export interface RouteNodeView extends RouteNode {
  readonly title: string;
  readonly description: string;
  readonly reward: string;
  readonly risk: 'safe' | 'steady' | 'dangerous' | 'milestone';
  readonly nextNodeIds: readonly string[];
  readonly nextKinds: readonly RouteNodeKind[];
}

export interface RouteLayerView {
  readonly floor: number;
  readonly nodes: readonly RouteNodeView[];
}

export type RouteMapView = RouteLayerView;

export interface DefeatedEnemySummary {
  readonly enemyId: string;
  readonly name: string;
  readonly idleAsset: string;
  readonly count: number;
  readonly levelsLabel: string;
}

const VIEW_CHARACTERS: readonly CharacterView[] = CHARACTERS.map((character) => ({
  ...character,
  startingStats: startingStats(character),
  idleAsset: character.sprites.portrait,
  idleSpriteAsset: character.sprites.strips.idle ?? null,
  actionAsset: character.sprites.strips.attack ?? null,
  magicAsset: character.sprites.strips.magic ?? null,
  hitAsset: character.sprites.strips.hit ?? null,
  defeatAsset: character.sprites.strips.defeat ?? null,
}));

function toEnemyView(enemy: EnemyState | null | undefined): EnemyView | null {
  return enemy ? { ...enemy, definition: findEnemyDefinition(enemy.id) } : null;
}

function toPlayerView(player: PlayerState, snapshot?: CombatSnapshot): PlayerView {
  const character = VIEW_CHARACTERS.find((candidate) => candidate.id === player.characterId);
  if (!character) throw new Error(`Unknown character id: ${player.characterId}`);
  const damageTaken = snapshot
    ? Math.max(0, snapshot.playerMaxHealth - snapshot.playerHealth)
    : player.damageTaken;
  return {
    ...player,
    damageTaken,
    character,
    inventory: player.relics.map(relicView),
    powerUps: { ...player.powerUps, pending: player.pendingPowerUps },
  };
}

function toRouteNode(
  node: RouteNode,
  graph: RouteGraph,
  nextNodeIds = node.nextIds,
): RouteNodeView {
  const copy = routeNodeCopy(node);
  return {
    ...node,
    ...copy,
    nextNodeIds,
    nextKinds: nextNodeIds
      .map((id) => findRouteNode(graph, id)?.kind)
      .filter((kind): kind is RouteNodeKind => kind !== undefined),
  };
}

function asRouteLayers(run: RunState): RouteLayerView[] {
  const nodes = frontier(run);
  if (!nodes.length) return [];
  const graph = routeGraph(run);
  const currentRoom = run.visited.length + 1;
  const layers: RouteLayerView[] = [
    { floor: currentRoom, nodes: nodes.map((node) => toRouteNode(node, graph)) },
  ];
  let reachable = new Set(nodes.flatMap((node) => node.nextIds));
  for (let room = currentRoom + 1; room <= Math.min(FINAL_ROOM, currentRoom + 3); room += 1) {
    const layer = graph[room - 1] ?? [];
    const visible = layer.filter((node) => reachable.has(node.id));
    if (!visible.length) break;
    layers.push({ floor: room, nodes: visible.map((node) => toRouteNode(node, graph)) });
    reachable = new Set(visible.flatMap((node) => node.nextIds));
  }
  return layers;
}

function dailyNumber(date: string): number {
  const midnight = Date.parse(`${date}T00:00:00Z`);
  return Number.isFinite(midnight) ? Math.floor(midnight / 86_400_000) : 0;
}

export interface SessionViewInputs {
  readonly run: Signal<RunState | null>;
  readonly preRunScreen: Signal<'welcome' | 'character-select'>;
  readonly isPresenting: Signal<boolean>;
  readonly visiblePhase: Signal<CombatUiPhase>;
  readonly displaySnapshot: Signal<CombatSnapshot | null>;
  readonly playerName: Signal<string>;
  readonly selectedCharacter: Signal<CharacterView | null>;
  readonly dailyRequested: Signal<boolean>;
  readonly preferences: Signal<Preferences>;
  readonly playerActionKind: Signal<DamageKind | null>;
  readonly enemyActionKind: Signal<DamageKind | null>;
  readonly enemyAnimation: Signal<'idle' | 'attack' | 'hit' | 'defeat'>;
  readonly now: () => number;
}

export function createSessionViews(input: SessionViewInputs) {
  const characters = VIEW_CHARACTERS;
  const screen = computed<GameScreen>(() => {
    const run = input.run();
    if (run && input.isPresenting() && isRunOver(run)) return 'combat';
    return run?.screen ?? input.preRunScreen();
  });
  const player = computed<PlayerView | null>(() => {
    const run = input.run();
    return run ? toPlayerView(run.player, input.displaySnapshot() ?? undefined) : null;
  });
  const enemy = computed<EnemyView | null>(() => {
    const run = input.run();
    const enemyState = run?.combat?.enemy;
    if (!enemyState) return null;
    const snapshot = input.displaySnapshot();
    return toEnemyView(
      snapshot
        ? {
            ...enemyState,
            damageTaken: Math.max(0, snapshot.enemyMaxHealth - snapshot.enemyHealth),
          }
        : enemyState,
    );
  });
  const routeMap = computed<RouteMapView | null>(() => {
    const run = input.run();
    if (run?.screen !== 'map') return null;
    const graph = routeGraph(run);
    const nodes = frontier(run).map((node) => toRouteNode(node, graph));
    return { floor: run.visited.length + 1, nodes };
  });
  const routeLayers = computed<readonly RouteLayerView[]>(() => {
    const run = input.run();
    return run?.screen === 'map' ? asRouteLayers(run) : [];
  });
  const storeItems = computed<readonly RelicView[]>(() =>
    (input.run()?.screen === 'store' ? (input.run()?.storeOffers ?? []) : []).map(relicView),
  );
  const completedRooms = computed(() => {
    const run = input.run();
    return run ? roomsCleared(run) : 0;
  });
  const runProgressPercent = computed(() => Math.round((completedRooms() / FINAL_ROOM) * 100));
  const playerRemainingHealth = computed(() => {
    const snapshot = input.displaySnapshot();
    const currentPlayer = input.run()?.player;
    return snapshot ? snapshot.playerHealth : currentPlayer ? remainingHealth(currentPlayer) : 0;
  });
  const playerHealthTrail = computed(() => {
    const max = input.displaySnapshot()?.playerMaxHealth ?? input.run()?.player.stats.health ?? 1;
    return Math.max(0, Math.min(100, (playerRemainingHealth() / max) * 100));
  });
  const enemyHealthTrail = computed(() => {
    const currentEnemy = input.run()?.combat?.enemy;
    const health =
      input.displaySnapshot()?.enemyHealth ??
      (currentEnemy ? enemyRemainingHealth(currentEnemy) : 0);
    return currentEnemy
      ? Math.max(0, Math.min(100, (health / currentEnemy.stats.health) * 100))
      : 0;
  });
  const enemyIntent = computed<EnemyIntentView | null>(() => {
    const run = input.run();
    const combat = run?.combat;
    const intent = input.displaySnapshot()?.intent ?? combat?.intent;
    if (!run || !combat || !intent) return null;
    const [minValue, maxValue] = intentRange(intent, combat.enemy, run.player);
    return { ...intent, minValue, maxValue };
  });
  const playerDamageRanges = computed(() => {
    const run = input.run();
    if (!run?.combat) return { attack: [0, 0] as const, magic: [0, 0] as const };
    return {
      attack: playerDamagePreview(run.player, run.combat, 'attack'),
      magic: playerDamagePreview(run.player, run.combat, 'magic'),
    };
  });
  const playerGuardAmount = computed(() => {
    const currentPlayer = input.run()?.player;
    return currentPlayer ? playerGuardBlock(currentPlayer) : 0;
  });
  const playerBlock = computed(
    () => input.displaySnapshot()?.playerBlock ?? input.run()?.combat?.playerBlock ?? 0,
  );
  const enemyBlock = computed(
    () => input.displaySnapshot()?.enemyBlock ?? input.run()?.combat?.enemyBlock ?? 0,
  );
  const enemyHexed = computed(
    () => input.displaySnapshot()?.enemyHexed ?? input.run()?.combat?.enemyHexed ?? false,
  );
  const combatState = computed(() => ({
    phase: input.isPresenting() ? input.visiblePhase() : phaseForRun(input.run()),
    enemy: enemy(),
    playerDamageTaken: Math.max(0, (player()?.stats.health ?? 0) - playerRemainingHealth()),
    enemyIntent: enemyIntent(),
    playerBlock: playerBlock(),
    enemyBlock: enemyBlock(),
    enemyHexed: enemyHexed(),
    turn: input.run()?.combat?.turn ?? 0,
  }));
  const combatStatus = computed(() =>
    combatState().phase === 'victory' || combatState().phase === 'defeat' ? 'defeated' : 'ready',
  );
  const canAct = computed(() => {
    const run = input.run();
    return (
      run?.screen === 'combat' &&
      run.combat?.phase === 'player-turn' &&
      run.player.pendingPowerUps === 0 &&
      !input.isPresenting()
    );
  });
  const playerActionAsset = computed(() => {
    const currentPlayer = player();
    return input.playerActionKind() === 'magic'
      ? (currentPlayer?.character.magicAsset ?? currentPlayer?.character.actionAsset ?? null)
      : (currentPlayer?.character.actionAsset ?? null);
  });
  const playerIdleSpriteAsset = computed(() => player()?.character.idleSpriteAsset ?? null);
  const playerHitAsset = computed(() => player()?.character.hitAsset ?? null);
  const enemyAsset = computed(() => enemy()?.definition.sprites.portrait ?? '');
  const enemySpriteAsset = computed(() => {
    const currentEnemy = enemy();
    if (!currentEnemy) return null;
    const state = input.enemyAnimation();
    const stripState =
      state === 'attack' ? (input.enemyActionKind() === 'magic' ? 'magic' : 'attack') : state;
    return currentEnemy.definition.sprites.strips[stripState] ?? null;
  });
  const defeatedEnemySummary = computed<readonly DefeatedEnemySummary[]>(() => {
    const history = input.run()?.player.defeatedEnemies ?? [];
    const grouped = new Map<string, number[]>();
    for (const item of history) {
      const levels = grouped.get(item.id) ?? [];
      levels.push(item.level);
      grouped.set(item.id, levels);
    }
    return [...grouped.entries()].map(([enemyId, levels]) => ({
      enemyId,
      name: findEnemyDefinition(enemyId).name,
      idleAsset: findEnemyDefinition(enemyId).sprites.portrait,
      count: levels.length,
      levelsLabel: levels.join(', '),
    }));
  });
  const validationMessage = computed(() => {
    const nameMessage = validatePlayerName(input.playerName());
    if (nameMessage) return input.playerName().trim() ? nameMessage : 'Enter a name to continue.';
    return input.selectedCharacter() ? '' : 'Choose a character to continue.';
  });
  const canStartRun = computed(() => validationMessage() === '');
  const musicVolume = computed(() => volumePercent(input.preferences().musicVolume));
  const effectsVolume = computed(() => volumePercent(input.preferences().effectsVolume));
  const muted = computed(() => input.preferences().muted);
  const textSpeed = computed<TextSpeed>(() => input.preferences().textSpeed);
  const shareSeed = computed(() => {
    const run = input.run();
    return run ? formatSeed(run.seed) : '';
  });
  const dailyLabel = computed(() => {
    const date =
      input.run()?.daily ??
      (input.dailyRequested() ? dailyChallenge(new Date(input.now())).date : null);
    return date ? `Daily #${dailyNumber(date)}` : '';
  });

  return {
    characters,
    screen,
    player,
    enemy,
    routeMap,
    routeLayers,
    storeItems,
    completedRooms,
    runProgressPercent,
    playerRemainingHealth,
    playerHealthTrail,
    enemyHealthTrail,
    enemyIntent,
    playerDamageRanges,
    playerGuardAmount,
    playerBlock,
    enemyBlock,
    enemyHexed,
    combatState,
    combatStatus,
    canAct,
    playerActionAsset,
    playerIdleSpriteAsset,
    playerHitAsset,
    enemyAsset,
    enemySpriteAsset,
    defeatedEnemySummary,
    validationMessage,
    canStartRun,
    musicVolume,
    effectsVolume,
    muted,
    textSpeed,
    shareSeed,
    dailyLabel,
  };
}

export function phaseForRun(run: RunState | null): CombatUiPhase {
  if (!run?.combat) return 'player-turn';
  if (run.combat.phase === 'victory') return 'victory';
  if (run.combat.phase === 'defeat') return 'defeat';
  return 'player-turn';
}
