import { DestroyRef, Directive, ElementRef, afterNextRender, computed, inject, input } from '@angular/core';

/** '' fades and lifts; 'up' rises further and scales; 'lift' only moves (stays opaque, so it can paint as the LCP). */
export type RevealVariant = '' | 'up' | 'lift';

const OBSERVER_OPTIONS: IntersectionObserverInit = { rootMargin: '0px 0px -6% 0px', threshold: 0.08 };

/**
 * Fades and lifts an element in the first time it scrolls into view.
 * `jvmReveal="up"` rises further and scales from 97%; `revealDelay` (seconds) staggers
 * neighbours. The hidden state is only applied in the browser, once this has run.
 */
@Directive({
  selector: '[jvmReveal]',
  standalone: true,
  host: {
    '[style.--d]': 'delay()',
  },
})
export class RevealDirective {
  readonly jvmReveal = input<RevealVariant>('');
  readonly revealDelay = input(0);

  protected readonly delay = computed(() => `${this.revealDelay()}s`);

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      el.classList.add('reveal');
      const variant = this.jvmReveal();
      if (variant) el.classList.add(`reveal--${variant}`);

      if (!('IntersectionObserver' in window)) {
        el.classList.add('is-in');
        return;
      }
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add('is-in');
          observer.disconnect();
        }
      }, OBSERVER_OPTIONS);
      observer.observe(el);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
