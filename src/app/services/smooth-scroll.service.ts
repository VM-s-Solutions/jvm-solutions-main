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

  // 10% of remaining distance per frame — smooth deceleration without overshoot
  private readonly LERP = 0.1;

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

    // Reset after router navigation so scroll-position-restoration's scrollTo(0,0)
    // doesn't fight our interpolated currentY on the next wheel event.
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.targetY = 0;
      this.currentY = 0;
    });
  }

  private handleWheel(e: WheelEvent): void {
    if (this.isInsideScrollable(e.target as Element)) return;

    // Re-sync if an anchor click or programmatic scroll moved the page externally
    const actual = window.scrollY;
    if (Math.abs(actual - this.currentY) > 60) {
      this.targetY = actual;
      this.currentY = actual;
    }

    e.preventDefault();

    let delta = e.deltaY;
    if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) delta *= 40;
    else if (e.deltaMode === WheelEvent.DOM_DELTA_PAGE) delta *= window.innerHeight;

    const maxY = document.documentElement.scrollHeight - window.innerHeight;
    this.targetY = Math.max(0, Math.min(this.targetY + delta, maxY));

    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(this.tick);
    }
  }

  private readonly tick = (): void => {
    this.currentY += (this.targetY - this.currentY) * this.LERP;

    if (Math.abs(this.targetY - this.currentY) > 0.5) {
      window.scrollTo(0, this.currentY);
      this.rafId = requestAnimationFrame(this.tick);
    } else {
      window.scrollTo(0, this.targetY);
      this.currentY = this.targetY;
      this.rafId = null;
    }
  };

  // Skip interception for elements that own their own scroll axis
  // (e.g. a horizontally-scrolling carousel track).
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
