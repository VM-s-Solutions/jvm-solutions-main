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
  liveUrl?: string;
  isMvp?: boolean;
  thumbUrl?: string;
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
      liveUrl: 'https://vedos-app.jvm-solutions.dev/dashboard',
      isMvp: true,
      thumbUrl: '/images/portfolio/vedos.svg',
    },
    {
      id: 'omida',
      titleKey: 'portfolio.omida.title',
      descriptionKey: 'portfolio.omida.description',
      tags: ['Angular', 'Angular Material', 'Leaflet', 'SCSS'],
      categoryKey: 'portfolio.omida.category',
      gradient: 'linear-gradient(135deg, #2B2A29 0%, #d5d913 100%)',
      liveUrl: 'https://omida-app.jvm-solutions.dev/dashboard',
      isMvp: true,
      thumbUrl: '/images/portfolio/omida.svg',
    },
    {
      id: 'jp-immobilien',
      titleKey: 'portfolio.jp.title',
      descriptionKey: 'portfolio.jp.description',
      tags: ['Angular', 'Angular Material', 'TypeScript', 'SCSS'],
      categoryKey: 'portfolio.jp.category',
      gradient: 'linear-gradient(135deg, #0A2540 0%, #C8A15A 100%)',
      liveUrl: 'https://jp-immobilien-app.jvm-solutions.dev',
      isMvp: true,
      thumbUrl: '/images/portfolio/jp-immobilien.svg',
    },
    {
      id: 'karimpol',
      titleKey: 'portfolio.karimpol.title',
      descriptionKey: 'portfolio.karimpol.description',
      tags: ['Angular', 'Angular Material', 'TypeScript', 'SCSS'],
      categoryKey: 'portfolio.karimpol.category',
      gradient: 'linear-gradient(135deg, #0D0D0D 0%, #0073B7 100%)',
      liveUrl: 'https://karimpol-app.jvm-solutions.dev',
      isMvp: true,
      thumbUrl: '/images/portfolio/karimpol.svg',
    },
  ];
}
