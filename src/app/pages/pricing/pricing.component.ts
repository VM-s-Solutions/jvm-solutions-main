import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { PriceDialComponent } from '../../components/price-dial/price-dial.component';
import { PLANS, type PlanId } from '../../services/plans';
import { SplitTextComponent } from '../../components/split-text/split-text.component';
import { RevealDirective } from '../../directives/reveal.directive';
import { formatEuros } from '../../services/dates';
import { IdeaService } from '../../services/idea.service';
import { LangService } from '../../services/lang.service';

/** The plan we recommend: a dark column and the primary button */
const RECOMMENDED: PlanId = 'team';

/** The table's columns: the dial's plans, in the dial's order. */
const COLUMNS = PLANS.map(({ id, amount }) => ({
  id,
  amount,
  ctaKey: `price.plans.${id}.cta`,
  recommended: id === RECOMMENDED,
}));

/** The plain-text rows under the price, one cell per plan. */
const TEXT_ROWS = (['for', 'get', 'response', 'term', 'billing'] as const).map((row) => ({
  headKey: `pricing.rows.${row}`,
  cells: COLUMNS.map(({ id, recommended }) => ({ key: `pricing.cells.${row}.${id}`, recommended })),
}));

/**
 * The pricing page: the price dial on its light card, then every plan side by side in a
 * table that scrolls sideways on narrow screens, with the recommended plan in a dark column.
 */
@Component({
  selector: 'jvm-pricing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, PriceDialComponent, SplitTextComponent, RevealDirective],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss',
})
export class PricingComponent {
  private readonly idea = inject(IdeaService);
  private readonly lang = inject(LangService);

  protected readonly columns = COLUMNS;
  protected readonly textRows = TEXT_ROWS;

  /** "Your idea at one fixed price" until the visitor names it, then "Bloom at one fixed price" */
  protected readonly projectColumnKey = computed(() =>
    this.idea.hasName() ? 'pricing.cols.projectNamed' : 'pricing.cols.project',
  );
  protected readonly ideaParams = computed(() => ({ name: this.idea.name() }));

  /** The price row, with amounts in the language's own format: €17,900 in English, 17 900 € in Czech */
  protected readonly priceCells = computed(() => {
    const lang = this.lang.current();
    return COLUMNS.map(({ id, amount, recommended }) => ({
      key: `pricing.cells.price.${id}`,
      params: { price: amount === null ? '' : formatEuros(amount, lang) },
      recommended,
    }));
  });

  /** True while the table is wider than its frame; the frame then takes focus, so keys can scroll it */
  protected readonly scrollable = signal(false);

  private readonly tableWrap = viewChild.required<ElementRef<HTMLElement>>('tableWrap');
  private readonly table = viewChild.required<ElementRef<HTMLElement>>('table');

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const wrap = this.tableWrap().nativeElement;
      const observer = new ResizeObserver(() => this.scrollable.set(wrap.scrollWidth > wrap.clientWidth));
      observer.observe(wrap);
      observer.observe(this.table().nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
