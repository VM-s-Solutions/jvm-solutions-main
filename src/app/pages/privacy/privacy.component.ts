import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { LegalDocumentComponent } from '../../components/legal-document/legal-document.component';
import { legalSection, mailtoHref } from '../../components/legal-document/legal-document.model';

@Component({
  selector: 'jvm-privacy',
  standalone: true,
  imports: [LegalDocumentComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './privacy.component.html',
})
export class PrivacyComponent {
  private readonly deletionSubject = toSignal(inject(TranslateService).stream('privacy.deletion.subject'), {
    initialValue: '',
  });

  // Rebuilt only on a language switch — the deletion mailto carries a translated subject.
  readonly sections = computed(() => [
    legalSection('privacy', 'controller', ['p', 'p']),
    legalSection('privacy', 'data', ['p', 4, 'p']),
    legalSection('privacy', 'purposes', ['p', 4, 'p']),
    legalSection('privacy', 'recipients', ['p', 4, 'p']),
    legalSection('privacy', 'transfers', ['p']),
    legalSection('privacy', 'fonts', ['p']),
    legalSection('privacy', 'cookies', ['p', 3, 'p']),
    legalSection('privacy', 'retention', ['p', 4]),
    legalSection('privacy', 'rights', ['p', 7, 'p']),
    legalSection('privacy', 'deletion', ['p', 'p'], [
      { labelKey: 'privacy.deletion.action', href: mailtoHref(this.deletionSubject()) },
    ]),
    legalSection('privacy', 'changes', ['p']),
  ]);
}
