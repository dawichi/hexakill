import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideHeartPulse, LucideShield, LucideSparkles } from '@lucide/angular';
import { StatChipComponent } from '../../../components/stat-chip/stat-chip';
import { ScreenBase } from '../../screen-base';
import { CombatFeedbackView } from '../feedback/combat-feedback';

@Component({
  selector: 'app-player-combatant',
  standalone: true,
  imports: [LucideHeartPulse, LucideShield, LucideSparkles, StatChipComponent, CombatFeedbackView],
  templateUrl: './player-combatant.html',
  styles: [':host { display: contents; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerCombatant extends ScreenBase {}
