import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  LucideHeartPulse,
  LucideShield,
  LucideSword,
  LucideSwords,
  LucideWandSparkles,
} from '@lucide/angular';
import type { EnemyIntentView } from '../../../application/game-session.service';
import { ScreenBase } from '../../screen-base';

@Component({
  selector: 'app-enemy-intent',
  standalone: true,
  imports: [LucideHeartPulse, LucideShield, LucideSword, LucideSwords, LucideWandSparkles],
  templateUrl: './enemy-intent.html',
  styles: [':host { display: contents; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnemyIntentBadge extends ScreenBase {
  readonly intent = input.required<EnemyIntentView>();
}
