import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { ScrollService } from '../../services/scroll.service';
import { LEGAL_DOCS, LegalDocId, LegalSection } from './legal-document.model';

/** How far below its scrolled-to position a heading still counts as "at the top". */
const HEADING_SLACK = 24;

/**
 * Shared layout for the legal pages: header, a sticky table of contents (desktop) that
 * highlights the section being read, numbered sections and links to the other legal documents.
 */
@Component({
  selector: 'jvm-legal-document',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule, ScrollRevealDirective],
  templateUrl: './legal-document.component.html',
  styleUrl: './legal-document.component.scss',
})
export class LegalDocumentComponent {
  private readonly scrollService = inject(ScrollService);
  private readonly destroyRef = inject(DestroyRef);

  readonly doc = input.required<LegalDocId>();
  readonly sections = input.required<readonly LegalSection[]>();

  /** The section highlighted in the table of contents; null while in the intro. */
  readonly activeId = signal<string | null>(null);

  readonly headerKeys = computed(() => {
    const doc = this.doc();
    return {
      label: `${doc}.sectionLabel`,
      title: `${doc}.title`,
      updated: `${doc}.lastUpdated`,
      intro: `${doc}.intro`,
    };
  });

  readonly relatedDocs = computed(() => LEGAL_DOCS.filter((d) => d.id !== this.doc()));

  private readonly pageTitle = viewChild.required<ElementRef<HTMLElement>>('pageTitle');
  private readonly sectionTitles = viewChildren<ElementRef<HTMLElement>>('sectionTitle');

  /** After a contents click the clicked item stays highlighted until the reader scrolls by hand. */
  private pinned = false;

  constructor() {
    afterNextRender(() => {
      const listeners = new AbortController();
      const options = { passive: true, signal: listeners.signal };

      window.addEventListener('scroll', () => {
        if (!this.pinned) this.syncActive();
      }, options);
      // Only real input unpins (wheel, touch, keys, scrollbar drag) — the smooth scroll a click starts fires none.
      for (const type of ['wheel', 'touchmove', 'keydown', 'pointerdown']) {
        window.addEventListener(type, () => (this.pinned = false), options);
      }

      this.destroyRef.onDestroy(() => listeners.abort());
      this.syncActive();
    });
  }

  /** In-page jump that clears the fixed navbar; modified clicks still open the link normally. */
  jumpTo(id: string, event: MouseEvent): void {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    this.activeId.set(id);
    this.pinned = true;
    this.scrollService.scrollTo(id);
    // Move focus with the scroll, so keyboard users carry on reading from that section.
    document.getElementById(id)?.focus({ preventScroll: true });
  }

  /**
   * Scrolling down, a section lights up once its heading reaches the top; scrolling up, the
   * previous one lights up only once its heading comes back into view — in between nothing moves.
   * Anchor 0 is the page title (the intro: nothing highlighted), anchors 1…n the section headings.
   */
  private syncActive(): void {
    const anchors = [this.pageTitle(), ...this.sectionTitles()];
    const tops = anchors.map((ref) => ref.nativeElement.getBoundingClientRect().top);
    const passed = this.lastPassed(tops);
    const inView = this.topmostInView(tops);
    // Never behind a heading that has reached the top, never ahead of the topmost one in view.
    const index = Math.min(Math.max(this.activeIndex(), passed), Math.max(inView, passed));
    this.activeId.set(index > 0 ? this.sections()[index - 1].id : null);
  }

  /**
   * The last heading that has reached the top line. Near the page end the last headings can't
   * scroll that high, so the line slides down to meet them — each still gets its turn in order,
   * and the last one lands at the very bottom.
   */
  private lastPassed(tops: readonly number[]): number {
    const topLine = this.scrollService.topOffset + HEADING_SLACK;
    const remaining = Math.max(0, document.documentElement.scrollHeight - window.innerHeight - window.scrollY);
    // How far below the top line the last heading will still sit once the page can't scroll further
    const shortfall = tops[tops.length - 1] - remaining - topLine;
    const line = topLine + Math.max(0, shortfall - remaining);

    let index = 0;
    tops.forEach((top, i) => {
      if (top <= line + 1) index = i; // +1px for sub-pixel positions
    });
    return index;
  }

  /** The topmost heading visible under the navbar — or, if the next one is still below the screen, the one we're inside. */
  private topmostInView(tops: readonly number[]): number {
    const firstBelowNavbar = tops.findIndex((top) => top >= this.scrollService.navbarHeight);
    if (firstBelowNavbar < 0) return tops.length - 1;
    return tops[firstBelowNavbar] < window.innerHeight ? firstBelowNavbar : Math.max(0, firstBelowNavbar - 1);
  }

  private activeIndex(): number {
    const id = this.activeId();
    return id ? this.sections().findIndex((s) => s.id === id) + 1 : 0;
  }
}
