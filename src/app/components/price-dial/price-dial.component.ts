import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { IconComponent } from '../icon/icon.component';
import { SwapTextComponent } from '../swap-text/swap-text.component';
import { formatEuros } from '../../services/dates';
import { IdeaService } from '../../services/idea.service';
import { LangService } from '../../services/lang.service';
import { prefersReducedMotion } from '../../services/motion';
import { PLANS } from '../../services/plans';

/** The dial opens on the whole team */
const START = PLANS.length - 1;
/** Count-up from one price to the next */
const COUNT_MS = 700;
/** How long the amount stays faded out before the project's label replaces it (or back) */
const SWAP_MS = 200;

const STOPS = PLANS.map((plan) => ({
  ...plan,
  nameKey: `price.plans.${plan.id}.name`,
  descKey: `price.plans.${plan.id}.desc`,
  perKey: `price.plans.${plan.id}.per`,
  ctaKey: `price.plans.${plan.id}.cta`,
  tickKey: `price.ticks.${plan.id}`,
}));

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

/**
 * "How much help do you need?": a four-stop slider from an hour of consulting to the whole
 * team. Prices count up or down between stops; names and descriptions fade across. With an
 * idea named, the project stop is quoted for it. `variant="light"` sits on a light page.
 */
@Component({
  selector: 'jvm-price-dial',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, IconComponent, SwapTextComponent],
  host: {
    class: 'dial',
    '[class.dial--light]': "variant() === 'light'",
  },
  templateUrl: './price-dial.component.html',
  styleUrl: './price-dial.component.scss',
})
export class PriceDialComponent {
  private readonly translate = inject(TranslateService);
  private readonly lang = inject(LangService);
  private readonly idea = inject(IdeaService);

  /** 'dark' for the ink band on the home page, 'light' for a light page */
  readonly variant = input<'dark' | 'light'>('dark');

  protected readonly stops = STOPS;
  protected readonly last = STOPS.length - 1;
  protected readonly index = signal(START);
  protected readonly plan = computed(() => STOPS[this.index()]);
  protected readonly fill = computed(() => `${(this.index() / this.last) * 100}%`);
  protected readonly fromHidden = computed(() => (this.plan().from ? null : 'true'));

  /** The price on show — mid count-up between two stops — or null for the project's label */
  private readonly shown = signal<number | null>(PLANS[START].amount);
  protected readonly amountOut = signal(false);
  protected readonly amountText = computed(() => {
    const value = this.shown();
    const lang = this.lang.current();
    return value === null ? this.t('price.plans.project.amount') : formatEuros(value, lang);
  });

  protected readonly projectName = computed(() => {
    this.lang.current();
    const name = this.idea.name();
    return name ? this.t('price.plans.project.nameNamed', { name }) : this.t('price.plans.project.name');
  });

  /**
   * What a screen reader announces for the slider, in the order the dial shows it:
   * "The whole team, from €17,900 per month".
   */
  protected readonly valueText = computed(() => {
    const lang = this.lang.current();
    const { id, amount, from, nameKey, perKey } = this.plan();
    const name = id === 'project' ? this.projectName() : this.t(nameKey);
    const price = amount === null ? this.t('price.plans.project.amount') : formatEuros(amount, lang);
    const prefix = from ? `${this.t('price.from')} ` : '';
    return `${name}, ${prefix}${price} ${this.t(perKey)}`;
  });

  private frame = 0;
  private timer = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      cancelAnimationFrame(this.frame);
      clearTimeout(this.timer);
    });
  }

  protected select(stop: number): void {
    if (!Number.isFinite(stop)) return;
    const next = Math.min(this.last, Math.max(0, Math.round(stop)));
    if (next === this.index()) return;
    this.index.set(next);
    this.showAmount(STOPS[next].amount);
  }

  private showAmount(target: number | null): void {
    cancelAnimationFrame(this.frame);
    clearTimeout(this.timer);
    const current = this.shown();

    if (prefersReducedMotion() || current === target) {
      this.shown.set(target);
      this.amountOut.set(false);
      return;
    }
    // Price to price: count from whatever is showing, even mid-count
    if (current !== null && target !== null && !this.amountOut()) {
      this.countTo(current, target);
      return;
    }
    // To or from the project's label: fade out, swap, fade back in
    this.amountOut.set(true);
    this.timer = window.setTimeout(() => {
      this.shown.set(target);
      this.amountOut.set(false);
    }, SWAP_MS);
  }

  private countTo(from: number, to: number): void {
    const start = performance.now();
    const step = (now: number) => {
      // a frame can be stamped just before `start`; clamp so the count never dips backwards
      const k = Math.min(1, Math.max(0, (now - start) / COUNT_MS));
      this.shown.set(from + (to - from) * easeOutQuart(k));
      this.frame = k < 1 ? requestAnimationFrame(step) : 0;
    };
    this.frame = requestAnimationFrame(step);
  }

  private t(key: string, params?: Record<string, string>): string {
    const value: unknown = this.translate.instant(key, params);
    return typeof value === 'string' ? value : key;
  }
}
