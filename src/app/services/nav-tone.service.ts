import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { topBarHeight } from './scroll.service';

/**
 * Tells the top bar whether it sits over a dark surface, so it can switch to its dark
 * tone. Dark surfaces register themselves (DarkSurfaceDirective); on every scroll frame
 * we check which one, if any, is under the middle of the bar.
 */
@Injectable({ providedIn: 'root' })
export class NavToneService {
  private readonly surfaces = new Set<HTMLElement>();
  private readonly _dark = signal(false);
  private frame = 0;

  readonly dark = this._dark.asReadonly();

  constructor() {
    const listeners = new AbortController();
    const options = { passive: true, signal: listeners.signal };
    window.addEventListener('scroll', () => this.schedule(), options);
    window.addEventListener('resize', () => this.schedule(), options);
    inject(DestroyRef).onDestroy(() => {
      listeners.abort();
      cancelAnimationFrame(this.frame);
      this.frame = 0;
    });
  }

  register(el: HTMLElement): void {
    this.surfaces.add(el);
    this.schedule();
  }

  unregister(el: HTMLElement): void {
    this.surfaces.delete(el);
    this.schedule();
  }

  /** Re-checks on the next frame; several calls in one frame cost one check. */
  schedule(): void {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.check();
    });
  }

  private check(): void {
    const line = navLine();
    let dark = false;
    for (const el of this.surfaces) {
      const r = el.getBoundingClientRect();
      if (r.height && r.top <= line && r.bottom > line) {
        dark = true;
        break;
      }
    }
    this._dark.set(dark);
  }
}

/** Vertical middle of the fixed top bar, in viewport pixels. */
function navLine(): number {
  return topBarHeight() / 2;
}
