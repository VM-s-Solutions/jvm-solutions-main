import { ChangeDetectionStrategy, Component, ElementRef, QueryList, signal, ViewChildren } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

interface FaqItem {
  qKey: string;
  aKey: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, ScrollRevealDirective],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
})
export class FaqComponent {
  @ViewChildren('answer') private answers!: QueryList<ElementRef<HTMLElement>>;

  readonly items: FaqItem[] = [
    { qKey: 'faq.q1', aKey: 'faq.a1' },
    { qKey: 'faq.q2', aKey: 'faq.a2' },
    { qKey: 'faq.q3', aKey: 'faq.a3' },
    { qKey: 'faq.q4', aKey: 'faq.a4' },
    { qKey: 'faq.q5', aKey: 'faq.a5' },
    { qKey: 'faq.q6', aKey: 'faq.a6' },
  ];

  readonly openIndex = signal<number | null>(null);

  toggle(index: number): void {
    const prev = this.openIndex();

    if (prev !== null) {
      const prevEl = this.answers.get(prev)?.nativeElement;
      if (prevEl) this.collapse(prevEl);
    }

    if (prev === index) {
      this.openIndex.set(null);
      return;
    }

    this.openIndex.set(index);
    const el = this.answers.get(index)?.nativeElement;
    if (el) this.expand(el);
  }

  private expand(el: HTMLElement): void {
    el.style.height = '0';
    void el.offsetHeight;
    el.style.height = el.scrollHeight + 'px';
    el.addEventListener('transitionend', () => { el.style.height = 'auto'; }, { once: true });
  }

  private collapse(el: HTMLElement): void {
    el.style.height = el.getBoundingClientRect().height + 'px';
    void el.offsetHeight;
    el.style.height = '0';
  }
}
