import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, fromEvent, of, shareReplay, switchMap, take, timer } from 'rxjs';

/** Grace period after `load` — the app paints after `load` fires, so preloading must wait past it. */
const SETTLE_DELAY_MS = 1500;

/**
 * Preloads every lazy route like `PreloadAllModules`, but only once the landing page
 * has settled. Route chunks fetched straight after bootstrap compete with the
 * first page's own scripts and push back its first paint.
 */
@Injectable({ providedIn: 'root' })
export class AfterLoadPreloadingStrategy implements PreloadingStrategy {
  private readonly loaded$: Observable<unknown> =
    document.readyState === 'complete' ? of(null) : fromEvent(window, 'load').pipe(take(1));

  private readonly settled$ = this.loaded$.pipe(
    switchMap(() => timer(SETTLE_DELAY_MS)),
    shareReplay(1),
  );

  preload(_route: Route, load: () => Observable<unknown>): Observable<unknown> {
    return this.settled$.pipe(switchMap(load));
  }
}
