import { ChangeDetectionStrategy, Component, ElementRef, QueryList, signal, ViewChildren } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

interface FaqItem {
  qKey: string;
  aKey: string;
}

@Component({
  selector: 'jvm-faq',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule, ScrollRevealDirective],
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

  readonly openItems = signal<ReadonlySet<number>>(new Set());

  toggle(index: number): void {
    const next = new Set(this.openItems());
    const el = this.answers.get(index)?.nativeElement;

    if (next.has(index)) {
      next.delete(index);
      if (el) this.collapse(el);
    } else {
      next.add(index);
      if (el) this.expand(el);
    }

    this.openItems.set(next);
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
