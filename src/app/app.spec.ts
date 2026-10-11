import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './app';
import { AUDIO, AudioPort } from './application/audio';
import { GameSessionService } from './application/game-session.service';
import { memoryStore, STORAGE } from './application/storage';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: STORAGE, useValue: memoryStore() },
        {
          provide: AUDIO,
          useValue: {
            playSound: () => undefined,
            playMusic: () => undefined,
            stopMusic: () => undefined,
            setVolumes: () => undefined,
          } satisfies AudioPort,
        },
      ],
    }).compileComponents();
  });

  it('renders the title and explains the combat loop', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Survive the dungeon');
    expect(compiled.querySelector('.guide-action-list')?.textContent).toContain('Guard');
    expect(compiled.querySelector('.how-to-play')?.textContent).toContain('Arcane mark');
    expect(compiled.querySelector('.guide-route-list')?.textContent).toContain('Campfire');
    expect(compiled.querySelector('.guide-route-list')?.textContent).toContain('Boss');
    expect(compiled.querySelector('.daily-challenge-button')?.textContent).toContain('challenge');
  });

  it('moves through character selection, the route map, and combat', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('.welcome-copy .primary-button')?.click();
    fixture.detectChanges();

    const name = compiled.querySelector<HTMLInputElement>('#player-name');
    if (!name) throw new Error('Name field was not rendered.');
    name.value = 'David';
    name.dispatchEvent(new Event('input'));
    compiled.querySelector<HTMLButtonElement>('.character-card')?.click();
    fixture.detectChanges();
    expect(compiled.querySelector('.character-passive')?.textContent).toContain('Spellweaver');
    expect(compiled.querySelector('.starting-stat-summary')?.textContent).toContain('800 Health');
    expect(compiled.querySelector('.starting-stat-summary')?.textContent).toContain('120 Magic');

    compiled.querySelector<HTMLButtonElement>('.selection-actions .primary-button')?.click();
    fixture.detectChanges();
    expect(compiled.querySelector('[data-screen="map"]')).toBeTruthy();
    expect(compiled.querySelectorAll('.door-card')).toHaveLength(3);
    expect(compiled.querySelectorAll('.expedition-layer')).toHaveLength(4);

    const session = TestBed.inject(GameSessionService);
    const encounter = session
      .routeMap()
      ?.nodes.find(
        (node) => node.kind === 'battle' || node.kind === 'elite' || node.kind === 'boss',
      );
    if (!encounter) throw new Error('Expected an encounter door.');
    session.chooseRouteNode(encounter.id);
    fixture.detectChanges();
    expect(compiled.querySelector('[data-screen="combat"]')).toBeTruthy();
    expect(compiled.querySelector('.action-button.attack')).toBeTruthy();
    expect(compiled.querySelector('.action-button.guard')).toBeTruthy();
    expect(compiled.querySelector('.action-button.attack')?.textContent).toContain('Preview');
    expect(compiled.querySelector('.action-button.guard')?.textContent).toContain(
      'until your next turn',
    );
  });

  it('maps the volume slider to the full gain range and exposes saved text speed', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLElement>('.settings-trigger')?.click();
    fixture.detectChanges();
    const music = compiled.querySelector<HTMLInputElement>('input[aria-label="Music volume"]');
    if (!music) throw new Error('Music volume control was not rendered.');
    expect(music.max).toBe('100');
    music.value = '100';
    music.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(
      compiled.querySelector('[aria-label="Music volume"]')?.getAttribute('aria-valuetext'),
    ).toBe('100 percent');
    expect(compiled.querySelector('select[aria-label="Combat text speed"]')).toBeTruthy();
  });

  it('uses a focus-contained exit dialog and returns to the run when canceled', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('.welcome-copy .primary-button')?.click();
    fixture.detectChanges();
    const name = compiled.querySelector<HTMLInputElement>('#player-name');
    if (!name) throw new Error('Name field was not rendered.');
    name.value = 'David';
    name.dispatchEvent(new Event('input'));
    compiled.querySelector<HTMLButtonElement>('.character-card')?.click();
    fixture.detectChanges();
    compiled.querySelector<HTMLButtonElement>('.selection-actions .primary-button')?.click();
    fixture.detectChanges();

    compiled.querySelector<HTMLButtonElement>('.exit-run-button')?.click();
    fixture.detectChanges();
    const dialog = compiled.querySelector<HTMLDialogElement>('.confirmation-dialog');
    expect(dialog?.open).toBe(true);
    compiled.querySelector<HTMLButtonElement>('.confirmation-actions .quiet-button')?.click();
    fixture.detectChanges();
    expect(dialog?.open).toBe(false);
    expect(compiled.querySelector('[data-screen="map"]')).toBeTruthy();
  });
});
