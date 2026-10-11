import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideArrowRight, LucideMapPin } from '@lucide/angular';
import { ScreenBase } from '../screen-base';

@Component({
  selector: 'app-game-over-screen',
  standalone: true,
  imports: [LucideArrowRight, LucideMapPin],
  templateUrl: './game-over-screen.html',
  styles: [':host { display: contents; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameOverScreen extends ScreenBase {}
