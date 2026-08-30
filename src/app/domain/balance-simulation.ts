import {
  chooseEnemyIntent,
  determineFirstActor,
  guardBlockAmount,
  resolveHeal,
} from './combat-actions';
import { damageDealt, DamageKind, DamageResult, resolveDamage } from './combat-rules';
import { ENEMY_DEFINITIONS, generateEnemy } from './enemies';
import { CHARACTER_DEFINITIONS, createInitialPlayer } from './characters';
import { EnemyIntent, EnemyIntentKind, PlayerCombatAction } from './combat-state';
import { CharacterId, EnemyState, ItemState, PlayerState, Stats } from './game-types';
import {
  relicDamageModifiers,
  relicGuardBlockMultiplier,
  relicGuardBreakMultiplier,
  relicPotionHealingFraction,
  STORE_ITEMS,
} from './store';
import {
  relicBloodLedgerHeal,
  relicCrownOfThornsDamage,
  relicCrownOfThornsVenom,
  relicDamageRules,
  relicArcaneMarkMultiplier,
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
  RelicCombatContext,
} from './relic-rules';

export type SimulationAction = PlayerCombatAction | 'potion';
export type PlayerPolicyId = 'random' | 'class' | 'reactive' | 'greedy';

export interface BalanceScenario {
  readonly id: string;
  readonly characterId: CharacterId;
  readonly enemyId: string;
  readonly enemyLevel: number;
  readonly elite?: boolean;
  readonly startingHealthRatio?: number;
  readonly startingPotions?: number;
  readonly relicIds?: readonly string[];
}

export interface PlayerDecisionContext {
  readonly player: PlayerState;
  readonly playerDamageTaken: number;
  readonly playerBlock: number;
  readonly enemy: EnemyState;
  readonly enemyBlock: number;
  readonly enemyHexed: boolean;
  readonly intent: EnemyIntent;
  readonly turn: number;
  readonly legalActions: readonly SimulationAction[];
  readonly randomChoice: () => number;
}

export type PlayerPolicy = (context: PlayerDecisionContext) => SimulationAction;

export interface SimulationTraceEvent {
  readonly turn: number;
  readonly actor: 'player' | 'enemy';
  readonly action: SimulationAction | EnemyIntentKind;
  readonly damage?: number;
  readonly blocked?: number;
  readonly healed?: number;
  readonly critical?: boolean;
  readonly missed?: boolean;
  readonly playerHealth: number;
  readonly enemyHealth: number;
}

export interface EncounterSimulationResult {
  readonly result: 'win' | 'loss' | 'draw';
  /** Number of player decisions made, which is the most useful combat-length measure. */
  readonly turns: number;
  readonly playerHealth: number;
  readonly playerPotions: number;
  readonly enemyHealth: number;
  readonly potionsUsed: number;
  readonly damageDealt: number;
  readonly damageTaken: number;
  readonly guardDamagePrevented: number;
  readonly hexesApplied: number;
  readonly hexedAttacks: number;
  readonly actions: Readonly<Record<SimulationAction, number>>;
  readonly intents: Readonly<Record<EnemyIntentKind, number>>;
  readonly seed: number;
  readonly trace: readonly SimulationTraceEvent[];
}

export interface SimulateEncounterOptions {
  readonly player: PlayerState;
  readonly enemy: EnemyState;
  readonly seed: number;
  readonly policy: PlayerPolicy;
  readonly startingHealthRatio?: number;
  readonly maxTurns?: number;
  readonly collectTrace?: boolean;
}

export interface BalanceSummary {
  readonly scenarioId: string;
  readonly character: string;
  readonly enemy: string;
  readonly enemyLevel: number;
  readonly elite: boolean;
  readonly policy: PlayerPolicyId;
  readonly samples: number;
  readonly wins: number;
  readonly losses: number;
  readonly draws: number;
  readonly winRate: number;
  readonly averageTurns: number;
  readonly medianTurns: number;
  readonly averageRemainingHealth: number;
  readonly averagePotionsUsed: number;
  readonly averageDamageDealt: number;
  readonly averageDamageTaken: number;
  readonly averageGuardDamagePrevented: number;
  readonly averageHexesApplied: number;
  readonly actionRates: Readonly<Record<SimulationAction, number>>;
  readonly intentRates: Readonly<Record<EnemyIntentKind, number>>;
}

