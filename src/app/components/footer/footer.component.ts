import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LEGAL_DOCS } from '../legal-document/legal-document.model';
import { LogoComponent } from '../logo/logo.component';
import { LANGS, Lang, LangService } from '../../services/lang.service';

@Component({
  selector: 'jvm-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule, LogoComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  private readonly lang = inject(LangService);

  protected readonly year = new Date().getFullYear();
  protected readonly legalDocs = LEGAL_DOCS;
  protected readonly langs = LANGS;
  protected readonly current = this.lang.current;

  protected readonly links = [
    { path: '/services', labelKey: 'nav.services' },
    { path: '/pricing', labelKey: 'nav.pricing' },
    { path: '/about', labelKey: 'nav.about' },
    { path: '/faq', labelKey: 'nav.faq' },
    { path: '/contact', labelKey: 'nav.message' },
  ] as const;

  choose(code: Lang): void {
    this.lang.use(code);
  }
}
