import { DestroyRef, inject, Injectable, NgZone } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SmoothScrollService {
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  private targetY = 0;
  private currentY = 0;
  private rafId: number | null = null;
  private lastTime = 0;

  // Reference lerp factor at 60 fps. Lower = longer, silkier deceleration tail.
  // 0.08 gives ~1 s of glide after the last wheel event at 60 Hz.
  private readonly LERP = 0.08;
  // Clamp the pixel displacement added by a single wheel event.
  // Prevents one aggressive notch from teleporting the view instead of gliding.
  private readonly MAX_DELTA = 300;

  init(): void {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.targetY = window.scrollY;
    this.currentY = window.scrollY;

    this.ngZone.runOutsideAngular(() => {
      const onWheel = (e: WheelEvent) => this.handleWheel(e);
      window.addEventListener('wheel', onWheel, { passive: false });
      this.destroyRef.onDestroy(() => {
        window.removeEventListener('wheel', onWheel);
        if (this.rafId !== null) cancelAnimationFrame(this.rafId);
      });
    });

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.targetY = 0;
      this.currentY = 0;
      this.lastTime = 0;
    });
  }

  private handleWheel(e: WheelEvent): void {
    if (this.isInsideScrollable(e.target as Element)) return;

    // Re-sync if anchor click or programmatic scroll moved the page externally
    const actual = window.scrollY;
    if (Math.abs(actual - this.currentY) > 60) {
      this.targetY = actual;
      this.currentY = actual;
    }

    e.preventDefault();

    let delta = e.deltaY;
    if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) delta *= 40;
    else if (e.deltaMode === WheelEvent.DOM_DELTA_PAGE) delta *= window.innerHeight;
    // Clamp so fast spinning accumulates smoothly rather than jumping
    delta = Math.sign(delta) * Math.min(Math.abs(delta), this.MAX_DELTA);

    const maxY = document.documentElement.scrollHeight - window.innerHeight;
    this.targetY = Math.max(0, Math.min(this.targetY + delta, maxY));

    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(this.tick);
    }
  }

  // Arrow property so it can be passed directly to rAF without a wrapper closure.
  private readonly tick = (time: number): void => {
    // Normalise dt to 60 fps so the lerp factor is screen-refresh-independent.
    // A 120 Hz screen fires twice as many frames — without normalisation the
    // scroll would feel twice as fast there as on a 60 Hz screen.
    // Cap at 4× to absorb tab-visibility gaps without a sudden lurch.
    const dt = this.lastTime
      ? Math.min((time - this.lastTime) / (1000 / 60), 4)
      : 1;
    this.lastTime = time;

    const alpha = 1 - Math.pow(1 - this.LERP, dt);
    this.currentY += (this.targetY - this.currentY) * alpha;

    if (Math.abs(this.targetY - this.currentY) > 0.5) {
      window.scrollTo(0, this.currentY);
      this.rafId = requestAnimationFrame(this.tick);
    } else {
      window.scrollTo(0, this.targetY);
      this.currentY = this.targetY;
      this.lastTime = 0;
      this.rafId = null;
    }
  };

  private isInsideScrollable(el: Element | null): boolean {
    while (el && el !== document.body) {
      const { overflowY, overflowX } = getComputedStyle(el);
      if (
        (overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight ||
        (overflowX === 'auto' || overflowX === 'scroll') && el.scrollWidth > el.clientWidth
      ) {
        return true;
      }
      el = el.parentElement;
    }
    return false;
  }
}