export interface BalanceReport {
  readonly seed: number;
  readonly samplesPerCell: number;
  readonly maxTurns: number;
  readonly summaries: readonly BalanceSummary[];
}

const SIMULATION_ACTIONS: readonly SimulationAction[] = ['attack', 'magic', 'guard', 'potion'];
const ENEMY_INTENTS: readonly EnemyIntentKind[] = ['attack', 'magic', 'guard', 'heal'];
const DEFAULT_MAX_TURNS = 100;
const DEFAULT_SAMPLES = 1_000;

const EMPTY_ACTION_COUNTS: Record<SimulationAction, number> = {
  attack: 0,
  magic: 0,
  guard: 0,
  potion: 0,
};

const EMPTY_INTENT_COUNTS: Record<EnemyIntentKind, number> = {
  attack: 0,
  magic: 0,
  guard: 0,
  heal: 0,
};

export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function hashSeed(seed: number, value: string): number {
  let hash = seed >>> 0;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0 || 1;
}

function clampRatio(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(1, Math.max(0, value));
}

function remainingHealth(stats: Stats, damageTaken: number): number {
  return Math.max(0, stats.health - damageTaken);
}

function percentage(value: number, total: number): number {
  return total > 0 ? value / total : 0;
}

export function strengthenElite(enemy: EnemyState): EnemyState {
  const stats = { ...enemy.stats };
  (Object.keys(stats) as (keyof Stats)[]).forEach((stat) => {
    stats[stat] = Math.round(stats[stat] * 1.15);
  });
  return { ...enemy, stats, gold: Math.round(enemy.gold * 1.5), elite: true };
}

function relicInventory(ids: readonly string[] | undefined): readonly ItemState[] {
  if (!ids?.length) return [];
  return ids.flatMap((id) => {
    const item = STORE_ITEMS.find((candidate) => candidate.id === id);
    return item ? [item] : [];
  });
}

function playerForScenario(scenario: BalanceScenario): PlayerState {
  const character = CHARACTER_DEFINITIONS.find(
    (candidate) => candidate.id === scenario.characterId,
  );
  if (!character) throw new RangeError(`Unknown simulation character: ${scenario.characterId}`);

  const player = createInitialPlayer('Simulation player', character);
  const inventory = relicInventory(scenario.relicIds);
  return {
    ...player,
    inventory,
    relicCharges: inventory.some((item) => item.id === 'phoenix-feather')
      ? { 'phoenix-feather': 1 }
      : {},
    potions: scenario.startingPotions ?? player.potions,
  };
}

function enemyForScenario(player: PlayerState, scenario: BalanceScenario): EnemyState {
  const enemyIndex = ENEMY_DEFINITIONS.findIndex((candidate) => candidate.id === scenario.enemyId);
  if (enemyIndex < 0) throw new RangeError(`Unknown simulation enemy: ${scenario.enemyId}`);

  const minimumLevel = Math.max(1, Math.floor(player.level / 2));
  const maximumLevel = player.level + 1;
  if (scenario.enemyLevel < minimumLevel || scenario.enemyLevel > maximumLevel) {
    throw new RangeError(
      `Enemy level must be between ${minimumLevel} and ${maximumLevel} for player level ${player.level}.`,
    );
  }

  const definitionRoll = (enemyIndex + 0.5) / ENEMY_DEFINITIONS.length;
  const levelRoll = (scenario.enemyLevel - minimumLevel + 0.5) / (maximumLevel - minimumLevel + 1);
  const enemy = generateEnemy(player.level, definitionRoll, levelRoll);
  return scenario.elite ? strengthenElite(enemy) : enemy;
}

