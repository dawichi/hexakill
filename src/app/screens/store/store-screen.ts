import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideHeartPulse } from '@lucide/angular';
import { RelicIconComponent } from '../../components/relic-icon/relic-icon';
import { ScreenBase } from '../screen-base';

@Component({
  selector: 'app-store-screen',
  standalone: true,
  imports: [LucideHeartPulse, RelicIconComponent],
  templateUrl: './store-screen.html',
  styles: [':host { display: contents; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreScreen extends ScreenBase {}
