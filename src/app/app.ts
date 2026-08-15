import { Component, inject } from '@angular/core';
import { GameSessionService } from './application/game-session.service';
import { CharacterDefinition, ItemState } from './domain/game-types';
import { PersonalRecord } from './domain/records';

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

  protected setMusicVolume(event: Event): void {
    this.session.setMusicVolume(Number((event.target as HTMLInputElement).value));
  }

  protected setEffectsVolume(event: Event): void {
    this.session.setEffectsVolume(Number((event.target as HTMLInputElement).value));
  }

  protected recordCharacter(record: PersonalRecord): CharacterDefinition {
    return (
      this.session.characters.find((character) => character.id === record.characterId) ??
      this.session.characters[0]
    );
  }

  protected itemBonusLabel(item: ItemState): string {
    return Object.entries(item.bonus)
      .filter(([, value]) => value !== 0)
      .map(([stat, value]) => `+${value} ${stat.toUpperCase()}`)
      .join(' · ');
  }
}