function damageModifiersForPlayer(
  player: PlayerState,
  kind: DamageKind,
  enemyBlock: number,
  enemyHexed: boolean,
): { damageMultiplier: number; block: number } {
  const relicModifiers = relicDamageModifiers(player, kind);
  return {
    damageMultiplier:
      (relicModifiers.damageMultiplier ?? 1) *
      (kind === 'attack' && enemyHexed ? relicArcaneMarkMultiplier(player) : 1),
    block: enemyBlock / (kind === 'attack' ? relicGuardBreakMultiplier(player) : 1),
  };
}

function resolvePlayerPreview(context: PlayerDecisionContext, kind: DamageKind): DamageResult {
  return resolveDamage(
    { stats: context.player.stats },
    { stats: context.enemy.stats, damageTaken: context.enemy.damageTaken },
    kind,
    { damageRoll: 0.5, chanceRoll: 0.5 },
    {
      ...relicDamageModifiers(context.player, kind),
      ...damageModifiersForPlayer(context.player, kind, context.enemyBlock, context.enemyHexed),
    },
  );
}

function hasUsablePotion(context: PlayerDecisionContext): boolean {
  return context.player.potions > 0 && context.playerDamageTaken > 0;
}

function classPolicy(context: PlayerDecisionContext): SimulationAction {
  if (context.enemyHexed && context.legalActions.includes('attack')) return 'attack';
  if (context.player.character.id === 'wizard' && context.legalActions.includes('magic')) {
    return 'magic';
  }
  if (context.player.character.id === 'warrior' && context.intent.kind !== 'heal') {
    const remaining = remainingHealth(context.player.stats, context.playerDamageTaken);
    if (context.intent.maxValue > remaining * 0.3 && context.legalActions.includes('guard')) {
      return 'guard';
    }
  }
  return 'attack';
}

function reactivePolicy(context: PlayerDecisionContext): SimulationAction {
  const health = remainingHealth(context.player.stats, context.playerDamageTaken);
  const healthRatio = percentage(health, context.player.stats.health);
  const potion = hasUsablePotion(context)
    ? resolveHeal(
        context.playerDamageTaken,
        context.player.stats.health,
        relicPotionHealingFraction(context.player),
      ).healed
    : 0;
  const damageIntent = context.intent.kind === 'attack' || context.intent.kind === 'magic';
  const threat = damageIntent && context.intent.maxValue > health * 0.22;

  if (potion > 0 && healthRatio <= 0.32 && potion >= context.intent.maxValue * 0.6) {
    return 'potion';
  }
  if (threat && context.legalActions.includes('guard')) return 'guard';
  if (context.enemyHexed && context.legalActions.includes('attack')) return 'attack';
  return classPolicy(context);
}

function greedyPolicy(context: PlayerDecisionContext): SimulationAction {
  const enemyHealth = remainingHealth(context.enemy.stats, context.enemy.damageTaken);
  const playerHealth = remainingHealth(context.player.stats, context.playerDamageTaken);
  let bestAction: SimulationAction = context.legalActions[0] ?? 'attack';
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const action of context.legalActions) {
    let score = 0;
    if (action === 'attack' || action === 'magic') {
      const result = resolvePlayerPreview(context, action);
      const dealt = damageDealt(result);
      score = dealt + (dealt >= enemyHealth ? 10_000 : 0);
      if (action === 'magic' && !context.enemyHexed && dealt > 0) score += 8;
    } else if (action === 'guard') {
      const block = guardBlockAmount(
        context.player.stats,
        relicGuardBlockMultiplier(context.player),
      );
      const incoming =
        context.intent.kind === 'attack' || context.intent.kind === 'magic'
          ? context.intent.maxValue
          : 0;
      const newProtection = Math.max(0, block - context.playerBlock);
      score = Math.min(newProtection, incoming) * 1.3;
      if (context.playerBlock >= incoming && incoming > 0) score -= 15;
      if (incoming >= playerHealth * 0.5) score += 25;
    } else {
      score =
        resolveHeal(
          context.playerDamageTaken,
          context.player.stats.health,
          relicPotionHealingFraction(context.player),
        ).healed * (playerHealth < context.player.stats.health * 0.5 ? 1.5 : 0.1);
    }

    if (score > bestScore) {
      bestScore = score;
      bestAction = action;
    }
  }

  return bestAction;
}

