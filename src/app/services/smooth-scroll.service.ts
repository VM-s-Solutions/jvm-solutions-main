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
  private startY = 0;
  private startTime = 0;
  private needsRestart = false;
  private rafId: number | null = null;

  // Duration of the ease-out deceleration after the last wheel event (ms).
  // 500 ms gives a silky tail without feeling like the content lags behind input.
  private readonly DURATION = 500;
  // Clamp per-event delta so aggressive spinning accumulates smoothly.
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
      this.startY = 0;
      this.needsRestart = false;
    });
  }

  private handleWheel(e: WheelEvent): void {
    if (this.isInsideScrollable(e.target as Element)) return;

    // Re-sync if anchor click or programmatic scroll moved the page externally.
    const actual = window.scrollY;
    if (Math.abs(actual - this.currentY) > 60) {
      this.targetY = actual;
      this.currentY = actual;
    }

    // Safari fires non-cancelable wheel events during its inertia phase.
    // Calling preventDefault on those silently fails and lets native scroll
    // fight our animation, producing the double-scroll / tearing effect.
    if (!e.cancelable) return;
    e.preventDefault();

    let delta = e.deltaY;
    if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) delta *= 40;
    else if (e.deltaMode === WheelEvent.DOM_DELTA_PAGE) delta *= window.innerHeight;
    delta = Math.sign(delta) * Math.min(Math.abs(delta), this.MAX_DELTA);

    const maxY = document.documentElement.scrollHeight - window.innerHeight;
    this.targetY = Math.max(0, Math.min(this.targetY + delta, maxY));

    // Signal tick() to capture the current visual position as the new animation
    // origin and reset the ease-out timer. Done inside tick() so startY is snapped
    // at the actual frame boundary — avoids a one-frame backward jump.
    this.needsRestart = true;

    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(this.tick);
    }
  }

  private readonly tick = (time: number): void => {
    if (this.needsRestart) {
      this.needsRestart = false;
      this.startY = this.currentY; // origin = where content visually sits right now
      this.startTime = time;
    }

    const elapsed = time - this.startTime;
    const t = Math.min(elapsed / this.DURATION, 1);
    // Ease-out cubic: covers ~79 % of distance in the first half of the duration
    // (fast initial response) then decelerates smoothly to a complete stop.
    const eased = 1 - Math.pow(1 - t, 3);

    this.currentY = this.startY + (this.targetY - this.startY) * eased;
    window.scrollTo(0, Math.round(this.currentY));

    if (t < 1) {
      this.rafId = requestAnimationFrame(this.tick);
    } else {
      this.currentY = this.targetY;
      this.startY = this.targetY;
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
