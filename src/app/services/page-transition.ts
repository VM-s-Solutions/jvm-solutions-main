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
 * Knows when the page slide under way is over, so heavy work a new page starts (a third-party
 * widget, more of the page to render) can wait for it instead of making the slide stutter.
 */
@Injectable({ providedIn: 'root' })
export class PageTransitionService {
  private settled: Promise<void> = Promise.resolve();

  /** Resolves once the current page slide has finished or been cut short; at once when none runs. */
  whenSettled(): Promise<void> {
    return this.settled;
  }

  /** Called as a slide starts. A failed or skipped one settles too: nothing is left to wait for. */
  track(transition: ViewTransition): void {
    this.settled = transition.finished.then(
      () => undefined,
      () => undefined,
    );
  }
}

/**
 * Sets html[data-dir] so the page slides the right way (base/_animations.scss), and skips
 * the slide for visitors who asked for reduced motion or when the page stays the same.
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
