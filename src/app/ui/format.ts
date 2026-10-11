import type {
  CharacterView,
  CombatFeedback,
  EnemyIntentView,
  PlayerView,
  RouteNodeView,
} from '../application/game-session.service';
import { CharacterDefinition } from '../domain/characters';
import { SpriteStripAsset, STAT_KEYS, Stat, Stats } from '../domain/game-types';
import { nextPowerUpValue, PowerUpType } from '../domain/player';
import { PersonalRecord } from '../domain/records';
import type { RelicView } from '../domain/relics';
import { RouteNodeKind } from '../domain/route-map';

const ROUTE_KIND_LABEL: Readonly<Record<RouteNodeKind, string>> = {
  battle: 'Skirmish',
  elite: 'Elite',
  store: 'Merchant',
  rest: 'Campfire',
  boss: 'Boss',
};

const ROUTE_RISK_LABEL: Readonly<Record<RouteNodeView['risk'], string>> = {
  safe: 'Low risk',
  steady: 'Steady risk',
  dangerous: 'High risk',
  milestone: 'Milestone',
};

export function feedbackClass(feedback: CombatFeedback): string {
  return `${feedback.target} ${feedback.kind} ${feedback.action ?? ''}`;
}

export function feedbackPlacementClass(feedback: CombatFeedback): string {
  const placements = ['placement-left', 'placement-center', 'placement-right'] as const;
  return placements[feedback.id % placements.length] ?? 'placement-center';
}

export function feedbackText(feedback: CombatFeedback): string {
  switch (feedback.kind) {
    case 'damage':
      return `-${feedback.amount ?? 0}`;
    case 'critical':
      return `CRIT! -${feedback.amount ?? 0}`;
    case 'miss':
      return 'MISS';
    case 'blocked':
      return `BLOCKED ${feedback.amount ?? 0}`;
    case 'heal':
      return `+${feedback.amount ?? 0}`;
    case 'guard':
      return `GUARD +${feedback.amount ?? 0}`;
    case 'hex':
      return 'HEXED';
  }
}

export function intentSummary(intent: EnemyIntentView): string {
  const title = intent.label ?? `${intent.kind.slice(0, 1).toUpperCase()}${intent.kind.slice(1)}`;
  const value =
    intent.minValue === intent.maxValue
      ? `${intent.maxValue}`
      : `${intent.minValue}–${intent.maxValue}`;
  switch (intent.kind) {
    case 'attack':
    case 'magic':
      return `${title} · ${intent.kind === 'attack' ? 'physical' : 'magic'} damage · ${value} per hit${intent.hits > 1 ? ` × ${intent.hits}` : ''}`;
    case 'guard':
      return `${title} · gains ${value} Block`;
    case 'heal':
      return `${title} · restores ${value} Health`;
    case 'charge':
      return `${title} · prepares a powerful attack for next turn`;
  }
}

export function damageRangeLabel(range: readonly [number, number]): string {
  const [minimum, maximum] = range;
  return minimum === maximum ? `${minimum}` : `${minimum}–${maximum}`;
}

export function recordCharacter(
  characters: readonly CharacterView[],
  record: PersonalRecord,
): CharacterView {
  const firstCharacter = characters[0];
  if (!firstCharacter) throw new Error('At least one character must be configured.');
  return characters.find((character) => character.id === record.characterId) ?? firstCharacter;
}

export function itemDescription(item: RelicView): string {
  return item.description;
}

export function powerUpValue(player: PlayerView, type: PowerUpType): number {
  return nextPowerUpValue(player, type) ?? 0;
}

export function spriteBackgroundSize(asset: SpriteStripAsset): string {
  return asset.orientation === 'vertical'
    ? `100% ${asset.frameCount * 100}%`
    : `${asset.frameCount * 100}% 100%`;
}

export function spriteAnimation(asset: SpriteStripAsset, duration: number): string {
  const animationName =
    asset.orientation === 'vertical' ? 'sprite-strip-play-vertical' : 'sprite-strip-play';
  return `${animationName} ${duration}ms steps(${asset.frameCount}) 1 both`;
}

export function combatStatValue(stats: Stats, stat: Stat, currentHealth?: number): number {
  return stat === 'health' && currentHealth !== undefined ? currentHealth : stats[stat];
}

export function healthTone(current: number, maximum: number): 'healthy' | 'wounded' | 'critical' {
  const ratio = maximum > 0 ? current / maximum : 0;
  if (ratio > 0.6) return 'healthy';
  if (ratio > 0.3) return 'wounded';
  return 'critical';
}

export function statHighlights(
  character: CharacterDefinition,
): ReadonlyArray<{ stat: Stat; value: number }> {
  return STAT_KEYS.map((stat) => ({ stat, value: character.modifiers[stat] }))
    .filter(({ value }) => value !== 1)
    .sort((left, right) => Math.abs(right.value - 1) - Math.abs(left.value - 1))
    .slice(0, 3);
}

export function routeKindLabel(kind: RouteNodeKind): string {
  return ROUTE_KIND_LABEL[kind];
}

export function routeForecast(node: Pick<RouteNodeView, 'kind' | 'nextKinds'>): string {
  const kinds = [...new Set(node.nextKinds ?? [])];
  if (!kinds.length)
    return node.kind === 'boss' ? 'The run ends beyond this fight' : 'The way ahead is obscured';
  if (kinds.length === 1) {
    const nextKind = kinds[0];
    if (nextKind) return `Next: ${routeKindLabel(nextKind)}`;
  }
  return `Ahead: ${kinds.map(routeKindLabel).join(' · ')}`;
}

export function routeRiskLabel(node: Pick<RouteNodeView, 'risk'>): string {
  return ROUTE_RISK_LABEL[node.risk];
}
