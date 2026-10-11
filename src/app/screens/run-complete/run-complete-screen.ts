import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideArrowRight, LucideTrophy } from '@lucide/angular';
import { ScreenBase } from '../screen-base';

@Component({
  selector: 'app-run-complete-screen',
  standalone: true,
  imports: [LucideArrowRight, LucideTrophy],
  templateUrl: './run-complete-screen.html',
  styles: [':host { display: contents; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RunCompleteScreen extends ScreenBase {}
