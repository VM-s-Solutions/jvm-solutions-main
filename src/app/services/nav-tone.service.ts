import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { topBarHeight } from './scroll.service';

/**
 * Tells the top bar whether it sits over a dark surface, so it can switch to its dark
 * tone. Dark surfaces register themselves (DarkSurfaceDirective). One IntersectionObserver
 * watches a one-pixel line across the middle of the bar, so scrolling reads no layout: the
 * browser reports a surface when it starts or stops covering that line.
 */
@Injectable({ providedIn: 'root' })
export class NavToneService {
  private readonly surfaces = new Set<HTMLElement>();
  /** The registered surfaces under the line right now */
  private readonly under = new Set<Element>();
  private readonly _dark = signal(false);
  private observer: IntersectionObserver | null = null;
  /** The line and the viewport height the observer was made for */
  private observedFor = '';
  private frame = 0;

  readonly dark = this._dark.asReadonly();

  constructor() {
    const listeners = new AbortController();
    // The line moves with the viewport's height and the bar's (the bar's new height is known a frame later)
    const onResize = (): void => {
      this.observer = this.lineObserver();
      cancelAnimationFrame(this.frame);
      this.frame = requestAnimationFrame(() => (this.observer = this.lineObserver()));
    };
    window.addEventListener('resize', onResize, { passive: true, signal: listeners.signal });
    inject(DestroyRef).onDestroy(() => {
      listeners.abort();
      cancelAnimationFrame(this.frame);
      this.observer?.disconnect();
    });
  }

  register(el: HTMLElement): void {
    this.surfaces.add(el);
    this.observer = this.lineObserver();
    this.observer.observe(el);
  }

  unregister(el: HTMLElement): void {
    this.surfaces.delete(el);
    this.observer?.unobserve(el);
    this.under.delete(el);
    this._dark.set(this.under.size > 0);
  }

  /** The observer for the bar's current line: the same one, or a new one watching every surface. */
  private lineObserver(): IntersectionObserver {
    const line = Math.round(topBarHeight() / 2);
    const height = window.innerHeight;
    const key = `${line}|${height}`;
    if (this.observer && key === this.observedFor) return this.observer;

    this.observedFor = key;
    this.observer?.disconnect();
    this.under.clear();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) this.under.add(entry.target);
          else this.under.delete(entry.target);
        }
        this._dark.set(this.under.size > 0);
      },
      // The viewport shrunk to the one-pixel line across the middle of the bar
      { rootMargin: `-${line}px 0px -${Math.max(0, height - line - 1)}px 0px` },
    );
    for (const el of this.surfaces) observer.observe(el);
    return observer;
  }
}
