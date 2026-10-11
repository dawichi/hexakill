import { describe, expect, it } from 'vitest';
import type { CombatFeedback, EnemyIntentView } from '../application/game-session.service';
import { CHARACTERS } from '../domain/characters';
import { STAT_KEYS } from '../domain/game-types';
import {
  combatStatValue,
  damageRangeLabel,
  feedbackClass,
  feedbackPlacementClass,
  feedbackText,
  healthTone,
  intentSummary,
  routeForecast,
  routeKindLabel,
  routeRiskLabel,
  spriteAnimation,
  spriteBackgroundSize,
  statHighlights,
} from './format';

describe('presentation formatting', () => {
  it('formats combat feedback and intent previews', () => {
    const feedback: CombatFeedback = {
      id: 4,
      target: 'enemy',
      kind: 'critical',
      amount: 23,
      action: 'attack',
    };
    const intent: EnemyIntentView = {
      kind: 'attack',
      label: 'Heavy strike',
      minValue: 8,
      maxValue: 12,
      hits: 2,
      multiplier: 1.5,
    };

    expect(feedbackClass(feedback)).toBe('enemy critical attack');
    expect(feedbackPlacementClass(feedback)).toBe('placement-center');
    expect(feedbackText(feedback)).toBe('CRIT! -23');
    expect(intentSummary(intent)).toBe('Heavy strike · physical damage · 8–12 per hit × 2');
    expect(damageRangeLabel([17, 17])).toBe('17');
    expect(damageRangeLabel([12, 19])).toBe('12–19');
  });

  it('formats sprite strips, health, and stat values', () => {
    const strip = { src: '/strip.png', frameWidth: 24, frameHeight: 32, frameCount: 6 };
    const vertical = { ...strip, orientation: 'vertical' as const };
    expect(spriteBackgroundSize(strip)).toBe('600% 100%');
    expect(spriteBackgroundSize(vertical)).toBe('100% 600%');
    expect(spriteAnimation(vertical, 900)).toBe('sprite-strip-play-vertical 900ms steps(6) 1 both');
    expect(healthTone(61, 100)).toBe('healthy');
    expect(healthTone(60, 100)).toBe('wounded');
    expect(healthTone(30, 100)).toBe('critical');
    expect(healthTone(0, 0)).toBe('critical');
    expect(
      combatStatValue({ health: 80, ad: 1, ap: 1, armor: 1, mr: 1, speed: 1 }, 'health', 50),
    ).toBe(50);
  });

  it('picks class-specific modifiers and route labels from lookup tables', () => {
    const highlights = statHighlights(CHARACTERS[0]);
    expect(highlights.map(({ stat }) => stat)).toEqual(['ap', 'ad', 'armor']);
    expect(highlights.every(({ stat }) => STAT_KEYS.includes(stat))).toBe(true);
    expect(routeKindLabel('store')).toBe('Merchant');
    expect(routeForecast({ kind: 'battle', nextKinds: ['rest', 'store'] })).toBe(
      'Ahead: Campfire · Merchant',
    );
    expect(routeForecast({ kind: 'boss', nextKinds: [] })).toBe('The run ends beyond this fight');
    expect(routeRiskLabel({ risk: 'dangerous' })).toBe('High risk');
  });
});
