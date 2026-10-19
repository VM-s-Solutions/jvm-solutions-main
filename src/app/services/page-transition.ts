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
 * Sets html[data-dir] so the page slides the right way (base/_animations.scss), and skips
 * the slide for visitors who asked for reduced motion or when the page stays the same.
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
}
