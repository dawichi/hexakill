import { MusicTrack } from '../domain/assets';
import { findEnemyDefinition } from '../domain/enemies';
import { RunState } from '../domain/run';
import { GameScreen } from './session-view-model';

const SCREEN_MUSIC: Readonly<Record<GameScreen, MusicTrack | null>> = {
  welcome: 'welcome',
  'character-select': 'characterSelect',
  map: 'dungeon',
  combat: null,
  store: 'store',
  'game-over': null,
  'run-complete': null,
};

export function musicForScreen(screen: GameScreen, run: RunState | null): MusicTrack | null {
  if (screen === 'combat') {
    return run?.combat && findEnemyDefinition(run.combat.enemy.id).archetype === 'boss'
      ? 'boss'
      : 'dungeon';
  }
  return SCREEN_MUSIC[screen];
}
