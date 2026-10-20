import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, ViewTransitionInfo } from '@angular/router';
import { LEGAL_DOCS } from '../components/legal-document/legal-document.model';
import { NAV_TABS } from '../components/top-bar/nav-tabs';
import { prefersReducedMotion } from './motion';

/**
 * Pages in navigation order: the top bar's tabs, then contact and the legal pages.
 * Going right pushes the new page in, going left pops back.
 */
const PAGE_ORDER: readonly string[] = [
  ...NAV_TABS.map((tab) => tab.path.slice(1)),
  'contact',
  ...LEGAL_DOCS.map((doc) => doc.id),
];

function leafPath(snapshot: ActivatedRouteSnapshot): string {
  let route = snapshot;
  while (route.firstChild) route = route.firstChild;
  return route.routeConfig?.path ?? '';
}

/**
 * Safari restarts the compositor's copy of every animation still running inside the slide's
 * snapshot once the snapshot goes. The new page's entrance fits inside the slide, so normally
 * nothing is left; this catches what still runs (a page that rendered late on a slow phone) by
 * seeking each animation to its own current time, which hands the compositor the real time again.
 * Everywhere else it changes nothing.
 */
function resyncAnimations(): void {
  for (const animation of document.getAnimations()) {
    if (animation.playState === 'running') animation.currentTime = animation.currentTime;
  }
}

/**
 * While a slide runs, browsers hit-test its snapshots as <html>: every press lands there, whatever
 * pointer-events say, so a tab clicked mid-slide did nothing. The top bar and the tab bar sit out of
 * the slide and stand where they're drawn, so a click there goes on to their link or button under
 * it, and its page opens at once (its slide takes over from this one). The page itself isn't where
 * it's drawn yet, so a click on it (the second half of a double click) still goes nowhere.
 */
function clickThrough(event: MouseEvent): void {
  if (event.target !== document.documentElement || event.button !== 0) return;
  const { clientX: x, clientY: y } = event;
  const control = Array.from(document.querySelectorAll<HTMLElement>('a[href], button')).find((el) => {
    if (el.closest('main, footer')) return false;
    const { left, right, top, bottom, width } = el.getBoundingClientRect();
    // A hidden control (the other bar's tabs, a closed menu) has no box
    return width > 0 && x >= left && x <= right && y >= top && y <= bottom;
  });
  control?.click();
}

/**
 * Knows when the page slide under way is over, so heavy work a new page starts (a third-party
 * widget, more of the page to render) can wait for it instead of making the slide stutter.
 * While it runs, the bars stay clickable (clickThrough).
 */
@Injectable({ providedIn: 'root' })
export class PageTransitionService {
  private settled: Promise<void> = Promise.resolve();
  private current: ViewTransition | null = null;

  /** Resolves once the current page slide has finished or been cut short; at once when none runs. */
  whenSettled(): Promise<void> {
    return this.settled;
  }

  /**
   * Called as a slide starts. A failed or skipped one settles too: nothing is left to wait for.
   * Once it's over, html[data-dir] goes, unless the next slide has already taken over.
   */
  track(transition: ViewTransition): void {
    this.current = transition;
    // On <html> itself, where the slide's presses land
    const clicks = new AbortController();
    document.documentElement.addEventListener('click', clickThrough, { signal: clicks.signal });
    const settle = (): void => {
      clicks.abort();
      if (this.current !== transition) return;
      this.current = null;
      delete document.documentElement.dataset['dir'];
      resyncAnimations();
    };
    this.settled = transition.finished.then(settle, settle);
  }
}

/**
 * Sets html[data-dir] for the length of the slide: it says which way the page slides, and the
 * incoming page makes a quicker entrance while it's set (base/_animations.scss). Skips the
 * slide for visitors who asked for reduced motion or when the page stays the same.
 * The router calls it in an injection context, as each slide starts.
 */
export function onPageTransition({ transition, from, to }: ViewTransitionInfo): void {
  const fromPath = leafPath(from);
  const toPath = leafPath(to);
  if (fromPath === toPath || prefersReducedMotion()) {
    transition.skipTransition();
    return;
  }
  const back = PAGE_ORDER.indexOf(toPath) < PAGE_ORDER.indexOf(fromPath);
  document.documentElement.dataset['dir'] = back ? 'back' : 'fwd';
  inject(PageTransitionService).track(transition);
}
