import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { SwapTextComponent } from '../swap-text/swap-text.component';
import { LANGS, Lang } from '../../services/lang.service';
import { prefersReducedMotion } from '../../services/motion';
import { injectProductName } from '../../services/product-name';

interface Sample {
  readonly code: Lang;
  /** Tab label: the language code, never translated */
  readonly short: string;
  readonly titleKey: string;
  readonly subKey: string;
  readonly ctaKey: string;
}

/** The same sign-up screen in every language the site speaks, whatever language it is in now */
const SAMPLES: readonly Sample[] = LANGS.map(({ code, short }) => ({
  code,
  short,
  titleKey: `samples.signup.${code}.title`,
  subKey: `samples.signup.${code}.sub`,
  ctaKey: `samples.signup.${code}.cta`,
}));

/**
 * Time on each language during a pass. A pass shows the other three and comes back to
 * English: four switches, so it is over, last crossfade included, within five seconds.
 */
const STEP_MS = 1050;
/** Share of the screen that must be in view before it plays its pass */
const VISIBLE_RATIO = 0.4;

/**
 * Web apps: one sign-up screen that runs through every language the site speaks, the tab
 * thumb sliding along and the texts crossfading in place. It plays one pass when it first
 * comes into view and another whenever `replay` turns on (its card is hovered or focused),
 * then rests on English; with reduced motion it stays there. Decorative; the card around
 * it is aria-hidden.
 */
@Component({
  selector: 'jvm-demo-lang',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, SwapTextComponent],
  templateUrl: './demo-lang.component.html',
  styleUrl: './demo-lang.component.scss',
})
export class DemoLangComponent {
  /** Plays a pass when it turns on, unless one is already running */
  readonly replay = input(false);

  protected readonly samples = SAMPLES;
  protected readonly product = injectProductName();
  protected readonly active = signal(0);

  private timer = 0;

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => this.stop());

    effect(() => {
      if (this.replay()) untracked(() => this.play());
    });

    // The first pass waits until the screen is in view
    afterNextRender(() => {
      if (!('IntersectionObserver' in window)) return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting && e.intersectionRatio >= VISIBLE_RATIO)) return;
          observer.disconnect();
          this.play();
        },
        { threshold: VISIBLE_RATIO },
      );
      observer.observe(host);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  /** One pass: each other language in turn, then back to English. */
  private play(): void {
    if (this.timer || prefersReducedMotion()) return;
    this.timer = window.setInterval(() => {
      // Back on English ends the pass; so does the visitor asking for less motion meanwhile
      const next = prefersReducedMotion() ? 0 : (this.active() + 1) % SAMPLES.length;
      this.active.set(next);
      if (next === 0) this.stop();
    }, STEP_MS);
  }

  private stop(): void {
    window.clearInterval(this.timer);
    this.timer = 0;
  }
}
