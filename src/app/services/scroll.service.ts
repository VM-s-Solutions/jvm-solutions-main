import { Injectable } from '@angular/core';
import { prefersReducedMotion } from './motion';

/** Breathing room between the fixed top bar and an element we scroll to. */
const TOP_GAP = 12;

/** How long we wait for a deferred element to render before giving up. */
const RENDER_WAIT_MS = 3000;

/** The fixed top bar's rendered height; falls back to the --nav-h token (in px) before it renders. */
export function topBarHeight(): number {
  const bar = document.querySelector('jvm-top-bar');
  const measured = bar?.getBoundingClientRect().height;
  if (measured) return measured;
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
}

@Injectable({ providedIn: 'root' })
export class ScrollService {
  /** Height of the fixed top bar as rendered (60px on phones, 72px above, plus any safe-area inset). */
  get navbarHeight(): number {
    return topBarHeight();
  }

  /** Where a scrolled-to element lands: just below the top bar. */
  get topOffset(): number {
    return this.navbarHeight + TOP_GAP;
  }

  /**
   * Smooth-scrolls to an element by id, just below the top bar. If it isn't rendered yet (a
   * deferred section), waits up to three seconds for it to appear. With `focusId`, keyboard focus
   * then moves to that element as soon as it exists (without scrolling again), so keyboard and
   * screen reader users carry on from the section they were taken to.
   */
  scrollTo(id: string, focusId?: string): void;
  /** The same, landing the element `offset` pixels below the top of the viewport. */
  scrollTo(id: string, offset: number): void;
  scrollTo(id: string, focusOrOffset?: string | number): void {
    const offset = typeof focusOrOffset === 'number' ? focusOrOffset : this.topOffset;
    whenRendered(id, (el) => scrollToEl(el, offset));
    if (typeof focusOrOffset === 'string') focusWhenRendered(focusOrOffset);
  }
}

/** Calls `then` with the element once it exists: now, or when a deferred block renders it. */
function whenRendered(id: string, then: (el: HTMLElement) => void): void {
  const el = document.getElementById(id);
  if (el) {
    then(el);
    return;
  }
  let timer = 0;
  const observer = new MutationObserver(() => {
    const found = document.getElementById(id);
    if (!found) return;
    observer.disconnect();
    clearTimeout(timer);
    then(found);
  });
  observer.observe(document.body, { childList: true, subtree: true });
  timer = window.setTimeout(() => observer.disconnect(), RENDER_WAIT_MS);
}

/** Focuses the element once it renders, unless the visitor has put focus somewhere else meanwhile. */
function focusWhenRendered(id: string): void {
  const from = document.activeElement;
  whenRendered(id, (el) => {
    const now = document.activeElement;
    if (now === from || now === document.body) el.focus({ preventScroll: true });
  });
}

function scrollToEl(el: HTMLElement, offset: number): void {
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}
