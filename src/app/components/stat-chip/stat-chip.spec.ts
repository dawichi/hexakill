import { TestBed } from '@angular/core/testing';
import { StatChipComponent } from './stat-chip';

describe('StatChipComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatChipComponent],
    }).compileComponents();
  });

  it('renders a labeled stat with its semantic icon and color class', async () => {
    const fixture = TestBed.createComponent(StatChipComponent);
    fixture.componentRef.setInput('stat', 'ap');
    fixture.componentRef.setInput('value', 2);
    fixture.componentRef.setInput('format', 'modifier');
    await fixture.whenStable();

    const chip = fixture.nativeElement.querySelector('.stat-chip') as HTMLElement;
    expect(chip.classList.contains('ap')).toBe(true);
    expect(chip.textContent).toContain('Magic');
    expect(chip.textContent).toContain('×2');
    expect(chip.getAttribute('aria-label')).toBe('Magic: ×2');
    expect(chip.querySelector('svg[lucideWandSparkles]')).toBeTruthy();
  });

  it('supports compact icon-to-value presentation without hiding its accessible label', async () => {
    const fixture = TestBed.createComponent(StatChipComponent);
    fixture.componentRef.setInput('stat', 'speed');
    fixture.componentRef.setInput('value', 1.5);
    fixture.componentRef.setInput('showLabel', false);
    await fixture.whenStable();

    const chip = fixture.nativeElement.querySelector('.stat-chip') as HTMLElement;
    expect(chip.textContent).not.toContain('Speed');
    expect(chip.textContent).toContain('1.5');
    expect(chip.getAttribute('aria-label')).toBe('Speed: 1.5');
    expect(chip.querySelector('svg[lucideFootprints]')).toBeTruthy();
  });
});
