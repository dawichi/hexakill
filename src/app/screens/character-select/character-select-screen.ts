import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  LucideArrowRight,
  LucideCheck,
  LucideScrollText,
  LucideShield,
  LucideSwords,
  LucideWandSparkles,
} from '@lucide/angular';
import { StatChipComponent } from '../../components/stat-chip/stat-chip';
import { ScreenBase } from '../screen-base';

@Component({
  selector: 'app-character-select-screen',
  standalone: true,
  imports: [
    LucideArrowRight,
    LucideCheck,
    LucideScrollText,
    LucideShield,
    LucideSwords,
    LucideWandSparkles,
    StatChipComponent,
  ],
  templateUrl: './character-select-screen.html',
  styles: [':host { display: contents; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterSelectScreen extends ScreenBase {}
