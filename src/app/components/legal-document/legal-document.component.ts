import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { ScrollService } from '../../services/scroll.service';
import { LEGAL_DOCS, LegalDocId, LegalSection } from './legal-document.model';

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

  /** The section highlighted in the table of contents. */
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

  /** After a contents click the clicked item stays highlighted until the reader scrolls by hand. */
  private pinned = false;

  constructor() {
    afterNextRender(() => {
      const listeners = new AbortController();
      const options = { passive: true, signal: listeners.signal };

      window.addEventListener('scroll', () => {
        if (!this.pinned) this.activeId.set(this.sectionAtReadingLine());
      }, options);
      // Only real input unpins (wheel, touch, keys, scrollbar drag) — the smooth scroll a click starts fires none.
      for (const type of ['wheel', 'touchmove', 'keydown', 'pointerdown']) {
        window.addEventListener(type, () => (this.pinned = false), options);
      }

      this.destroyRef.onDestroy(() => listeners.abort());
      this.activeId.set(this.sectionAtReadingLine());
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

  /** The last section whose heading has passed the top third of the screen; none while in the intro. */
  private sectionAtReadingLine(): string | null {
    const line = window.innerHeight / 3;
    let active: string | null = null;
    for (const { id } of this.sections()) {
      const heading = document.getElementById(id);
      if (!heading || heading.getBoundingClientRect().top > line) break;
      active = id;
    }
    return active;
  }
}
