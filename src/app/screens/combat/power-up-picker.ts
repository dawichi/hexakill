import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  LucideFootprints,
  LucideHeartPulse,
  LucideMap,
  LucideShield,
  LucideSparkles,
  LucideSword,
  LucideWandSparkles,
} from '@lucide/angular';
import { ScreenBase } from '../screen-base';

@Component({
  selector: 'app-power-up-picker',
  standalone: true,
  imports: [
    LucideFootprints,
    LucideHeartPulse,
    LucideMap,
    LucideShield,
    LucideSparkles,
    LucideSword,
    LucideWandSparkles,
  ],
  templateUrl: './power-up-picker.html',
  styles: [':host { display: contents; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PowerUpPicker extends ScreenBase {}
