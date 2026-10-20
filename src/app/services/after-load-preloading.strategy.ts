import { Injectable, inject } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, Subscription, catchError, of } from 'rxjs';
import { RenderQueueService } from './render-queue.service';

/** After a page's own sections (0) and the footer (1): other pages' code comes last */
const PRELOAD_ORDER = 2;

/**
 * Preloads every lazy route like `PreloadAllModules`, but one route per idle period through the
 * render queue: only once the window has loaded, after the landing page's deferred sections and
 * its footer, and in pauses of the visitor's input. Fetching and evaluating route code never
 * competes with the first page's entrance or with a section rendering.
 */
@Injectable({ providedIn: 'root' })
export class AfterLoadPreloadingStrategy implements PreloadingStrategy {
  private readonly queue = inject(RenderQueueService);

  preload(_route: Route, load: () => Observable<unknown>): Observable<unknown> {
    return new Observable((subscriber) => {
      let inner: Subscription | undefined;
      // A route whose code fails to load is skipped, as PreloadAllModules does: an error here would stop
      // every preload after it, and the route still loads on demand when it's visited
      const preload = (): void => {
        inner = load()
          .pipe(catchError(() => of(null)))
          .subscribe(subscriber);
      };
      const callOff = this.queue.add(preload, PRELOAD_ORDER);
      return () => {
        callOff();
        inner?.unsubscribe();
      };
    });
  }
}