export const PLAYER_POLICIES: Readonly<Record<PlayerPolicyId, PlayerPolicy>> = {
  random: (context) => {
    const index = Math.floor(context.randomChoice() * context.legalActions.length);
    const action = context.legalActions[Math.min(index, context.legalActions.length - 1)];
    if (!action) throw new RangeError('Simulation policy requires at least one legal action.');
    return action;
  },
  class: classPolicy,
  reactive: reactivePolicy,
  greedy: greedyPolicy,
};

function validatePolicyAction(
  action: SimulationAction,
  legalActions: readonly SimulationAction[],
): void {
  if (!legalActions.includes(action)) {
    throw new RangeError(`Simulation policy selected illegal action: ${action}`);
  }
}

function createTraceEvent(
  turn: number,
  actor: SimulationTraceEvent['actor'],
  action: SimulationTraceEvent['action'],
  player: PlayerState,
  playerDamageTaken: number,
  enemy: EnemyState,
  values: Pick<SimulationTraceEvent, 'damage' | 'blocked' | 'healed' | 'critical' | 'missed'> = {},
): SimulationTraceEvent {
  return {
    turn,
    actor,
    action,
    playerHealth: remainingHealth(player.stats, playerDamageTaken),
    enemyHealth: remainingHealth(enemy.stats, enemy.damageTaken),
    ...values,
  };
}

