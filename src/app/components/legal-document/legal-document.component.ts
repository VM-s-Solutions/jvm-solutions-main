import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { ScrollService } from '../../services/scroll.service';
import { LEGAL_DOCS, LegalDocId, LegalSection } from './legal-document.model';

/**
 * Shared layout for the legal pages: header, a sticky table of contents (desktop),
 * numbered sections and links to the other legal documents.
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

  readonly doc = input.required<LegalDocId>();
  readonly sections = input.required<readonly LegalSection[]>();

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

  /** In-page jump that clears the fixed navbar; modified clicks still open the link normally. */
  jumpTo(id: string, event: MouseEvent): void {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    this.scrollService.scrollTo(id);
    // Move focus with the scroll, so keyboard users carry on reading from that section.
    document.getElementById(id)?.focus({ preventScroll: true });
  }
}
