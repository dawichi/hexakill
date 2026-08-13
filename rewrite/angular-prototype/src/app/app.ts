import { Component, inject } from '@angular/core';
import { GameSessionService } from './application/game-session.service';
import { CharacterDefinition } from './domain/game-types';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly session = inject(GameSessionService);
  protected readonly statLabels = [
    ['health', 'Health'],
    ['ad', 'Attack'],
    ['ap', 'Magic'],
    ['armor', 'Armor'],
    ['mr', 'Magic resist'],
    ['speed', 'Speed'],
  ] as const;

  protected onNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.session.setPlayerName(input.value);
  }

  protected selectCharacter(character: CharacterDefinition): void {
    this.session.selectCharacter(character);
  }
}
