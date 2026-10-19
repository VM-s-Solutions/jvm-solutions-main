import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  computed,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SplitTextComponent } from '../../components/split-text/split-text.component';
import { RevealDirective } from '../../directives/reveal.directive';
import { IdeaService } from '../../services/idea.service';
import { prefersReducedMotion } from '../../services/motion';
import { ScrollService } from '../../services/scroll.service';
import { STACK_FULL, StackChip } from '../../services/stack';

/** An entry in the contents and the section it jumps to. */
interface ContentsItem {
  /** Anchor of the section */
  id: string;
  labelKey: string;
}

/** One of the four trades. Its name is both the section heading and its entry in the contents. */
interface Trade extends ContentsItem {
  bodyKey: string;
  itemKeys: readonly string[];
  stack: readonly StackChip[];
}

const TRADES: readonly Trade[] = [
  {
    id: 's-web',
    labelKey: 'service.web',
    bodyKey: 'services.web.body',
    itemKeys: ['services.web.li1', 'services.web.li2', 'services.web.li3'],
    stack: STACK_FULL.web,
  },
  {
    id: 's-api',
    labelKey: 'service.api',
    bodyKey: 'services.api.body',
    itemKeys: ['services.api.li1', 'services.api.li2', 'services.api.li3'],
    stack: STACK_FULL.api,
  },
  {
    id: 's-mob',
    labelKey: 'service.mobile',
    bodyKey: 'services.mobile.body',
    itemKeys: ['services.mobile.li1', 'services.mobile.li2', 'services.mobile.li3'],
    stack: STACK_FULL.mobile,
  },
  {
    id: 's-ai',
    labelKey: 'service.ai',
    bodyKey: 'services.ai.body',
    itemKeys: ['services.ai.li1', 'services.ai.li2', 'services.ai.li3'],
    stack: STACK_FULL.ai,
  },
];

/** The closing dark card: taking over an existing codebase. */
const TAKEOVER: ContentsItem = { id: 's-take', labelKey: 'services.take.nav' };

/** The contents, in page order: the four trades, then taking over. */
const CONTENTS: readonly ContentsItem[] = [...TRADES, TAKEOVER];

/** A section counts as the one being read while it crosses this band, 30–40% down the viewport. */
const READING_BAND = '-30% 0px -60% 0px';

/**
 * The services page: the four trades as documents, with contents that follow the reader.
 * On desktop the contents are a sticky list beside the text with a soft thumb gliding to
 * the section being read; on phones they pin under the top bar as a row of pills that
 * scrolls the active one into view (on short viewports the row scrolls away with the page).
 */
@Component({
  selector: 'jvm-services',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, SplitTextComponent, RevealDirective],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss',
})
export class ServicesComponent {
  private readonly idea = inject(IdeaService);
  private readonly scroll = inject(ScrollService);

  protected readonly trades = TRADES;
  protected readonly takeover = TAKEOVER;
  protected readonly contents = CONTENTS;

  /** "…every part of your product" until the visitor names their idea, then "…every part of Bloom" */
  protected readonly leadKey = computed(() => (this.idea.hasName() ? 'services.leadNamed' : 'services.lead'));
  protected readonly leadParams = computed(() => ({ name: this.idea.name() }));

  /** Index of the section being read; its entry in the contents is highlighted */
  protected readonly active = signal(0);

  private readonly nav = viewChild.required<ElementRef<HTMLElement>>('nav');
  private readonly thumb = viewChild.required<ElementRef<HTMLElement>>('thumb');
  private readonly links = viewChildren<ElementRef<HTMLElement>>('link');
  private readonly sections = viewChildren<ElementRef<HTMLElement>>('section');
  private readonly headings = viewChildren<ElementRef<HTMLElement>>('heading');
  /** Bumped when a contents entry changes size (fonts, language, viewport), so the highlight measures again */
  private readonly layoutTick = signal(0);

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const sections: Element[] = this.sections().map((ref) => ref.nativeElement);
      // Neighbouring sections can cross the band together, so it keeps track of every one in it
      const inBand = new Set<number>();
      const spy = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const index = sections.indexOf(entry.target);
            if (index < 0) continue;
            if (entry.isIntersecting) {
              inBand.add(index);
              // A section entering the band is the one being read
              this.active.set(index);
            } else {
              inBand.delete(index);
            }
          }
          // The highlighted section left the band while a neighbour is still in it: that one is being read
          const [remaining] = inBand;
          if (remaining !== undefined && !inBand.has(this.active())) this.active.set(remaining);
        },
        { rootMargin: READING_BAND },
      );
      sections.forEach((section) => spy.observe(section));

      const sizes = new ResizeObserver(() => this.layoutTick.update((n) => n + 1));
      this.links().forEach((link) => sizes.observe(link.nativeElement));

      destroyRef.onDestroy(() => {
        spy.disconnect();
        sizes.disconnect();
      });
    });

    afterRenderEffect(() => {
      this.layoutTick();
      const link = this.links()[this.active()]?.nativeElement;
      if (!link?.offsetHeight) return;
      const nav = this.nav().nativeElement;
      if (isPillRow(nav)) this.bringIntoRow(nav, link);
      else this.moveThumb(link);
    });
  }

  /** Jumps to a section and moves focus there, so keyboard users carry on reading from it. */
  protected go(index: number): void {
    const section = this.sections()[index]?.nativeElement;
    if (!section) return;
    // Aim where the section will settle once its reveal has lifted it into place
    this.scroll.scrollTo(section.id, this.landingOffset() + pendingRevealShift(section));
    this.headings()[index]?.nativeElement.focus({ preventScroll: true });
  }

  /** Where a section's top lands: below the top bar, or on phones below the pinned pill row. */
  private landingOffset(): number {
    const nav = this.nav().nativeElement;
    const { position, top } = getComputedStyle(nav);
    // On short viewports the pill row scrolls away with the page instead of pinning
    if (!isPillRow(nav) || position !== 'sticky') return this.scroll.topOffset;
    const gap = this.scroll.topOffset - this.scroll.navbarHeight;
    // The row's resolved sticky top already includes the top bar and any safe-area inset
    return parseFloat(top) + nav.offsetHeight + gap;
  }

  /** Desktop: the soft thumb glides behind the active entry. */
  private moveThumb(link: HTMLElement): void {
    const thumb = this.thumb().nativeElement;
    thumb.style.height = `${link.offsetHeight}px`;
    thumb.style.transform = `translateY(${link.offsetTop}px)`;
    if (thumb.classList.contains('is-placed')) return;
    // First placement: reading layout applies the size and position before transitions switch
    // on, so the thumb appears in place and glides from there on
    thumb.getBoundingClientRect();
    thumb.classList.add('is-placed');
  }

  /** Phones: scroll the pill row so the active pill sits at the row's left edge. */
  private bringIntoRow(nav: HTMLElement, link: HTMLElement): void {
    const left = link.offsetLeft - parseFloat(getComputedStyle(nav).paddingLeft);
    nav.scrollTo({ left, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }
}

/** The contents lie in a row of pills on phones and in a list beside the text on desktop. */
function isPillRow(nav: HTMLElement): boolean {
  return getComputedStyle(nav).flexDirection === 'row';
}

/** How far down a section's reveal animation still holds it; it settles that much higher. */
function pendingRevealShift(el: HTMLElement): number {
  const { transform } = getComputedStyle(el);
  return transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m42;
}
