import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  effect,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import {
  LucideHeartPulse,
  LucideShield,
  LucideSword,
  LucideTrophy,
  LucideWandSparkles,
} from '@lucide/angular';
import { ScreenBase } from '../screen-base';

@Component({
  selector: 'app-battle-banner',
  standalone: true,
  imports: [LucideHeartPulse, LucideShield, LucideSword, LucideTrophy, LucideWandSparkles],
  templateUrl: './battle-banner.html',
  styles: [':host { display: contents; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BattleBanner extends ScreenBase implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  protected readonly displayedCombatMessage = signal('');
  protected readonly combatMessageTyping = signal(false);
  private typewriterTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    super();
    effect(() => {
      this.session.textSpeed();
      this.animateCombatMessage(this.session.combatMessage());
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
    const speed = this.session.textSpeed();
    if (prefersReducedMotion || speed === 'instant') {
      this.displayedCombatMessage.set(message);
      return;
    }
    this.displayedCombatMessage.set('');
    this.combatMessageTyping.set(true);
    let characterIndex = 0;
    this.typewriterTimer = setInterval(
      () => {
        characterIndex += 1;
        this.displayedCombatMessage.set(message.slice(0, characterIndex));
        if (characterIndex >= message.length) this.stopCombatMessageAnimation();
      },
      speed === 'slow' ? 42 : 22,
    );
  }

  private stopCombatMessageAnimation(): void {
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }
    this.combatMessageTyping.set(false);
  }
}
