import { Component, computed, HostListener, input, signal } from '@angular/core';
import {
  LucideFootprints,
  LucideHeartPulse,
  LucideShield,
  LucideSparkles,
  LucideSword,
  LucideWandSparkles,
} from '@lucide/angular';
import { Stat } from '../../domain/game-types';

const STAT_LABELS: Record<Stat, string> = {
  health: 'Health',
  ad: 'Attack',
  ap: 'Magic',
  armor: 'Armor',
  mr: 'Magic resist',
  speed: 'Speed',
};

const STAT_DESCRIPTIONS: Record<Stat, string> = {
  health: 'Your remaining life. Reach zero and the run ends.',
  ad: 'Physical damage dealt by Attack.',
  ap: 'Magic damage dealt by Magic.',
  armor: 'Reduces physical damage received.',
  mr: 'Reduces magic damage received.',
  speed: 'Determines who acts first in an encounter.',
};

let nextTooltipId = 0;

@Component({
  selector: 'app-stat-chip',
  imports: [
    LucideFootprints,
    LucideHeartPulse,
    LucideShield,
    LucideSparkles,
    LucideSword,
    LucideWandSparkles,
  ],
  template: `
    <span
      class="stat-chip"
      [class]="'stat-chip ' + stat()"
      [class.tooltip-open]="tooltipOpen()"
      [class.tooltip-start]="tooltipAlign() === 'start'"
      [class.tooltip-end]="tooltipAlign() === 'end'"
      role="img"
      tabindex="0"
      [attr.aria-label]="label() + ': ' + valueLabel() + '. ' + description()"
      [attr.aria-describedby]="tooltipId"
      [attr.aria-expanded]="tooltipOpen()"
      (click)="toggleTooltip()"
      (keydown)="onKeydown($event)"
    >
      @switch (stat()) {
        @case ('health') {
          <svg lucideHeartPulse size="14" aria-hidden="true"></svg>
        }
        @case ('ad') {
          <svg lucideSword size="14" aria-hidden="true"></svg>
        }
        @case ('ap') {
          <svg lucideWandSparkles size="14" aria-hidden="true"></svg>
        }
        @case ('armor') {
          <svg lucideShield size="14" aria-hidden="true"></svg>
        }
        @case ('mr') {
          <svg lucideSparkles size="14" aria-hidden="true"></svg>
        }
        @case ('speed') {
          <svg lucideFootprints size="14" aria-hidden="true"></svg>
        }
      }
      @if (showLabel()) {
        <span>{{ label() }}</span>
      }
      <strong>{{ valueLabel() }}</strong>
      <span class="stat-tooltip" [id]="tooltipId" role="tooltip">
        <strong>{{ label() }}</strong>
        <span>{{ description() }}</span>
      </span>
    </span>
  `,
  styleUrl: './stat-chip.css',
})
export class StatChipComponent {
  readonly stat = input.required<Stat>();
  readonly value = input.required<number>();
  readonly showLabel = input(true);
  readonly format = input<'number' | 'modifier'>('number');
  readonly tooltipAlign = input<'center' | 'start' | 'end'>('center');
  protected readonly tooltipOpen = signal(false);
  protected readonly tooltipId = `stat-tooltip-${++nextTooltipId}`;

  protected readonly label = computed(() => STAT_LABELS[this.stat()]);
  protected readonly description = computed(() => STAT_DESCRIPTIONS[this.stat()]);
  protected readonly valueLabel = computed(() =>
    this.format() === 'modifier' ? `×${this.value()}` : this.value().toLocaleString(),
  );

  protected toggleTooltip(): void {
    this.tooltipOpen.update((open) => !open);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleTooltip();
    }
  }

  @HostListener('document:keydown.escape')
  protected closeTooltipWithEscape(): void {
    this.tooltipOpen.set(false);
  }
}
