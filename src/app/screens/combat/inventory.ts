import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RelicIconComponent } from '../../components/relic-icon/relic-icon';
import { ScreenBase } from '../screen-base';

@Component({
  selector: 'app-combat-inventory',
  standalone: true,
  imports: [RelicIconComponent],
  templateUrl: './inventory.html',
  styles: [':host { display: contents; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CombatInventory extends ScreenBase {}
