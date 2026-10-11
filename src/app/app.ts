import {
  afterRenderEffect,
  Component,
  DOCUMENT,
  ElementRef,
  HostListener,
  inject,
  signal,
  ViewEncapsulation,
  viewChild,
} from '@angular/core';
import { LucideDoorOpen, LucideLogOut, LucideTriangleAlert, LucideVolume2 } from '@lucide/angular';
import { GameSessionService } from './application/game-session.service';
import { TextSpeed } from './domain/preferences';
import { CharacterSelectScreen } from './screens/character-select/character-select-screen';
import { CombatScreen } from './screens/combat/combat-screen';
import { GameOverScreen } from './screens/game-over/game-over-screen';
import { RouteMapScreen } from './screens/route-map/route-map-screen';
import { RunCompleteScreen } from './screens/run-complete/run-complete-screen';
import { StoreScreen } from './screens/store/store-screen';
import { WelcomeScreen } from './screens/welcome/welcome-screen';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    LucideDoorOpen,
    LucideLogOut,
    LucideTriangleAlert,
    LucideVolume2,
    CharacterSelectScreen,
    CombatScreen,
    GameOverScreen,
    RouteMapScreen,
    RunCompleteScreen,
    StoreScreen,
    WelcomeScreen,
  ],
  templateUrl: './app.html',
  encapsulation: ViewEncapsulation.None,
})
export class App {
  protected readonly session = inject(GameSessionService);
  private readonly document = inject(DOCUMENT);
  private readonly exitDialog = viewChild<ElementRef<HTMLDialogElement>>('exitDialog');
  protected readonly exitConfirmationOpen = signal(false);

  constructor() {
    afterRenderEffect(() => {
      const dialog = this.exitDialog()?.nativeElement;
      if (this.exitConfirmationOpen()) {
        if (dialog && !dialog.open) {
          if (typeof dialog.showModal === 'function') dialog.showModal();
          else dialog.setAttribute('open', '');
        }
        return;
      }
      if (dialog?.open) {
        if (typeof dialog.close === 'function') dialog.close();
        else dialog.removeAttribute('open');
      }
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

  protected requestExitRun(): void {
    if (this.session.screen() === 'welcome' || this.session.screen() === 'game-over') return;
    this.exitConfirmationOpen.set(true);
  }

  protected cancelExitRun(): void {
    this.exitConfirmationOpen.set(false);
  }

  protected confirmExitRun(): void {
    this.exitConfirmationOpen.set(false);
    this.session.reset();
  }

  protected setMusicVolume(event: Event): void {
    this.session.setMusicVolume(Number((event.target as HTMLInputElement).value));
  }

  protected setEffectsVolume(event: Event): void {
    this.session.setEffectsVolume(Number((event.target as HTMLInputElement).value));
  }

  protected volumeLabel(volume: number): string {
    return `${Math.round(volume)} percent`;
  }

  protected setTextSpeed(event: Event): void {
    this.session.setTextSpeed((event.target as HTMLSelectElement).value as TextSpeed);
  }

  @HostListener('document:keydown', ['$event'])
  protected handleKeyboardShortcuts(event: KeyboardEvent): void {
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target;
    if (
      target instanceof HTMLElement &&
      target.closest('input, select, textarea, [contenteditable="true"]')
    )
      return;
    if (event.key.toLowerCase() === 'm') {
      this.session.toggleMuted();
      return;
    }
    if (this.session.isPresenting() && (event.key === ' ' || event.key === 'Enter')) {
      if (target instanceof HTMLElement && target.closest('button, a')) return;
      event.preventDefault();
      this.session.skipPresentation();
      return;
    }
    if (!this.session.canAct()) return;
    switch (event.key) {
      case '1':
        this.session.attack('attack');
        break;
      case '2':
        this.session.attack('magic');
        break;
      case '3':
        this.session.guard();
        break;
      case '4':
        this.session.usePotion();
        break;
      default:
        return;
    }
    event.preventDefault();
  }
}
