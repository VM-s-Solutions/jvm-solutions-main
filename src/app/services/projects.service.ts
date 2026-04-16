import { Injectable } from '@angular/core';

export interface Metric {
  value: string;
  labelKey: string;
}

export interface CaseStudy {
  id: string;
  titleKey: string;
  descriptionKey: string;
  subtitleKey: string;
  categoryKey: string;
  tags: string[];
  gradient: string;
  thumbUrl?: string;
  timelineKey: string;
  problemKey: string;
  solutionKey: string;
  metrics: Metric[];
}

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  readonly projects: CaseStudy[] = [
    {
      id: 'fintech-dashboard',
      titleKey: 'portfolio.fintech.title',
      descriptionKey: 'portfolio.fintech.description',
      subtitleKey: 'work.fintech.subtitle',
      categoryKey: 'portfolio.fintech.category',
      tags: ['Angular', '.NET', 'PostgreSQL', 'WebSocket', 'Chart.js'],
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #4F46E5 100%)',
      thumbUrl: '/images/portfolio/fintech.svg',
      timelineKey: 'work.fintech.timeline',
      problemKey: 'work.fintech.problem',
      solutionKey: 'work.fintech.solution',
      metrics: [
        { value: 'work.fintech.metric1Val', labelKey: 'work.fintech.metric1Label' },
        { value: 'work.fintech.metric2Val', labelKey: 'work.fintech.metric2Label' },
        { value: 'work.fintech.metric3Val', labelKey: 'work.fintech.metric3Label' },
      ],
    },
    {
      id: 'logistics-app',
      titleKey: 'portfolio.logistics.title',
      descriptionKey: 'portfolio.logistics.description',
      subtitleKey: 'work.logistics.subtitle',
      categoryKey: 'portfolio.logistics.category',
      tags: ['Flutter', '.NET', 'Firebase', 'Google Maps API', 'iOS', 'Android'],
      gradient: 'linear-gradient(135deg, #10B981 0%, #0891B2 100%)',
      thumbUrl: '/images/portfolio/logistics.svg',
      timelineKey: 'work.logistics.timeline',
      problemKey: 'work.logistics.problem',
      solutionKey: 'work.logistics.solution',
      metrics: [
        { value: 'work.logistics.metric1Val', labelKey: 'work.logistics.metric1Label' },
        { value: 'work.logistics.metric2Val', labelKey: 'work.logistics.metric2Label' },
        { value: 'work.logistics.metric3Val', labelKey: 'work.logistics.metric3Label' },
      ],
    },
    {
      id: 'ai-automation',
      titleKey: 'portfolio.ai.title',
      descriptionKey: 'portfolio.ai.description',
      subtitleKey: 'work.ai.subtitle',
      categoryKey: 'portfolio.ai.category',
      tags: ['Python', 'FastAPI', 'GPT-4', 'LangChain', 'PostgreSQL'],
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
      thumbUrl: '/images/portfolio/ai.svg',
      timelineKey: 'work.ai.timeline',
      problemKey: 'work.ai.problem',
      solutionKey: 'work.ai.solution',
      metrics: [
        { value: 'work.ai.metric1Val', labelKey: 'work.ai.metric1Label' },
        { value: 'work.ai.metric2Val', labelKey: 'work.ai.metric2Label' },
        { value: 'work.ai.metric3Val', labelKey: 'work.ai.metric3Label' },
      ],
    },
    {
      id: 'ecommerce',
      titleKey: 'portfolio.ecommerce.title',
      descriptionKey: 'portfolio.ecommerce.description',
      subtitleKey: 'work.ecommerce.subtitle',
      categoryKey: 'portfolio.ecommerce.category',
      tags: ['React', 'GraphQL', '.NET', 'Microservices', 'CDN'],
      gradient: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
      thumbUrl: '/images/portfolio/ecommerce.svg',
      timelineKey: 'work.ecommerce.timeline',
      problemKey: 'work.ecommerce.problem',
      solutionKey: 'work.ecommerce.solution',
      metrics: [
        { value: 'work.ecommerce.metric1Val', labelKey: 'work.ecommerce.metric1Label' },
        { value: 'work.ecommerce.metric2Val', labelKey: 'work.ecommerce.metric2Label' },
        { value: 'work.ecommerce.metric3Val', labelKey: 'work.ecommerce.metric3Label' },
      ],
    },
    {
      id: 'vedos',
      titleKey: 'portfolio.vedos.title',
      descriptionKey: 'portfolio.vedos.description',
      subtitleKey: 'work.vedos.subtitle',
      categoryKey: 'portfolio.vedos.category',
      tags: ['Angular', 'Material Design 3', '.NET', 'Leaflet', 'Azure Static Web Apps'],
      gradient: 'linear-gradient(135deg, #E30613 0%, #9B1C1C 100%)',
      thumbUrl: '/images/portfolio/vedos.svg',
      timelineKey: 'work.vedos.timeline',
      problemKey: 'work.vedos.problem',
      solutionKey: 'work.vedos.solution',
      metrics: [
        { value: 'work.vedos.metric1Val', labelKey: 'work.vedos.metric1Label' },
        { value: 'work.vedos.metric2Val', labelKey: 'work.vedos.metric2Label' },
        { value: 'work.vedos.metric3Val', labelKey: 'work.vedos.metric3Label' },
      ],
    },
    {
      id: 'omida',
      titleKey: 'portfolio.omida.title',
      descriptionKey: 'portfolio.omida.description',
      subtitleKey: 'work.omida.subtitle',
      categoryKey: 'portfolio.omida.category',
      tags: ['Angular', 'Angular Material', 'Leaflet', 'SCSS'],
      gradient: 'linear-gradient(135deg, #2B2A29 0%, #d5d913 100%)',
      thumbUrl: '/images/portfolio/omida.svg',
      timelineKey: 'work.omida.timeline',
      problemKey: 'work.omida.problem',
      solutionKey: 'work.omida.solution',
      metrics: [
        { value: 'work.omida.metric1Val', labelKey: 'work.omida.metric1Label' },
        { value: 'work.omida.metric2Val', labelKey: 'work.omida.metric2Label' },
        { value: 'work.omida.metric3Val', labelKey: 'work.omida.metric3Label' },
      ],
    },
    {
      id: 'adentics',
      titleKey: 'portfolio.adentics.title',
      descriptionKey: 'portfolio.adentics.description',
      subtitleKey: 'work.adentics.subtitle',
      categoryKey: 'portfolio.adentics.category',
      tags: ['Angular', 'TypeScript', 'Azure Static Web Apps', 'SCSS'],
      gradient: 'linear-gradient(135deg, #0F4C5C 0%, #C9A96E 100%)',
      thumbUrl: '/images/portfolio/adentics.svg',
      timelineKey: 'work.adentics.timeline',
      problemKey: 'work.adentics.problem',
      solutionKey: 'work.adentics.solution',
      metrics: [
        { value: 'work.adentics.metric1Val', labelKey: 'work.adentics.metric1Label' },
        { value: 'work.adentics.metric2Val', labelKey: 'work.adentics.metric2Label' },
        { value: 'work.adentics.metric3Val', labelKey: 'work.adentics.metric3Label' },
      ],
    },
    {
      id: 'neovize',
      titleKey: 'portfolio.neovize.title',
      descriptionKey: 'portfolio.neovize.description',
      subtitleKey: 'work.neovize.subtitle',
      categoryKey: 'portfolio.neovize.category',
      tags: ['Angular', 'TypeScript', 'SCSS'],
      gradient: 'linear-gradient(135deg, #1E5AA8 0%, #0D9488 100%)',
      thumbUrl: '/images/portfolio/neovize.svg',
      timelineKey: 'work.neovize.timeline',
      problemKey: 'work.neovize.problem',
      solutionKey: 'work.neovize.solution',
      metrics: [
        { value: 'work.neovize.metric1Val', labelKey: 'work.neovize.metric1Label' },
        { value: 'work.neovize.metric2Val', labelKey: 'work.neovize.metric2Label' },
        { value: 'work.neovize.metric3Val', labelKey: 'work.neovize.metric3Label' },
      ],
    },
    {
      id: 'jp-immobilien',
      titleKey: 'portfolio.jp.title',
      descriptionKey: 'portfolio.jp.description',
      subtitleKey: 'work.jp.subtitle',
      categoryKey: 'portfolio.jp.category',
      tags: ['Angular', 'Angular Material', 'TypeScript', 'SCSS'],
      gradient: 'linear-gradient(135deg, #0A2540 0%, #C8A15A 100%)',
      thumbUrl: '/images/portfolio/jp-immobilien.svg',
      timelineKey: 'work.jp.timeline',
      problemKey: 'work.jp.problem',
      solutionKey: 'work.jp.solution',
      metrics: [
        { value: 'work.jp.metric1Val', labelKey: 'work.jp.metric1Label' },
        { value: 'work.jp.metric2Val', labelKey: 'work.jp.metric2Label' },
        { value: 'work.jp.metric3Val', labelKey: 'work.jp.metric3Label' },
      ],
    },
    {
      id: 'karimpol',
      titleKey: 'portfolio.karimpol.title',
      descriptionKey: 'portfolio.karimpol.description',
      subtitleKey: 'work.karimpol.subtitle',
      categoryKey: 'portfolio.karimpol.category',
      tags: ['Angular', 'Angular Material', 'TypeScript', 'SCSS'],
      gradient: 'linear-gradient(135deg, #0D0D0D 0%, #0073B7 100%)',
      thumbUrl: '/images/portfolio/karimpol.svg',
      timelineKey: 'work.karimpol.timeline',
      problemKey: 'work.karimpol.problem',
      solutionKey: 'work.karimpol.solution',
      metrics: [
        { value: 'work.karimpol.metric1Val', labelKey: 'work.karimpol.metric1Label' },
        { value: 'work.karimpol.metric2Val', labelKey: 'work.karimpol.metric2Label' },
        { value: 'work.karimpol.metric3Val', labelKey: 'work.karimpol.metric3Label' },
      ],
    },
  ];

  getById(id: string): CaseStudy | undefined {
    return this.projects.find(p => p.id === id);
  }
}
