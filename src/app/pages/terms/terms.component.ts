import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LegalDocumentComponent } from '../../components/legal-document/legal-document.component';
import { legalSection } from '../../components/legal-document/legal-document.model';

@Component({
  selector: 'jvm-terms',
  standalone: true,
  imports: [LegalDocumentComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './terms.component.html',
})
export class TermsComponent {
  readonly sections = [
    legalSection('terms', 'provider', ['p']),
    legalSection('terms', 'scope', ['p', 'p']),
    legalSection('terms', 'contract', ['p', 'p']),
    legalSection('terms', 'pricing', ['p', 6]),
    legalSection('terms', 'cooperation', ['p', 'p']),
    legalSection('terms', 'ip', ['p', 'p']),
    legalSection('terms', 'warranty', ['p', 'p']),
    legalSection('terms', 'liability', ['p', 'p']),
    legalSection('terms', 'confidentiality', ['p']),
    legalSection('terms', 'termination', ['p', 'p']),
    legalSection('terms', 'website', ['p', 'p']),
    legalSection('terms', 'licenses', ['p', 3], [
      { labelKey: 'terms.licenses.fontsLink', href: '/licenses/fonts.txt' },
      { labelKey: 'terms.licenses.softwareLink', href: '/3rdpartylicenses.txt' },
    ]),
    legalSection('terms', 'disputes', ['p', 'p']),
    legalSection('terms', 'changes', ['p']),
  ];
}
