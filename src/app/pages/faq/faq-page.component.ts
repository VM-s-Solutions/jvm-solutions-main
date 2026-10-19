import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IconComponent } from '../../components/icon/icon.component';
import { MessageComponent } from '../../components/message/message.component';
import { SplitTextComponent } from '../../components/split-text/split-text.component';
import { RevealDirective } from '../../directives/reveal.directive';
import { formatEuros } from '../../services/dates';
import { LangService } from '../../services/lang.service';
import { PRICE } from '../../services/plans';
import { PersonId } from '../../services/team';

/** A question as visitors ask it, and which of us usually answers it. */
interface FaqPair {
  q: string;
  a: string;
  by: PersonId;
}

const PAIRS: readonly FaqPair[] = [
  { q: 'faq.q1', a: 'faq.a1', by: 'j' },
  { q: 'faq.q2', a: 'faq.a2', by: 'v' },
  { q: 'faq.q3', a: 'faq.a3', by: 'j' },
  { q: 'faq.q4', a: 'faq.a4', by: 'm' },
  { q: 'faq.q5', a: 'faq.a5', by: 'm' },
  { q: 'faq.q6', a: 'faq.a6', by: 'v' },
];

/**
 * The FAQ as one conversation: each question in the visitor's bubble, answered by one of
 * us. Questions are headings, so screen-reader users can skim them as well.
 */
@Component({
  selector: 'jvm-faq-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule, SplitTextComponent, RevealDirective, MessageComponent, IconComponent],
  templateUrl: './faq-page.component.html',
  styleUrl: './faq-page.component.scss',
})
export class FaqPageComponent {
  private readonly lang = inject(LangService);

  protected readonly pairs = PAIRS;

  /** Prices in the reader's own format: €390 in English, 390 € in Czech */
  protected readonly answerParams = computed(() => ({
    price: formatEuros(PRICE.lts, this.lang.current()),
  }));
}