export function simulateEncounter(options: SimulateEncounterOptions): EncounterSimulationResult {
  const maxTurns = options.maxTurns ?? DEFAULT_MAX_TURNS;
  if (!Number.isSafeInteger(maxTurns) || maxTurns < 1) {
    throw new RangeError('Simulation maxTurns must be a positive safe integer.');
  }
  if (!Number.isFinite(options.seed)) throw new RangeError('Simulation seed must be finite.');

  const combatRandom = createSeededRandom(options.seed);
  const decisionRandom = createSeededRandom((options.seed ^ 0x9e3779b9) >>> 0);
  const collectTrace = options.collectTrace ?? true;
  let player = options.player;
  let enemy = options.enemy;
  let playerDamageTaken = Math.round(
    player.stats.health * (1 - clampRatio(options.startingHealthRatio ?? 1)),
  );
  let playerBlock = 0;
  let enemyBlock = 0;
  let enemyHexed = false;
  let enemyVenom = 0;
  let playerActions = 0;
  let damagingActions = 0;
  let attackCount = 0;
  let magicActions = 0;
  let potionUses = 0;
  let enemyDamageActions = 0;
  let relicFlags: Readonly<Record<string, boolean>> = {};
  let turn = 0;
  let playerTurns = 0;
  let potionsUsed = 0;
  let damageDealtTotal = 0;
  let damageTakenTotal = 0;
  let guardDamagePrevented = 0;
  let hexesApplied = 0;
  let hexedAttacks = 0;
  let result: EncounterSimulationResult['result'] = 'draw';
  const actions = { ...EMPTY_ACTION_COUNTS };
  const intents = { ...EMPTY_INTENT_COUNTS };
  const trace: SimulationTraceEvent[] = [];
  let intent = chooseEnemyIntent(enemy, player.stats, combatRandom(), turn);
  let actor = determineFirstActor(player.stats.speed, enemy.stats.speed);
  const openingActor = actor;
  playerBlock = relicStartOfCombatBlock(player);

  const relicContext = (overrides: Partial<RelicCombatContext> = {}): RelicCombatContext => ({
    playerHealth: player.stats.health,
    playerDamageTaken,
    playerActions,
    damagingActions,
    attackCount,
    magicActions,
    potionUses,
    enemyDamageActions,
    openingActor,
    relicFlags,
    ...overrides,
  });

  while (playerTurns < maxTurns && result === 'draw') {
    if (actor === 'player') {
      let potionKeepsTurn = false;
      const legalActions = SIMULATION_ACTIONS.filter(
        (action) =>
          action !== 'potion' ||
          hasUsablePotion({
            player,
            playerDamageTaken,
            playerBlock,
            enemy,
            enemyBlock,
            enemyHexed,
            intent,
            turn,
            legalActions: SIMULATION_ACTIONS,
            randomChoice: decisionRandom,
          }),
      );
      const context: PlayerDecisionContext = {
        player,
        playerDamageTaken,
        playerBlock,
        enemy,
        enemyBlock,
        enemyHexed,
        intent,
        turn,
        legalActions,
        randomChoice: decisionRandom,
      };
      const action = options.policy(context);
      validatePolicyAction(action, legalActions);
      actions[action] += 1;
      playerTurns += 1;

      if (action === 'potion') {
        potionKeepsTurn = relicPotionIsFree(player, relicContext());
        const healResult = resolveHeal(
          playerDamageTaken,
          player.stats.health,
          relicPotionHealingFraction(player),
        );
        playerDamageTaken = healResult.damageTaken;
        player = { ...player, potions: Math.max(0, player.potions - 1) };
        potionsUsed += 1;
        playerActions += 1;
        potionUses += 1;
        playerBlock += relicPotionBlock(
          player,
          relicContext({ potionUses: potionUses - 1, playerActions: playerActions - 1 }),
        );
        if (collectTrace) {
          trace.push(
            createTraceEvent(turn, 'player', action, player, playerDamageTaken, enemy, {
              healed: healResult.healed,
            }),
          );
        }
      } else if (action === 'guard') {
        playerBlock +=
          guardBlockAmount(player.stats, relicGuardBlockMultiplier(player)) +
          relicGuardBonus(player);
        playerActions += 1;
        if (collectTrace) {
          trace.push(
            createTraceEvent(turn, 'player', action, player, playerDamageTaken, enemy, {
              blocked: playerBlock,
            }),
          );
        }
      } else {
        const previousEnemyHexed = enemyHexed;
        const damageRules = relicDamageRules(player, action, relicContext());
        const resultForAction = resolveDamage(
          { stats: player.stats },
          { stats: enemy.stats, damageTaken: enemy.damageTaken },
          action,
          {
            damageRoll: combatRandom(),
            chanceRoll: damageRules.guaranteedHit ? Math.max(0.11, combatRandom()) : combatRandom(),
          },
          {
            damageMultiplier:
              damageRules.damageMultiplier *
              (action === 'attack' && enemyHexed ? relicArcaneMarkMultiplier(player) : 1),
            block: enemyBlock / (action === 'attack' ? relicGuardBreakMultiplier(player) : 1),
          },
        );
        const dealt = damageDealt(resultForAction);
        playerActions += 1;
        damagingActions += 1;
        attackCount += action === 'attack' ? 1 : 0;
        magicActions += action === 'magic' ? 1 : 0;
        damageDealtTotal += dealt;
        enemy = { ...enemy, damageTaken: resultForAction.damageTaken };
        enemyBlock = Math.max(0, enemyBlock - (resultForAction.blocked ?? 0));
        if (action === 'magic' && !resultForAction.missed && dealt > 0) {
          enemyHexed = true;
          hexesApplied += 1;
          playerBlock += relicMagicBlock(
            player,
            relicContext({
              magicActions: magicActions - 1,
              damagingActions: damagingActions - 1,
              playerActions: playerActions - 1,
            }),
          );
          enemyVenom += relicMagicVenom(player);
          relicFlags = { ...relicFlags, 'arcane-battery-used': true };
        }
        if (action === 'attack' && previousEnemyHexed) hexedAttacks += 1;
        if (action === 'attack' && previousEnemyHexed) enemyHexed = false;
        if (collectTrace) {
          trace.push(
            createTraceEvent(turn, 'player', action, player, playerDamageTaken, enemy, {
              damage: dealt,
              blocked: resultForAction.blocked,
              critical: resultForAction.critical,
              missed: resultForAction.missed,
            }),
          );
        }
        if (enemy.damageTaken >= enemy.stats.health) {
          result = 'win';
          break;
        }
      }

      actor = potionKeepsTurn ? 'player' : 'enemy';
      continue;
    }

    const venomAtTurnStart = enemyVenom;
    const startDamage = relicStartEnemyDamage(player) + venomAtTurnStart;
    enemyVenom = Math.max(0, venomAtTurnStart - (venomAtTurnStart > 0 ? 1 : 0));
    if (startDamage > 0) {
      enemy = {
        ...enemy,
        damageTaken: Math.min(enemy.stats.health, enemy.damageTaken + startDamage),
      };
      if (enemy.damageTaken >= enemy.stats.health) {
        result = 'win';
        break;
      }
    }

    intents[intent.kind] += 1;
    if (intent.kind === 'guard') {
      enemyBlock = guardBlockAmount(enemy.stats);
      if (collectTrace) {
        trace.push(
          createTraceEvent(turn, 'enemy', intent.kind, player, playerDamageTaken, enemy, {
            blocked: enemyBlock,
          }),
        );
      }
    } else if (intent.kind === 'heal') {
      const healResult = resolveHeal(enemy.damageTaken, enemy.stats.health);
      enemy = {
        ...enemy,
        damageTaken: healResult.damageTaken,
        potions: Math.max(0, enemy.potions - 1),
      };
      if (collectTrace) {
        trace.push(
          createTraceEvent(turn, 'enemy', intent.kind, player, playerDamageTaken, enemy, {
            healed: healResult.healed,
          }),
        );
      }
    } else {
      const resultForAction = resolveDamage(
        { stats: enemy.stats },
        { stats: player.stats, damageTaken: playerDamageTaken },
        intent.kind,
        { damageRoll: combatRandom(), chanceRoll: combatRandom() },
        {
          receivedDamageMultiplier: relicIncomingDamageMultiplier(player, relicContext()),
          block: playerBlock,
        },
      );
      const dealt = damageDealt(resultForAction);
      playerDamageTaken = resultForAction.damageTaken;
      playerBlock = Math.max(0, playerBlock - (resultForAction.blocked ?? 0));
      const blocked = resultForAction.blocked ?? 0;
      let reflected = 0;
      reflected += relicThornsDamage(player, blocked);
      reflected += relicCrownOfThornsDamage(player, blocked);
      enemyVenom += relicCrownOfThornsVenom(player, blocked);
      if (
        intent.kind === 'magic' &&
        dealt > 0 &&
        player.inventory.some((item) => item.id === 'mirror-of-night')
      ) {
        reflected += Math.trunc(dealt * 0.25);
      }
      if (reflected > 0) {
        enemy = {
          ...enemy,
          damageTaken: Math.min(enemy.stats.health, enemy.damageTaken + reflected),
        };
        damageDealtTotal += reflected;
      }
      const bloodHeal = relicBloodLedgerHeal(player, relicContext({ playerDamageTaken }));
      if (bloodHeal > 0 && !relicFlags['blood-ledger-used']) {
        playerDamageTaken = Math.max(0, playerDamageTaken - bloodHeal);
        relicFlags = { ...relicFlags, 'blood-ledger-used': true };
      }
      if (
        resultForAction.damageTaken >= player.stats.health &&
        relicLethalProtectionAvailable(player)
      ) {
        playerDamageTaken = Math.max(0, player.stats.health - 1);
        playerBlock += 30;
        player = { ...player, relicCharges: { ...player.relicCharges, 'phoenix-feather': 0 } };
      }
      enemyDamageActions += 1;
      damageTakenTotal += dealt;
      guardDamagePrevented += resultForAction.blocked ?? 0;
      if (collectTrace) {
        trace.push(
          createTraceEvent(turn, 'enemy', intent.kind, player, playerDamageTaken, enemy, {
            damage: dealt,
            blocked: resultForAction.blocked,
            critical: resultForAction.critical,
            missed: resultForAction.missed,
          }),
        );
      }
      if (playerDamageTaken >= player.stats.health) {
        result = 'loss';
        break;
      }
      if (enemy.damageTaken >= enemy.stats.health) {
        result = 'win';
        break;
      }
    }

    turn += 1;
    intent = chooseEnemyIntent(enemy, player.stats, combatRandom(), turn);
    actor = 'player';
  }

  return {
    result,
    turns: playerTurns,
    playerHealth: remainingHealth(player.stats, playerDamageTaken),
    playerPotions: player.potions,
    enemyHealth: remainingHealth(enemy.stats, enemy.damageTaken),
    potionsUsed,
    damageDealt: damageDealtTotal,
    damageTaken: damageTakenTotal,
    guardDamagePrevented,
    hexesApplied,
    hexedAttacks,
    actions,
    intents,
    seed: options.seed,
    trace,
  };
}

