import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { DarkSurfaceDirective } from '../../directives/dark-surface.directive';
import { RevealDirective } from '../../directives/reveal.directive';
import { CONSULTATION_PARAMS, HOURLY_RATE } from '../../services/consultation';
import { formatEuros } from '../../services/dates';
import { IdeaService } from '../../services/idea.service';
import { LangService } from '../../services/lang.service';
import { IconComponent } from '../icon/icon.component';
import { SplitTextComponent } from '../split-text/split-text.component';

/**
 * The home page's dark band on cost: no price list, the price is agreed for the scope;
 * beside it the one price we publish, an hour with one of us, and a way to book it.
 */
@Component({
  selector: 'jvm-cost',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, DarkSurfaceDirective, RevealDirective, IconComponent, SplitTextComponent],
  templateUrl: './cost.component.html',
  styleUrl: './cost.component.scss',
})
export class CostComponent {
  private readonly idea = inject(IdeaService);
  private readonly lang = inject(LangService);

  protected readonly consultation = CONSULTATION_PARAMS;

  /** "What will it cost?" until the visitor names the idea, then "What will Bloom cost?" */
  protected readonly titleKey = computed(() => (this.idea.hasName() ? 'cost.titleNamed' : 'cost.title'));
  protected readonly titleParams = computed(() => ({ name: this.idea.name() }));

  /** The rate in the reader's own format: €100 in English, 100 € in Czech */
  protected readonly priceParams = computed(() => ({ price: formatEuros(HOURLY_RATE, this.lang.current()) }));
}
