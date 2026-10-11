import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideHeartPulse, LucideShield, LucideSword, LucideWandSparkles } from '@lucide/angular';
import type { CombatFeedback } from '../../../application/game-session.service';
import { ScreenBase } from '../../screen-base';

@Component({
  selector: 'app-combat-feedback',
  standalone: true,
  imports: [LucideHeartPulse, LucideShield, LucideSword, LucideWandSparkles],
  templateUrl: './combat-feedback.html',
  styles: [':host { display: contents; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CombatFeedbackView extends ScreenBase {
  readonly feedback = input.required<CombatFeedback>();
}
