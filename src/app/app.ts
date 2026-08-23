import {
  afterRenderEffect,
  Component,
  DOCUMENT,
  effect,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import {
  LucideArrowRight,
  LucideCheck,
  LucideCircleHelp,
  LucideFootprints,
  LucideHeartPulse,
  LucideMap,
  LucideMapPin,
  LucideScrollText,
  LucideShield,
  LucideSparkles,
  LucideStore,
  LucideSword,
  LucideSwords,
  LucideTentTree,
  LucideTrophy,
  LucideVolume2,
  LucideWandSparkles,
} from '@lucide/angular';
import { CombatFeedback, GameSessionService } from './application/game-session.service';
import { EnemyIntent } from './domain/combat-state';
import { StatChipComponent } from './components/stat-chip/stat-chip';
import { RelicIconComponent } from './components/relic-icon/relic-icon';
import { CharacterDefinition, ItemState, SpriteStripAsset, Stat, Stats } from './domain/game-types';
import { PersonalRecord } from './domain/records';

@Component({
  selector: 'app-root',
  imports: [
    LucideArrowRight,
    LucideCheck,
    LucideCircleHelp,
    LucideFootprints,
    LucideHeartPulse,
    LucideMap,
    LucideMapPin,
    LucideScrollText,
    LucideShield,
    LucideSparkles,
    LucideStore,
    LucideSword,
    LucideSwords,
    LucideTentTree,
    LucideTrophy,
    LucideVolume2,
    LucideWandSparkles,
    StatChipComponent,
    RelicIconComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnDestroy {
  protected readonly session = inject(GameSessionService);
  private readonly document = inject(DOCUMENT);
  protected readonly statKeys: readonly Stat[] = ['health', 'ad', 'ap', 'armor', 'mr', 'speed'];
  protected readonly displayedCombatMessage = signal('');
  protected readonly combatMessageTyping = signal(false);
  private typewriterTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    effect(() => {
      this.animateCombatMessage(this.session.combatMessage());
    });

    afterRenderEffect(() => {
      const screen = this.session.screen();
      const pendingPowerUps = this.session.player()?.powerUps.pending ?? 0;
      const selector =
        screen === 'combat' && pendingPowerUps > 0
          ? '[data-focus-target="power-up"]'
          : screen === 'combat' && pendingPowerUps === 0
            ? '[data-focus-target="route-map"]'
            : `[data-screen="${screen}"] [data-screen-heading]`;
      const target =
        this.document.querySelector<HTMLElement>(selector) ??
        this.document.querySelector<HTMLElement>(`[data-screen="${screen}"] [data-screen-heading]`);
      if (target && this.document.activeElement !== target) target.focus();
    });
  }

  ngOnDestroy(): void {
    this.stopCombatMessageAnimation();
  }

  private animateCombatMessage(message: string): void {
    this.stopCombatMessageAnimation();

    if (!message) {
      this.displayedCombatMessage.set('');
      return;
    }

    const view = this.document.defaultView;
    const prefersReducedMotion =
      typeof view?.matchMedia === 'function' &&
      view.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      this.displayedCombatMessage.set(message);
      return;
    }

    this.displayedCombatMessage.set('');
    this.combatMessageTyping.set(true);
    let characterIndex = 0;
    this.typewriterTimer = setInterval(() => {
      characterIndex += 1;
      this.displayedCombatMessage.set(message.slice(0, characterIndex));
      if (characterIndex >= message.length) {
        this.stopCombatMessageAnimation();
      }
    }, 22);
  }

  private stopCombatMessageAnimation(): void {
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }
    this.combatMessageTyping.set(false);
  }

  protected onNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.session.setPlayerName(input.value);
  }

  protected nameValidationMessage(): string {
    const name = this.session.playerName().trim();

    if (!name) return 'Enter a name to continue.';
    if (name.length < 3 || name.length > 14) {
      return 'Name must contain between 3 and 14 characters.';
    }

    return '';
  }

  protected nameValidationMessageId(): string | null {
    return this.nameValidationMessage() ? 'player-name-validation' : null;
  }

  protected feedbackClass(feedback: CombatFeedback): string {
    return `${feedback.target} ${feedback.kind} ${feedback.action ?? ''}`;
  }

  protected feedbackText(feedback: CombatFeedback): string {
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

  protected intentValue(intent: EnemyIntent): string {
    if (intent.minValue === intent.maxValue) return `${intent.maxValue}`;
    return `${intent.minValue}–${intent.maxValue}`;
  }

  protected selectCharacter(character: CharacterDefinition): void {
    this.session.selectCharacter(character);
  }

  protected setMusicVolume(event: Event): void {
    this.session.setMusicVolume(Number((event.target as HTMLInputElement).value));
  }

  protected setEffectsVolume(event: Event): void {
    this.session.setEffectsVolume(Number((event.target as HTMLInputElement).value));
  }

  protected volumeLabel(volume: number): string {
    return `${Math.round(volume * 100)} percent`;
  }

  protected recordCharacter(record: PersonalRecord): CharacterDefinition {
    return (
      this.session.characters.find((character) => character.id === record.characterId) ??
      this.session.characters[0]
    );
  }

  protected itemDescription(item: ItemState): string {
    return item.description;
  }

  protected spriteBackgroundSize(asset: SpriteStripAsset): string {
    return asset.orientation === 'vertical'
      ? `100% ${asset.frameCount * 100}%`
      : `${asset.frameCount * 100}% 100%`;
  }

  protected spriteAnimation(asset: SpriteStripAsset, duration: number): string {
    const animationName =
      asset.orientation === 'vertical' ? 'sprite-strip-play-vertical' : 'sprite-strip-play';
    return `${animationName} ${duration}ms steps(${asset.frameCount}) 1 both`;
  }

  protected combatStatValue(stats: Stats, stat: Stat, currentHealth?: number): number {
    return stat === 'health' && currentHealth !== undefined ? currentHealth : stats[stat];
  }

  protected healthTone(current: number, maximum: number): 'healthy' | 'wounded' | 'critical' {
    const ratio = maximum > 0 ? current / maximum : 0;
    if (ratio > 0.6) return 'healthy';
    if (ratio > 0.3) return 'wounded';
    return 'critical';
  }

  protected statHighlights(character: CharacterDefinition): ReadonlyArray<{
    stat: Stat;
    value: number;
  }> {
    return (['health', 'ad', 'ap', 'armor', 'mr', 'speed'] as Stat[])
      .map((stat) => ({ stat, value: character.modifiers[stat] }))
      .filter(({ value }) => value !== 1)
      .sort((left, right) => Math.abs(right.value - 1) - Math.abs(left.value - 1))
      .slice(0, 3);
  }
}
