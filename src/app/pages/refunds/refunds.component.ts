import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { LegalDocumentComponent } from '../../components/legal-document/legal-document.component';
import { legalSection, mailtoHref } from '../../components/legal-document/legal-document.model';

@Component({
  selector: 'jvm-refunds',
  standalone: true,
  imports: [LegalDocumentComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './refunds.component.html',
})
export class RefundsComponent {
  private readonly requestSubject = toSignal(inject(TranslateService).stream('refunds.request.subject'), {
    initialValue: '',
  });

  // Rebuilt only on a language switch — the refund mailto carries a translated subject.
  readonly sections = computed(() => [
    legalSection('refunds', 'payments', ['p', 'p']),
    legalSection('refunds', 'projects', ['p', 3]),
    legalSection('refunds', 'monthly', ['p', 'p']),
    legalSection('refunds', 'consulting', ['p']),
    legalSection('refunds', 'consumers', ['p', 'p']),
    legalSection('refunds', 'warranty', ['p']),
    legalSection('refunds', 'request', ['p', 3, 'p'], [
      { labelKey: 'refunds.request.action', href: mailtoHref(this.requestSubject()) },
    ]),
  ]);
}