function percentile(values: readonly number[], ratio: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))] ?? 0;
}

function average(values: readonly number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function summarizeScenario(
  scenario: BalanceScenario,
  policyId: PlayerPolicyId,
  samples: number,
  seed: number,
  maxTurns: number,
): BalanceSummary {
  const player = playerForScenario(scenario);
  const enemy = enemyForScenario(player, scenario);
  const policy = PLAYER_POLICIES[policyId];
  const results: EncounterSimulationResult[] = [];

  for (let sample = 0; sample < samples; sample += 1) {
    const sampleSeed = hashSeed(seed, `${scenario.id}:${sample}`);
    results.push(
      simulateEncounter({
        player,
        enemy,
        seed: sampleSeed,
        policy,
        startingHealthRatio: scenario.startingHealthRatio,
        maxTurns,
        collectTrace: false,
      }),
    );
  }

  const wins = results.filter((result) => result.result === 'win').length;
  const losses = results.filter((result) => result.result === 'loss').length;
  const actionTotals = { ...EMPTY_ACTION_COUNTS };
  const intentTotals = { ...EMPTY_INTENT_COUNTS };
  results.forEach((result) => {
    SIMULATION_ACTIONS.forEach((action) => (actionTotals[action] += result.actions[action]));
    ENEMY_INTENTS.forEach((intent) => (intentTotals[intent] += result.intents[intent]));
  });
  const totalActions = Object.values(actionTotals).reduce((sum, value) => sum + value, 0);
  const totalIntents = Object.values(intentTotals).reduce((sum, value) => sum + value, 0);

  return {
    scenarioId: scenario.id,
    character: player.character.name,
    enemy: enemy.definition.name,
    enemyLevel: enemy.level,
    elite: Boolean(scenario.elite),
    policy: policyId,
    samples,
    wins,
    losses,
    draws: samples - wins - losses,
    winRate: wins / samples,
    averageTurns: average(results.map((result) => result.turns)),
    medianTurns: percentile(
      results.map((result) => result.turns),
      0.5,
    ),
    averageRemainingHealth: average(
      results.map((result) => percentage(result.playerHealth, player.stats.health)),
    ),
    averagePotionsUsed: average(results.map((result) => result.potionsUsed)),
    averageDamageDealt: average(results.map((result) => result.damageDealt)),
    averageDamageTaken: average(results.map((result) => result.damageTaken)),
    averageGuardDamagePrevented: average(results.map((result) => result.guardDamagePrevented)),
    averageHexesApplied: average(results.map((result) => result.hexesApplied)),
    actionRates: Object.fromEntries(
      SIMULATION_ACTIONS.map((action) => [
        action,
        totalActions ? actionTotals[action] / totalActions : 0,
      ]),
    ) as Readonly<Record<SimulationAction, number>>,
    intentRates: Object.fromEntries(
      ENEMY_INTENTS.map((intent) => [
        intent,
        totalIntents ? intentTotals[intent] / totalIntents : 0,
      ]),
    ) as Readonly<Record<EnemyIntentKind, number>>,
  };
}

export const DEFAULT_BALANCE_SCENARIOS: readonly BalanceScenario[] = CHARACTER_DEFINITIONS.flatMap(
  (character) =>
    ['adventurer', 'archer', 'evil-wizard', 'knight'].flatMap((enemyId) => [
      {
        id: `${character.id}-${enemyId}`,
        characterId: character.id,
        enemyId,
        enemyLevel: 4,
      },
      {
        id: `${character.id}-${enemyId}-elite`,
        characterId: character.id,
        enemyId,
        enemyLevel: 4,
        elite: true,
      },
    ]),
);

export interface BalanceReportOptions {
  readonly seed?: number;
  readonly samplesPerCell?: number;
  readonly maxTurns?: number;
  readonly policies?: readonly PlayerPolicyId[];
  readonly scenarios?: readonly BalanceScenario[];
}

export function runBalanceReport(options: BalanceReportOptions = {}): BalanceReport {
  const seed = options.seed ?? 42;
  const samplesPerCell = options.samplesPerCell ?? DEFAULT_SAMPLES;
  const maxTurns = options.maxTurns ?? DEFAULT_MAX_TURNS;
  const policies = options.policies ?? (Object.keys(PLAYER_POLICIES) as PlayerPolicyId[]);
  const scenarios = options.scenarios ?? DEFAULT_BALANCE_SCENARIOS;

  if (!Number.isSafeInteger(samplesPerCell) || samplesPerCell < 1) {
    throw new RangeError('Balance report samplesPerCell must be a positive safe integer.');
  }

  const summaries = scenarios.flatMap((scenario) =>
    policies.map((policy) => summarizeScenario(scenario, policy, samplesPerCell, seed, maxTurns)),
  );
  return { seed, samplesPerCell, maxTurns, summaries };
}

function fixed(value: number): string {
  return value.toFixed(2);
}

function percentLabel(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatBalanceReport(report: BalanceReport): string {
  const lines = [
    `Hexakill balance lab · ${report.samplesPerCell.toLocaleString()} samples/cell · seed ${report.seed}`,
    'Scenario                         Policy    Win     Turns  HP left  Potions  Guarded  Actions (A/M/G/P)',
  ];

  for (const summary of report.summaries) {
    const actions = summary.actionRates;
    lines.push(
      `${summary.scenarioId.padEnd(32)} ${summary.policy.padEnd(9)} ${percentLabel(summary.winRate).padStart(6)} ${fixed(summary.averageTurns).padStart(7)} ${percentLabel(summary.averageRemainingHealth).padStart(8)} ${fixed(summary.averagePotionsUsed).padStart(8)} ${fixed(summary.averageGuardDamagePrevented).padStart(8)} ${[
        actions.attack,
        actions.magic,
        actions.guard,
        actions.potion,
      ]
        .map(percentLabel)
        .join('/')}`,
    );
  }

  return lines.join('\n');
}

export function createSimulationFixture(scenario: BalanceScenario): {
  readonly player: PlayerState;
  readonly enemy: EnemyState;
} {
  const player = playerForScenario(scenario);
  return { player, enemy: enemyForScenario(player, scenario) };
}

export const simulationDefaults = {
  defaultMaxTurns: DEFAULT_MAX_TURNS,
  defaultSamples: DEFAULT_SAMPLES,
  actions: SIMULATION_ACTIONS,
  intents: ENEMY_INTENTS,
} as const;
