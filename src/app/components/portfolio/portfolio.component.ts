import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

interface Project {
  id: string;
  titleKey: string;
  descriptionKey: string;
  tags: string[];
  categoryKey: string;
  gradient: string;
}

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [ScrollRevealDirective, TranslateModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss',
})
export class PortfolioComponent {
  readonly projects: Project[] = [
    {
      id: 'vedos',
      titleKey: 'portfolio.vedos.title',
      descriptionKey: 'portfolio.vedos.description',
      tags: ['Angular', 'Material Design 3', '.NET', 'Azure'],
      categoryKey: 'portfolio.vedos.category',
      gradient: 'linear-gradient(135deg, #E30613 0%, #9B1C1C 100%)',
    },
    {
      id: 'logistics-app',
      titleKey: 'portfolio.logistics.title',
      descriptionKey: 'portfolio.logistics.description',
      tags: ['Flutter', 'Firebase', 'Maps API'],
      categoryKey: 'portfolio.logistics.category',
      gradient: 'linear-gradient(135deg, #10B981 0%, #0891B2 100%)',
    },
    {
      id: 'ai-automation',
      titleKey: 'portfolio.ai.title',
      descriptionKey: 'portfolio.ai.description',
      tags: ['Python', 'OpenAI', 'LangChain', 'FastAPI'],
      categoryKey: 'portfolio.ai.category',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    },
    {
      id: 'fintech-dashboard',
      titleKey: 'portfolio.fintech.title',
      descriptionKey: 'portfolio.fintech.description',
      tags: ['Angular', '.NET', 'PostgreSQL', 'AI'],
      categoryKey: 'portfolio.fintech.category',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #4F46E5 100%)',
    },
  ];
}
