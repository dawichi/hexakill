import { Directive, inject } from '@angular/core';
import type {
  CharacterView,
  CombatFeedback,
  EnemyIntentView,
  PlayerView,
  RouteNodeView,
} from '../application/game-session.service';
import { GameSessionService } from '../application/game-session.service';
import { CharacterDefinition } from '../domain/characters';
import { DamageKind, STAT_KEYS, Stat } from '../domain/game-types';
import { PowerUpType } from '../domain/player';
import { PersonalRecord } from '../domain/records';
import { RelicView } from '../domain/relics';
import { RouteNodeKind } from '../domain/route-map';
import {
  combatStatValue,
  damageRangeLabel,
  feedbackClass,
  feedbackPlacementClass,
  feedbackText,
  healthTone,
  intentSummary,
  itemDescription,
  powerUpValue,
  recordCharacter,
  routeForecast,
  routeKindLabel,
  routeRiskLabel,
  spriteAnimation,
  spriteBackgroundSize,
  statHighlights,
} from '../ui/format';

@Directive()
export abstract class ScreenBase {
  protected readonly session = inject(GameSessionService);
  protected readonly statKeys: readonly Stat[] = STAT_KEYS;

  protected onNameInput(event: Event): void {
    this.session.setPlayerName((event.target as HTMLInputElement).value);
  }

  protected nameValidationMessage(): string {
    return this.session.validationMessage();
  }

  protected nameValidationMessageId(): string | null {
    return this.nameValidationMessage() ? 'player-name-validation' : null;
  }

  protected selectCharacter(character: CharacterView): void {
    this.session.selectCharacter(character);
  }

  protected feedbackClass(feedback: CombatFeedback): string {
    return feedbackClass(feedback);
  }

  protected feedbackPlacementClass(feedback: CombatFeedback): string {
    return feedbackPlacementClass(feedback);
  }

  protected feedbackText(feedback: CombatFeedback): string {
    return feedbackText(feedback);
  }

  protected intentSummary(intent: EnemyIntentView): string {
    return intentSummary(intent);
  }

  protected damagePreview(kind: DamageKind): string {
    return damageRangeLabel(this.session.playerDamageRanges()[kind]);
  }

  protected recordCharacter(record: PersonalRecord): CharacterView {
    return recordCharacter(this.session.characters, record);
  }

  protected itemDescription(item: RelicView): string {
    return itemDescription(item);
  }

  protected powerUpValue(player: PlayerView, type: PowerUpType): number {
    return powerUpValue(player, type);
  }

  protected spriteBackgroundSize(asset: Parameters<typeof spriteBackgroundSize>[0]): string {
    return spriteBackgroundSize(asset);
  }

  protected spriteAnimation(
    asset: Parameters<typeof spriteAnimation>[0],
    duration: number,
  ): string {
    return spriteAnimation(asset, duration);
  }

  protected combatStatValue(
    stats: Parameters<typeof combatStatValue>[0],
    stat: Stat,
    currentHealth?: number,
  ): number {
    return combatStatValue(stats, stat, currentHealth);
  }

  protected healthTone(current: number, maximum: number): ReturnType<typeof healthTone> {
    return healthTone(current, maximum);
  }

  protected statHighlights(character: CharacterDefinition): ReturnType<typeof statHighlights> {
    return statHighlights(character);
  }

  protected routeKindLabel(kind: RouteNodeKind): string {
    return routeKindLabel(kind);
  }

  protected routeForecast(node: RouteNodeView): string {
    return routeForecast(node);
  }

  protected routeRiskLabel(node: RouteNodeView): string {
    return routeRiskLabel(node);
  }
}
