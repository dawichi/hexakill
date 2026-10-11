import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ScreenBase } from '../screen-base';
import { ActionBar } from './action-bar';
import { BattleBanner } from './battle-banner';
import { EnemyCombatant } from './combatant/enemy-combatant';
import { PlayerCombatant } from './combatant/player-combatant';
import { CombatInventory } from './inventory';
import { PowerUpPicker } from './power-up-picker';

@Component({
  selector: 'app-combat-screen',
  standalone: true,
  imports: [
    ActionBar,
    BattleBanner,
    CombatInventory,
    EnemyCombatant,
    PlayerCombatant,
    PowerUpPicker,
  ],
  templateUrl: './combat-screen.html',
  styles: [':host { display: contents; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CombatScreen extends ScreenBase {}
