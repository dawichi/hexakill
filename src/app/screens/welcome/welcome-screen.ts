import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  LucideArrowRight,
  LucideCircleHelp,
  LucideFootprints,
  LucideHeartPulse,
  LucideMap,
  LucideShield,
  LucideSparkles,
  LucideSword,
  LucideTrophy,
  LucideWandSparkles,
} from '@lucide/angular';
import { StatChipComponent } from '../../components/stat-chip/stat-chip';
import { ScreenBase } from '../screen-base';

@Component({
  selector: 'app-welcome-screen',
  standalone: true,
  imports: [
    LucideArrowRight,
    LucideCircleHelp,
    LucideFootprints,
    LucideHeartPulse,
    LucideMap,
    LucideShield,
    LucideSparkles,
    LucideSword,
    LucideTrophy,
    LucideWandSparkles,
    StatChipComponent,
  ],
  templateUrl: './welcome-screen.html',
  styles: [':host { display: contents; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeScreen extends ScreenBase {}
