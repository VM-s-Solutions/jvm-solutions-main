import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
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
  imports: [ScrollRevealDirective, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss',
})
export class PortfolioComponent {
  readonly projects: Project[] = [
    {
      id: 'fintech-dashboard',
      titleKey: 'portfolio.fintech.title',
      descriptionKey: 'portfolio.fintech.description',
      tags: ['Angular', 'Node.js', 'PostgreSQL', 'AI'],
      categoryKey: 'portfolio.fintech.category',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #4F46E5 100%)',
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
      id: 'ecommerce',
      titleKey: 'portfolio.ecommerce.title',
      descriptionKey: 'portfolio.ecommerce.description',
      tags: ['React', 'GraphQL', 'Microservices'],
      categoryKey: 'portfolio.ecommerce.category',
      gradient: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
    },
  ];
}
