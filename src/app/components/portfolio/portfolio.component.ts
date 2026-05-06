import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, signal, untracked } from '@angular/core';
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
  hasCaseStudy?: boolean;
}

@Component({
  selector: 'jvm-portfolio',
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
      liveUrl: 'https://vedos-app.jvm-yore.com/dashboard',
      isMvp: true,
      thumbUrl: '/images/portfolio/vedos.svg',
      hasCaseStudy: true,
    },
    {
      id: 'omida',
      titleKey: 'portfolio.omida.title',
      descriptionKey: 'portfolio.omida.description',
      tags: ['Angular', 'Angular Material', 'Leaflet', 'SCSS'],
      categoryKey: 'portfolio.omida.category',
      gradient: 'linear-gradient(135deg, #2B2A29 0%, #d5d913 100%)',
      liveUrl: 'https://omida-app.jvm-yore.com/dashboard',
      isMvp: true,
      thumbUrl: '/images/portfolio/omida.svg',
      hasCaseStudy: true,
    },
    {
      id: 'jp-immobilien',
      titleKey: 'portfolio.jp.title',
      descriptionKey: 'portfolio.jp.description',
      tags: ['Angular', 'Angular Material', 'TypeScript', 'SCSS'],
      categoryKey: 'portfolio.jp.category',
      gradient: 'linear-gradient(135deg, #0A2540 0%, #C8A15A 100%)',
      liveUrl: 'https://jp-immobilien-app.jvm-yore.com',
      isMvp: true,
      thumbUrl: '/images/portfolio/jp-immobilien.svg',
      hasCaseStudy: true,
    },
    {
      id: 'karimpol',
      titleKey: 'portfolio.karimpol.title',
      descriptionKey: 'portfolio.karimpol.description',
      tags: ['Angular', 'Angular Material', 'TypeScript', 'SCSS'],
      categoryKey: 'portfolio.karimpol.category',
      gradient: 'linear-gradient(135deg, #0D0D0D 0%, #0073B7 100%)',
      liveUrl: 'https://karimpol-app.jvm-yore.com',
      isMvp: true,
      thumbUrl: '/images/portfolio/karimpol.svg',
      hasCaseStudy: true,
    },
    {
      id: 'neovize',
      titleKey: 'portfolio.neovize.title',
      descriptionKey: 'portfolio.neovize.description',
      tags: ['Angular', 'TypeScript', 'SCSS'],
      categoryKey: 'portfolio.neovize.category',
      gradient: 'linear-gradient(135deg, #1E5AA8 0%, #0D9488 100%)',
      liveUrl: 'https://neovize-app.jvm-yore.com/portal/preop',
      isMvp: true,
      thumbUrl: '/images/portfolio/neovize.svg',
      hasCaseStudy: true,
    },
    {
      id: 'adentics',
      titleKey: 'portfolio.adentics.title',
      descriptionKey: 'portfolio.adentics.description',
      tags: ['Angular', 'TypeScript', 'Azure Static Web Apps', 'SCSS'],
      categoryKey: 'portfolio.adentics.category',
      gradient: 'linear-gradient(135deg, #0F4C5C 0%, #C9A96E 100%)',
      liveUrl: 'https://swa-adentics-app.jvm-yore.com/cross-site',
      isMvp: true,
      thumbUrl: '/images/portfolio/adentics.svg',
      hasCaseStudy: true,
    },
  ];

  private readonly destroyRef = inject(DestroyRef);
  readonly cardsPerSlide = signal(2);
  readonly currentIndex = signal(0);
  readonly swipeHintVisible = signal(false);

  private autoplayId: ReturnType<typeof setInterval> | null = null;
  private resumeTimerId: ReturnType<typeof setTimeout> | null = null;
  private touchStartX = 0;
  private touchStartY = 0;

  readonly slides = computed(() => {
    const cpp = this.cardsPerSlide();
    const result: Project[][] = [];
    for (let i = 0; i < this.projects.length; i += cpp) {
      result.push(this.projects.slice(i, i + cpp));
    }
    return result;
  });

  readonly trackWidth = computed(() => `${this.slides().length * 100}%`);
  readonly slideFlex = computed(() => `0 0 ${100 / this.slides().length}%`);

  readonly trackTransform = computed(
    () => `translateX(-${(this.currentIndex() / this.slides().length) * 100}%)`
  );

  constructor() {
    afterNextRender(() => {
      const mq = window.matchMedia('(min-width: 1024px)');
      this.cardsPerSlide.set(mq.matches ? 2 : 1);
      const handler = () => this.cardsPerSlide.set(mq.matches ? 2 : 1);
      mq.addEventListener('change', handler);

      if (!mq.matches) {
        this.swipeHintVisible.set(true);
        const timer = setTimeout(() => this.swipeHintVisible.set(false), 4000);
        this.destroyRef.onDestroy(() => clearTimeout(timer));
      }

      this.resumeAutoplay();
      this.destroyRef.onDestroy(() => this.pauseAutoplay());

      this.destroyRef.onDestroy(() => mq.removeEventListener('change', handler));
    });
    effect(() => {
      const slideCount = this.slides().length;
      if (untracked(this.currentIndex) >= slideCount) {
        this.currentIndex.set(0);
      }
    });
  }

  private advance(): void {
    this.currentIndex.update(i => (i + 1) % this.slides().length);
  }

  next(): void {
    this.currentIndex.update(i => (i + 1) % this.slides().length);
    this.pauseTemporarily(30_000);
  }

  prev(): void {
    this.currentIndex.update(i => (i - 1 + this.slides().length) % this.slides().length);
    this.pauseTemporarily(30_000);
  }

  goTo(index: number): void {
    this.currentIndex.set(index);
    this.pauseTemporarily(30_000);
  }

  onTouchStart(e: TouchEvent): void {
    this.swipeHintVisible.set(false);
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
  }

  onTouchEnd(e: TouchEvent): void {
    const dx = e.changedTouches[0].clientX - this.touchStartX;
    const dy = e.changedTouches[0].clientY - this.touchStartY;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
      dx < 0 ? this.next() : this.prev();
    }
  }

  pauseAutoplay(): void {
    if (this.autoplayId !== null) {
      clearInterval(this.autoplayId);
      this.autoplayId = null;
    }
    if (this.resumeTimerId !== null) {
      clearTimeout(this.resumeTimerId);
      this.resumeTimerId = null;
    }
  }

  resumeAutoplay(): void {
    this.pauseAutoplay();
    this.autoplayId = setInterval(() => this.advance(), 5000);
  }

  private pauseTemporarily(ms: number): void {
    this.pauseAutoplay();
    this.resumeTimerId = setTimeout(() => this.resumeAutoplay(), ms);
  }
}
