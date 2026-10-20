import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, signal, untracked } from '@angular/core';
import { prefersReducedMotion } from '../../services/motion';

/** How long the old text takes to fade out before the new one fades in ($duration-fast). */
const OUT_MS = 250;

/**
 * Text that swaps softly whenever it changes — the idea's name across the mock screens, for
 * instance: the old text blurs out, then the new one blurs in, as in the concept. The first
 * value is simply there, with no fade.
 */
@Component({
  selector: 'jvm-swap-text',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-out]': 'leaving()',
  },
  template: `{{ shown() }}`,
  styles: `
    @use 'abstracts' as *;

    :host {
      transition:
        opacity $duration-fast $ease-out,
        filter $duration-fast $ease-out;
    }

    :host(.is-out) {
      opacity: 0;
      filter: blur(3px);
    }
  `,
})
export class SwapTextComponent {
  readonly text = input.required<string>();

  /** The text on show: it trails `text` by the fade-out */
  protected readonly shown = signal('');
  protected readonly leaving = signal(false);

  private started = false;
  private timer = 0;

  constructor() {
    // Writes signals on purpose: a new text first fades the old one out, then takes its place
    effect(() => {
      const next = this.text();
      untracked(() => this.swap(next));
    });
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  private swap(next: string): void {
    clearTimeout(this.timer);
    // The first value, a change back to the text on show, or reduced motion: no fade (a fade-out
    // under way turns back)
    if (!this.started || next === this.shown() || prefersReducedMotion()) {
      this.started = true;
      this.shown.set(next);
      this.leaving.set(false);
      return;
    }
    // Another change while the old text fades out restarts the wait, so the newest text lands once
    this.leaving.set(true);
    this.timer = window.setTimeout(() => {
      this.shown.set(next);
      this.leaving.set(false);
    }, OUT_MS);
  }
}
