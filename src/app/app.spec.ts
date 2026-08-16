import { TestBed } from '@angular/core/testing';
import { App } from './app';

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

  it('provides a keyboard skip link to the game content landmark', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    const skipLink = compiled.querySelector<HTMLAnchorElement>('.skip-link');
    const main = compiled.querySelector<HTMLElement>('#game-content');
    expect(skipLink?.getAttribute('href')).toBe('#game-content');
    expect(main?.getAttribute('tabindex')).toBe('-1');
  });

  it('moves through character selection into a ready run', async () => {
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

    expect(compiled.querySelector('h2')?.textContent).toContain('Welcome, David');
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

    const storeButton = Array.from(
      compiled.querySelectorAll<HTMLButtonElement>('.quiet-button'),
    ).find((button) => button.textContent?.includes('Store'));
    storeButton?.click();
    fixture.detectChanges();
    expect(compiled.querySelector('[role="group"][aria-label="Potion offers"]')).toBeTruthy();
    expect(compiled.querySelector('[role="group"][aria-label="Equipment offers"]')).toBeTruthy();

    const closeStoreButton = Array.from(
      compiled.querySelectorAll<HTMLButtonElement>('.quiet-button'),
    ).find((button) => button.textContent?.includes('Close store'));
    closeStoreButton?.click();
    fixture.detectChanges();
    compiled.querySelector<HTMLButtonElement>('.primary-button')?.click();
    fixture.detectChanges();
    expect(compiled.querySelector('[role="group"][aria-label="Combat actions"]')).toBeTruthy();
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

    const findEnemyButton = Array.from(compiled.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Find an enemy'),
    );
    findEnemyButton?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('h2')?.textContent).toContain('appears');
    expect(compiled.querySelector('.action-button.attack')).toBeTruthy();
    expect(compiled.querySelector('.action-button.magic')).toBeTruthy();
  });
});
