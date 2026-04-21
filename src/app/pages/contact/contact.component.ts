import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { TurnstileComponent } from '../../components/turnstile/turnstile.component';
import { ContactService } from '../../services/contact.service';
import { environment } from '../../../environments/environment';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

@Component({
  selector: 'jvm-contact',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NavbarComponent, FooterComponent, TranslateModule, TurnstileComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  form: FormGroup;
  status = signal<FormStatus>('idle');
  captchaToken = signal<string | null>(null);
  captchaMissing = signal(false);

  readonly turnstileSiteKey = environment.turnstileSiteKey;
  private readonly turnstile = viewChild(TurnstileComponent);

  readonly serviceOptionKeys = [
    { key: 'contact.services.frontend', value: 'Frontend Development' },
    { key: 'contact.services.backend',  value: 'Backend Systems' },
    { key: 'contact.services.mobile',   value: 'Mobile Application' },
    { key: 'contact.services.ai',       value: 'AI Automation' },
    { key: 'contact.services.fullstack', value: 'Full-stack Product' },
    { key: 'contact.services.other',    value: 'Other' },
  ];

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private translate: TranslateService
  ) {
    this.form = this.fb.group({
      name:    ['', [Validators.required, Validators.minLength(2)]],
      email:   ['', [Validators.required, Validators.email]],
      company: [''],
      service: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(20)]],
      privacy: [false, Validators.requiredTrue],
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.captchaToken()) {
      this.captchaMissing.set(true);
      return;
    }

    this.captchaMissing.set(false);
    this.status.set('submitting');

    this.contactService.send({ ...this.form.value, captchaToken: this.captchaToken()!, lang: this.translate.currentLang }).subscribe({
      next: () => {
        this.status.set('success');
        this.form.reset();
        this.captchaToken.set(null);
      },
      error: () => {
        this.status.set('error');
        this.turnstile()?.reset();
      },
    });
  }

  reset() {
    this.status.set('idle');
    this.captchaMissing.set(false);
    this.turnstile()?.reset();
  }
}
