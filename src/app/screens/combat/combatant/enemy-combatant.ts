import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideHeartPulse, LucideSparkles } from '@lucide/angular';
import { StatChipComponent } from '../../../components/stat-chip/stat-chip';
import { ScreenBase } from '../../screen-base';
import { CombatFeedbackView } from '../feedback/combat-feedback';
import { EnemyIntentBadge } from '../intent/enemy-intent';

@Component({
  selector: 'app-enemy-combatant',
  standalone: true,
  imports: [
    LucideHeartPulse,
    LucideSparkles,
    StatChipComponent,
    CombatFeedbackView,
    EnemyIntentBadge,
  ],
  templateUrl: './enemy-combatant.html',
  styles: [':host { display: contents; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnemyCombatant extends ScreenBase {}
