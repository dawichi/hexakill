import { DOCUMENT } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  signal,
} from '@angular/core';
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
  ad: 'Power for physical strikes.',
  ap: 'Power for spell damage.',
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
      [attr.aria-label]="label() + ': ' + valueLabel() + '. ' + description() + ' ' + detailText()"
      [attr.aria-describedby]="tooltipId"
      [attr.aria-expanded]="tooltipOpen()"
      (mouseenter)="positionTooltip()"
      (focus)="positionTooltip()"
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
      <span
        class="stat-tooltip"
        [class.tooltip-above]="tooltipAbove()"
        [style.left.px]="tooltipLeft()"
        [style.top.px]="tooltipTop()"
        [id]="tooltipId"
        role="tooltip"
      >
        <strong>{{ label() }}</strong>
        <span>{{ description() }}</span>
        @if (format() === 'modifier') {
          <span class="stat-tooltip-detail"
            >Modifier: <strong class="stat-tooltip-value">{{ valueLabel() }}</strong> to this
            character's base {{ label() }}.</span
          >
        } @else {
          @switch (stat()) {
            @case ('health') {
              <span class="stat-tooltip-detail"
                >The run ends when <strong class="stat-tooltip-keyword">Health</strong> reaches
                <strong class="stat-tooltip-value">0</strong>.</span
              >
            }
            @case ('ad') {
              <span class="stat-tooltip-detail"
                >Deals <strong class="stat-tooltip-value">{{ damageRange() }}</strong> raw damage
                before <strong class="stat-tooltip-keyword">Armor</strong>.</span
              >
            }
            @case ('ap') {
              <span class="stat-tooltip-detail"
                >Deals <strong class="stat-tooltip-value">{{ damageRange() }}</strong> raw damage
                before <strong class="stat-tooltip-keyword">Magic resist</strong>.</span
              >
            }
            @case ('armor') {
              <span class="stat-tooltip-detail"
                >Reduces physical damage by about
                <strong class="stat-tooltip-value">{{ reductionPercent() }}%</strong>.</span
              >
            }
            @case ('mr') {
              <span class="stat-tooltip-detail"
                >Reduces magic damage by about
                <strong class="stat-tooltip-value">{{ reductionPercent() }}%</strong>.</span
              >
            }
            @case ('speed') {
              <span class="stat-tooltip-detail"
                >Higher <strong class="stat-tooltip-keyword">Speed</strong> acts first; ties favor
                the foe.</span
              >
            }
          }
        }
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
  protected readonly tooltipLeft = signal(12);
  protected readonly tooltipTop = signal(12);
  protected readonly tooltipAbove = signal(false);
  private readonly document = inject(DOCUMENT);
  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly label = computed(() => STAT_LABELS[this.stat()]);
  protected readonly description = computed(() => STAT_DESCRIPTIONS[this.stat()]);
  protected readonly valueLabel = computed(() =>
    this.format() === 'modifier' ? `×${this.value()}` : this.value().toLocaleString(),
  );
  protected readonly damageRange = computed(() => {
    const multiplier = this.stat() === 'ad' ? [0.85, 1.15] : [0.75, 1.25];
    const minimum = Math.round(this.value() * multiplier[0]);
    const maximum = Math.round(this.value() * multiplier[1]);
    return `${minimum.toLocaleString()}–${maximum.toLocaleString()}`;
  });
  protected readonly reductionPercent = computed(() => {
    const reduction = (this.value() / (100 + this.value())) * 100;
    return reduction.toFixed(1);
  });
  protected readonly detailText = computed(() => {
    if (this.format() === 'modifier') {
      return `Modifier ${this.valueLabel()} to this character's base ${this.label()}.`;
    }

    switch (this.stat()) {
      case 'health':
        return 'The run ends when Health reaches 0.';
      case 'ad':
        return `Deals ${this.damageRange()} raw damage before Armor.`;
      case 'ap':
        return `Deals ${this.damageRange()} raw damage before Magic resist.`;
      case 'armor':
        return `Reduces physical damage by about ${this.reductionPercent()}%.`;
      case 'mr':
        return `Reduces magic damage by about ${this.reductionPercent()}%.`;
      case 'speed':
        return 'Higher Speed acts first; ties favor the foe.';
    }
  });

  protected toggleTooltip(): void {
    this.tooltipOpen.update((open) => !open);
    if (this.tooltipOpen()) {
      this.positionTooltip();
    }
  }

  protected positionTooltip(): void {
    const view = this.document.defaultView;
    const anchor = this.host.nativeElement.getBoundingClientRect();
    const viewportWidth = view?.innerWidth ?? 390;
    const viewportHeight = view?.innerHeight ?? 844;
    const edgeMargin = 12;
    const tooltipWidth = Math.min(240, Math.max(0, viewportWidth - edgeMargin * 2));
    const preferredLeft =
      this.tooltipAlign() === 'start'
        ? anchor.left
        : this.tooltipAlign() === 'end'
          ? anchor.right - tooltipWidth
          : anchor.left + anchor.width / 2 - tooltipWidth / 2;
    const left = Math.min(
      Math.max(preferredLeft, edgeMargin),
      Math.max(edgeMargin, viewportWidth - tooltipWidth - edgeMargin),
    );
    const estimatedHeight = 116;
    const fitsBelow = anchor.bottom + 6 + estimatedHeight <= viewportHeight - edgeMargin;
    const canFitAbove = anchor.top - 6 - estimatedHeight >= edgeMargin;
    const above = !fitsBelow && canFitAbove;
    const top = above ? anchor.top - 6 - estimatedHeight : anchor.bottom + 6;

    this.tooltipLeft.set(left);
    this.tooltipTop.set(Math.max(edgeMargin, top));
    this.tooltipAbove.set(above);
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

  @HostListener('window:resize')
  @HostListener('window:scroll')
  protected repositionTooltip(): void {
    this.positionTooltip();
  }
}
