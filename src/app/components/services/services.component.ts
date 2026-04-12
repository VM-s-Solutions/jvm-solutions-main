import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

interface Service {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: SafeHtml;
  tags: string[];
  accent: 'purple' | 'green';
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [ScrollRevealDirective, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss',
})
export class ServicesComponent {
  readonly services: Service[];

  constructor(private sanitizer: DomSanitizer) {
    const safe = (svg: string) => sanitizer.bypassSecurityTrustHtml(svg);

    this.services = [
      {
        id: 'frontend',
        titleKey: 'services.frontend.title',
        descriptionKey: 'services.frontend.description',
        icon: safe(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`),
        tags: ['Angular', 'React', 'TypeScript', 'SCSS'],
        accent: 'purple',
      },
      {
        id: 'backend',
        titleKey: 'services.backend.title',
        descriptionKey: 'services.backend.description',
        icon: safe(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></svg>`),
        tags: ['.NET', 'C#', 'PostgreSQL', 'Docker'],
        accent: 'green',
      },
      {
        id: 'mobile',
        titleKey: 'services.mobile.title',
        descriptionKey: 'services.mobile.description',
        icon: safe(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18" stroke-width="2.5" stroke-linecap="round"/></svg>`),
        tags: ['Swift', 'Kotlin', 'iOS', 'Android'],
        accent: 'purple',
      },
      {
        id: 'ai',
        titleKey: 'services.ai.title',
        descriptionKey: 'services.ai.description',
        icon: safe(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>`),
        tags: ['OpenAI', 'LangChain', 'Python', 'Agents'],
        accent: 'green',
      },
    ];
  }
}
