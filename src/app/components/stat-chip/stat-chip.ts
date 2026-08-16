import { Component, computed, input } from '@angular/core';
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
      role="img"
      [attr.tabindex]="showLabel() ? null : '0'"
      [attr.aria-label]="label() + ': ' + valueLabel() + '. ' + description()"
      [title]="label() + ': ' + description()"
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
    </span>
  `,
  styleUrl: './stat-chip.css',
})
export class StatChipComponent {
  readonly stat = input.required<Stat>();
  readonly value = input.required<number>();
  readonly showLabel = input(true);
  readonly format = input<'number' | 'modifier'>('number');

  protected readonly label = computed(() => STAT_LABELS[this.stat()]);
  protected readonly description = computed(() => STAT_DESCRIPTIONS[this.stat()]);
  protected readonly valueLabel = computed(() =>
    this.format() === 'modifier' ? `×${this.value()}` : this.value().toLocaleString(),
  );
}
