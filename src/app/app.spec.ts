import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { GameSessionService } from './application/game-session.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('starts on the welcome screen', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Survive the dungeon');
  });

  it('keeps the field manual visible with shared stat chips', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('details.how-to-play')).toBeNull();
    expect(compiled.querySelector('.how-to-play-content')).toBeTruthy();
    expect(compiled.querySelectorAll('.guide-stat-row app-stat-chip')).toHaveLength(6);
    expect(compiled.querySelector('.guide-action-list')?.textContent).toContain('Attack');
    expect(compiled.querySelector('.guide-action-list')?.textContent).toContain('Magic');
    expect(compiled.querySelector('.guide-action-list')?.textContent).toContain('Potion');
  });

  it('moves through character selection into the first door choice', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    compiled.querySelector<HTMLButtonElement>('.primary-button')?.click();
    fixture.detectChanges();

    const nameInput = compiled.querySelector<HTMLInputElement>('#player-name');
    if (!nameInput) throw new Error('Player name input was not rendered.');
    nameInput.value = 'David';
    nameInput.dispatchEvent(new Event('input'));
    compiled.querySelector<HTMLButtonElement>('.character-card')?.click();
    fixture.detectChanges();

    compiled.querySelector<HTMLButtonElement>('.primary-button')?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('[data-screen="map"]')).toBeTruthy();
    expect(compiled.querySelectorAll('.door-card')).toHaveLength(3);
    compiled.querySelector<HTMLButtonElement>('.door-card')?.click();
    fixture.detectChanges();
    expect(compiled.querySelector('[data-screen="combat"]')).toBeTruthy();
  });

  it('exposes name validation semantics before character selection', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    compiled.querySelector<HTMLButtonElement>('.primary-button')?.click();
    fixture.detectChanges();

    const nameInput = compiled.querySelector<HTMLInputElement>('#player-name');
    if (!nameInput) throw new Error('Player name input was not rendered.');
    expect(nameInput.required).toBe(true);
    expect(nameInput.getAttribute('aria-required')).toBe('true');
    expect(nameInput.getAttribute('aria-invalid')).toBe('true');
    expect(nameInput.getAttribute('aria-describedby')).toBe('player-name-validation');
    expect(compiled.querySelector('#player-name-validation')?.textContent).toContain(
      'Enter a name to continue',
    );

    nameInput.value = 'David';
    nameInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(nameInput.getAttribute('aria-invalid')).toBeNull();
    expect(nameInput.getAttribute('aria-describedby')).toBeNull();
    expect(compiled.querySelector('.validation')?.textContent).toContain(
      'Choose a character to continue',
    );
  });

  it('exposes labeled groups for character, combat, and store controls', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    compiled.querySelector<HTMLButtonElement>('.primary-button')?.click();
    fixture.detectChanges();
    expect(compiled.querySelector('[role="group"][aria-label="Available champions"]')).toBeTruthy();

    const nameInput = compiled.querySelector<HTMLInputElement>('#player-name');
    if (!nameInput) throw new Error('Player name input was not rendered.');
    nameInput.value = 'David';
    nameInput.dispatchEvent(new Event('input'));
    compiled.querySelector<HTMLButtonElement>('.character-card')?.click();
    fixture.detectChanges();
    compiled.querySelector<HTMLButtonElement>('.primary-button')?.click();
    fixture.detectChanges();

    const session = TestBed.inject(GameSessionService);
    session.combatState.update((state) => ({
      ...state,
      phase: 'victory',
      enemy: state.enemy ? { ...state.enemy, damageTaken: state.enemy.stats.health } : null,
    }));
    session.routeMap.set({
      floor: 1,
      nodes: [
        {
          id: 'store-node',
          kind: 'store',
          title: 'Merchant',
          description: 'Trade your gold.',
          reward: 'Shop',
        },
        {
          id: 'battle-node',
          kind: 'battle',
          title: 'Skirmish',
          description: 'Fight.',
          reward: 'Gold',
        },
        {
          id: 'rest-node',
          kind: 'rest',
          title: 'Campfire',
          description: 'Rest.',
          reward: 'Health',
        },
      ],
    });
    session.openRouteMap();
    fixture.detectChanges();

    expect(compiled.querySelector('[data-screen="map"]')).toBeTruthy();
    expect(compiled.querySelector('[data-screen="combat"] .button-row')).toBeNull();
    const storeButton = compiled.querySelector<HTMLButtonElement>('.route-node.store');
    storeButton?.click();
    fixture.detectChanges();
    expect(compiled.querySelector('[role="group"][aria-label="Potion offers"]')).toBeTruthy();
    expect(compiled.querySelector('[role="group"][aria-label="Relic offers"]')).toBeTruthy();

    const closeStoreButton = Array.from(
      compiled.querySelectorAll<HTMLButtonElement>('.quiet-button'),
    ).find((button) => button.textContent?.includes('Close store'));
    closeStoreButton?.click();
    fixture.detectChanges();
    expect(compiled.querySelector('[data-screen="map"]')).toBeTruthy();
  });

  it('moves from a ready run into combat with a generated enemy', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    compiled.querySelector<HTMLButtonElement>('.primary-button')?.click();
    fixture.detectChanges();
    const nameInput = compiled.querySelector<HTMLInputElement>('#player-name');
    if (!nameInput) throw new Error('Player name input was not rendered.');
    nameInput.value = 'David';
    nameInput.dispatchEvent(new Event('input'));
    compiled.querySelector<HTMLButtonElement>('.character-card')?.click();
    fixture.detectChanges();
    compiled.querySelector<HTMLButtonElement>('.primary-button')?.click();
    fixture.detectChanges();
    compiled.querySelector<HTMLButtonElement>('.door-card')?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('[data-screen="combat"]')).toBeTruthy();
    expect(compiled.querySelector('.action-button.attack')).toBeTruthy();
    expect(compiled.querySelector('.action-button.magic')).toBeTruthy();
  });
});
