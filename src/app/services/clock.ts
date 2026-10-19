import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, fromEvent, interval, map, merge } from 'rxjs';

const TICK_MS = 60_000;

/**
 * The current time as a signal: refreshed every minute while the tab is visible and as soon
 * as the visitor comes back to it, so a promise like "you'll hear back by …" never goes stale.
 * Call in an injection context; it stops with its owner.
 */
export function injectNow(): Signal<Date> {
  return toSignal(
    merge(interval(TICK_MS), fromEvent(document, 'visibilitychange'), fromEvent(window, 'focus')).pipe(
      filter(() => document.visibilityState === 'visible'),
      map(() => new Date()),
    ),
    { initialValue: new Date() },
  );
}
