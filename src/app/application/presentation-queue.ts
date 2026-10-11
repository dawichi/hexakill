import { Clock, ClockHandle } from './clock';

export interface PresentationStep {
  readonly delayMs: number;
  readonly apply: (fastForward: boolean) => void;
}

interface ScheduledPresentation {
  readonly dueAt: number;
  readonly order: number;
  readonly apply: (fastForward: boolean) => void;
}

/** One clock-backed scheduler for combat narration and transient visual feedback. */
export class PresentationQueue {
  private readonly scheduled: ScheduledPresentation[] = [];
  private timer: ClockHandle | null = null;
  private timerDueAt: number | null = null;
  private timelineAt: number;
  private nextOrder = 0;
  private processing = false;

  constructor(private readonly clock: Clock) {
    this.timelineAt = clock.now();
  }

  enqueue(steps: readonly PresentationStep[]): void {
    let dueAt = Math.max(this.timelineAt, this.clock.now());
    for (const step of steps) {
      dueAt += Math.max(0, step.delayMs);
      this.scheduled.push({ dueAt, order: this.nextOrder++, apply: step.apply });
    }
    this.timelineAt = dueAt;
    this.pump();
  }

  schedule(delayMs: number, apply: () => void): void {
    this.scheduled.push({
      dueAt: this.clock.now() + Math.max(0, delayMs),
      order: this.nextOrder++,
      apply: () => apply(),
    });
    this.pump();
  }

  /** Apply all queued steps immediately, marking combat steps as fast-forwarded. */
  skip(): void {
    this.cancelTimer();
    this.processing = true;
    while (this.scheduled.length) {
      this.sortScheduled();
      this.scheduled.shift()?.apply(true);
    }
    this.processing = false;
    this.timelineAt = this.clock.now();
  }

  /** Stop every pending presentation callback, used when a run is reset or abandoned. */
  cancelAll(): void {
    this.cancelTimer();
    this.scheduled.length = 0;
    this.timelineAt = this.clock.now();
  }

  private pump(): void {
    if (this.processing) return;
    this.sortScheduled();
    const next = this.scheduled[0];
    if (!next) {
      this.cancelTimer();
      return;
    }

    if (this.timer && this.timerDueAt !== null && this.timerDueAt <= next.dueAt) return;
    this.cancelTimer();

    const delay = Math.max(0, next.dueAt - this.clock.now());
    if (delay === 0) {
      this.processing = true;
      while (this.scheduled.length) {
        this.sortScheduled();
        if ((this.scheduled[0]?.dueAt ?? Infinity) > this.clock.now()) break;
        this.scheduled.shift()?.apply(false);
      }
      this.processing = false;
      this.pump();
      return;
    }

    this.timerDueAt = next.dueAt;
    this.timer = this.clock.schedule(() => {
      this.timer = null;
      this.timerDueAt = null;
      this.pump();
    }, delay);
  }

  private sortScheduled(): void {
    this.scheduled.sort((left, right) => left.dueAt - right.dueAt || left.order - right.order);
  }

  private cancelTimer(): void {
    this.timer?.cancel();
    this.timer = null;
    this.timerDueAt = null;
  }
}
