import { ApplicationRef, DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/** Longest a step waits for the browser to go idle before it runs anyway (a page that's never idle) */
const IDLE_TIMEOUT_MS = 2000;
/** Safari has no requestIdleCallback: a short timer stands in for the next idle period */
const NO_IDLE_CALLBACK_MS = 200;
/**
 * The pause a step waits for after a scroll, wheel, touch, click or key press. The paper board's
 * eased scroll, a smooth scroll and the chat's bubble flight (0.56s) have all come to rest by then.
 */
const QUIET_MS = 700;
/** While a section's code is still on its way, a step looks again this often */
const LOADING_RETRY_MS = 250;
/** A visitor who never pauses that long still gets every section: past this, a step stops waiting */
const PATIENCE_MS = 8000;

/**
 * The visitor's hands on the page, in capture so a swipe in the chat or the carousel counts too.
 * The page's own scroll counts as well, whoever moves it; an inner scroller's doesn't, or the chat
 * keeping its newest message in view would hold the queue up all through its intro.
 */
const GESTURE_EVENTS = ['wheel', 'touchstart', 'touchmove', 'pointerdown', 'keydown'] as const;

/** Each of these runs `run` once and returns a function that calls it off. */
function whenIdle(run: () => void): () => void {
  if (typeof requestIdleCallback === 'function') {
    const id = requestIdleCallback(() => run(), { timeout: IDLE_TIMEOUT_MS });
    return () => cancelIdleCallback(id);
  }
  const id = window.setTimeout(run, NO_IDLE_CALLBACK_MS);
  return () => clearTimeout(id);
}

function after(ms: number, run: () => void): () => void {
  const id = window.setTimeout(run, ms);
  return () => clearTimeout(id);
}

function nextFrame(run: () => void): () => void {
  const id = requestAnimationFrame(() => run());
  return () => cancelAnimationFrame(id);
}

interface Job {
  readonly run: () => void;
  readonly order: number;
}

/**
 * Hands out heavy rendering (a deferred section, the footer) one piece per idle period, so no
 * two pieces share a task and none lands in the middle of a gesture. Nothing runs before the
 * window has loaded or while a page holds the queue (its entrance); then each piece waits for
 * the visitor to pause, for the app to settle (no section code still loading, which would
 * render whenever it lands) and for the browser to go idle, and the next one waits for the
 * frame that shows it. A piece is usually a signal write that lets one @defer block in.
 */
@Injectable({ providedIn: 'root' })
export class RenderQueueService {
  private readonly jobs: Job[] = [];
  private loaded = document.readyState === 'complete';
  /** Nothing pending in the app: no code loading, no change detection due */
  private stable = true;
  private heldUntil = 0;
  private lastInput = Number.NEGATIVE_INFINITY;
  /** When the next step began waiting (0: it hasn't yet) */
  private waitingSince = 0;
  /** Calls off what the queue waits on now: a timer, an idle callback or a frame */
  private pending: (() => void) | null = null;

  constructor() {
    inject(ApplicationRef)
      .isStable.pipe(takeUntilDestroyed())
      .subscribe((stable) => (this.stable = stable));

    const listeners = new AbortController();
    const mark = (): void => {
      this.lastInput = performance.now();
    };
    for (const type of GESTURE_EVENTS) {
      window.addEventListener(type, mark, { capture: true, passive: true, signal: listeners.signal });
    }
    window.addEventListener('scroll', mark, { passive: true, signal: listeners.signal });
    if (!this.loaded) {
      const onLoad = (): void => {
        this.loaded = true;
        this.schedule();
      };
      window.addEventListener('load', onLoad, { once: true, signal: listeners.signal });
    }
    inject(DestroyRef).onDestroy(() => {
      listeners.abort();
      this.pending?.();
      this.pending = null;
    });
  }

  /**
   * Queues `run` for an idle period of its own. A lower `order` goes first (a page's sections
   * use 0, the footer 1, so it follows them); the same order goes first come, first served.
   * Returns a function that takes it off the queue.
   */
  add(run: () => void, order = 0): () => void {
    const job: Job = { run, order };
    const later = this.jobs.findIndex((other) => other.order > order);
    this.jobs.splice(later < 0 ? this.jobs.length : later, 0, job);
    this.schedule();
    return () => {
      const at = this.jobs.indexOf(job);
      if (at >= 0) this.jobs.splice(at, 1);
    };
  }

  /** Nothing runs for the next `ms` (a page making its entrance); a longer hold already set stays. */
  hold(ms: number): void {
    this.heldUntil = Math.max(this.heldUntil, performance.now() + ms);
  }

  private schedule(): void {
    if (this.pending || !this.loaded || this.jobs.length === 0) return;
    const wait = this.waitTime();
    this.pending = wait > 0 ? after(wait, () => this.reschedule()) : whenIdle(() => this.step());
  }

  private reschedule(): void {
    this.pending = null;
    this.schedule();
  }

  private step(): void {
    this.pending = null;
    // The visitor may have scrolled, or a page held the queue, while this waited for idle time
    if (this.waitTime() > 0) {
      this.schedule();
      return;
    }
    const job = this.jobs.shift();
    if (!job) return;
    this.waitingSince = 0;
    job.run();
    // The next piece waits for the frame that shows this one, then for a pause and idle time again
    this.pending = nextFrame(() => this.reschedule());
  }

  /** How long until a step may run: the hold, then a settled app and a pause in input. 0: it may run now. */
  private waitTime(): number {
    const now = performance.now();
    if (this.heldUntil > now) return this.heldUntil - now;
    this.waitingSince ||= now;
    if (now - this.waitingSince >= PATIENCE_MS) return 0;
    if (!this.stable) return LOADING_RETRY_MS;
    return Math.max(0, this.lastInput + QUIET_MS - now);
  }
}
