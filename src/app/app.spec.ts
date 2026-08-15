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
