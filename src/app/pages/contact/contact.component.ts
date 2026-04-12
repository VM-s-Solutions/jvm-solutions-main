import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ContactService } from '../../services/contact.service';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NavbarComponent, FooterComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  form: FormGroup;
  status = signal<FormStatus>('idle');

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
    private contactService: ContactService
  ) {
    this.form = this.fb.group({
      name:    ['', [Validators.required, Validators.minLength(2)]],
      email:   ['', [Validators.required, Validators.email]],
      company: [''],
      service: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(20)]],
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

    this.status.set('submitting');

    this.contactService.send(this.form.value).subscribe({
      next: () => {
        this.status.set('success');
        this.form.reset();
      },
      error: () => {
        this.status.set('error');
      },
    });
  }

  reset() {
    this.status.set('idle');
  }
}
