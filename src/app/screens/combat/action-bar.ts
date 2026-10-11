import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideHeartPulse, LucideShield, LucideSword, LucideWandSparkles } from '@lucide/angular';
import { ScreenBase } from '../screen-base';

@Component({
  selector: 'app-action-bar',
  standalone: true,
  imports: [LucideHeartPulse, LucideShield, LucideSword, LucideWandSparkles],
  templateUrl: './action-bar.html',
  styles: [':host { display: contents; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionBar extends ScreenBase {}
