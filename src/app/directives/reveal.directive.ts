import {
  DestroyRef,
  Directive,
  ElementRef,
  HostAttributeToken,
  afterNextRender,
  computed,
  inject,
  input,
} from '@angular/core';

/** '' fades and lifts; 'up' rises further and scales; 'lift' only moves (stays opaque, so it can paint as the LCP). */
export type RevealVariant = '' | 'up' | 'lift';

/** The concept's trigger: 8% of the element in view, and above the bottom 6% of the screen */
const OBSERVER_OPTIONS: IntersectionObserverInit = { rootMargin: '0px 0px -6% 0px', threshold: 0.08 };

/** What runs when each watched element first scrolls into view */
const waiting = new WeakMap<Element, (() => void)[]>();
let observer: IntersectionObserver | undefined;

function onEntries(entries: IntersectionObserverEntry[], io: IntersectionObserver): void {
  for (const { isIntersecting, target } of entries) {
    if (!isIntersecting) continue;
    io.unobserve(target);
    const callbacks = waiting.get(target);
    waiting.delete(target);
    callbacks?.forEach((show) => show());
  }
}

/**
 * Runs `show` the first time `el` scrolls into view; returns a function that stops waiting.
 * One observer serves every reveal and split heading, as in the concept, so a section that
 * brings many of them gets one callback for all. Two callers on one element share its lifetime,
 * so stopping drops both.
 */
export function whenRevealed(el: Element, show: () => void): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    show();
    return () => undefined;
  }
  const io = (observer ??= new IntersectionObserver(onEntries, OBSERVER_OPTIONS));
  const callbacks = waiting.get(el);
  if (callbacks) {
    callbacks.push(show);
  } else {
    waiting.set(el, [show]);
    io.observe(el);
  }
  return () => {
    waiting.delete(el);
    io.unobserve(el);
  };
}

/**
 * Fades and lifts an element in the first time it scrolls into view.
 * `jvmReveal="up"` rises further and scales from 97%; `revealDelay` (seconds) staggers
 * neighbours. The hidden state comes with the element itself: added later, after a style read
 * (any layout read in an earlier hook of the same render), it would turn the reveal into a fade-out.
 */
@Directive({
  selector: '[jvmReveal]',
  standalone: true,
  host: {
    class: 'reveal',
    '[class.reveal--up]': "jvmReveal() === 'up'",
    '[class.reveal--lift]': "jvmReveal() === 'lift'",
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

    // A variant written in the template (jvmReveal="lift") goes on with .reveal, at creation. Left to
    // the input binding, it would land a tick later for views a route or @defer creates: a style read
    // in between would commit the plain hidden state, and the lead would fade in instead of showing.
    const written = inject(new HostAttributeToken('jvmReveal'), { optional: true });
    if (written === 'up' || written === 'lift') el.classList.add(`reveal--${written}`);

    afterNextRender(() => {
      // A plain class, not a signal: showing an element needs no change detection
      destroyRef.onDestroy(whenRevealed(el, () => el.classList.add('is-in')));
    });
  }
}
