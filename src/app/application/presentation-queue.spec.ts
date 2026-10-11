import { describe, expect, it } from 'vitest';
import { Clock, ClockHandle } from './clock';
import { PresentationQueue } from './presentation-queue';

class TestClock implements Clock {
  private time = 0;
  private sequence = 0;
  private tasks: { at: number; sequence: number; task: () => void; cancelled: boolean }[] = [];

  now(): number {
    return this.time;
  }

  schedule(task: () => void, delayMs: number): ClockHandle {
    const entry = {
      at: this.time + delayMs,
      sequence: this.sequence++,
      task,
      cancelled: false,
    };
    this.tasks.push(entry);
    return { cancel: () => (entry.cancelled = true) };
  }

  advanceBy(milliseconds: number): void {
    const target = this.time + milliseconds;
    while (true) {
      this.tasks.sort((left, right) => left.at - right.at || left.sequence - right.sequence);
      const nextIndex = this.tasks.findIndex((entry) => !entry.cancelled && entry.at <= target);
      if (nextIndex < 0) break;
      const [next] = this.tasks.splice(nextIndex, 1);
      if (!next) continue;
      this.time = next.at;
      next.task();
    }
    this.time = target;
    this.tasks = this.tasks.filter((entry) => !entry.cancelled);
  }
}

describe('PresentationQueue', () => {
  it('plays ordered steps on one clock', () => {
    const clock = new TestClock();
    const queue = new PresentationQueue(clock);
    const played: string[] = [];

    queue.enqueue([
      { delayMs: 0, apply: () => played.push('start') },
      { delayMs: 120, apply: () => played.push('impact') },
    ]);

    expect(played).toEqual(['start']);
    clock.advanceBy(119);
    expect(played).toEqual(['start']);
    clock.advanceBy(1);
    expect(played).toEqual(['start', 'impact']);
  });

  it('orders transient work with combat steps and fast-forwards everything', () => {
    const clock = new TestClock();
    const queue = new PresentationQueue(clock);
    const played: string[] = [];

    queue.enqueue([
      { delayMs: 0, apply: (fastForward) => played.push(`action:${fastForward}`) },
      { delayMs: 100, apply: (fastForward) => played.push(`hit:${fastForward}`) },
    ]);
    queue.schedule(60, () => played.push('feedback-clear'));
    clock.advanceBy(60);
    expect(played).toEqual(['action:false', 'feedback-clear']);

    queue.skip();
    expect(played).toEqual(['action:false', 'feedback-clear', 'hit:true']);
  });

  it('cancels all pending work together', () => {
    const clock = new TestClock();
    const queue = new PresentationQueue(clock);
    const played: string[] = [];

    queue.enqueue([{ delayMs: 50, apply: () => played.push('step') }]);
    queue.schedule(20, () => played.push('transient'));
    queue.cancelAll();
    clock.advanceBy(100);

    expect(played).toEqual([]);
  });
});
