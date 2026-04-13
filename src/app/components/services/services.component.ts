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
        icon: safe(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`),
        tags: ['Angular', 'React', 'TypeScript', 'SCSS'],
        accent: 'purple',
      },
      {
        id: 'backend',
        titleKey: 'services.backend.title',
        descriptionKey: 'services.backend.description',
        icon: safe(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></svg>`),
        tags: ['.NET', 'C#', 'PostgreSQL', 'Docker'],
        accent: 'green',
      },
      {
        id: 'mobile',
        titleKey: 'services.mobile.title',
        descriptionKey: 'services.mobile.description',
        icon: safe(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18" stroke-width="2.5" stroke-linecap="round"/></svg>`),
        tags: ['Flutter', 'Swift', 'iOS', 'Android'],
        accent: 'purple',
      },
      {
        id: 'ai',
        titleKey: 'services.ai.title',
        descriptionKey: 'services.ai.description',
        icon: safe(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 0 6h-1v1a4 4 0 0 1-8 0v-1H7a3 3 0 0 1 0-6h1V6a4 4 0 0 1 4-4z"/><circle cx="9" cy="9" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="1" fill="currentColor" stroke="none"/></svg>`),
        tags: ['OpenAI', 'LangChain', 'Python', 'Agents'],
        accent: 'green',
      },
    ];
  }
}
