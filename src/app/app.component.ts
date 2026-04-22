import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter, fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ScrollService } from './services/scroll.service';
import { SmoothScrollService } from './services/smooth-scroll.service';
import { ScrollFlareComponent } from './components/scroll-flare/scroll-flare.component';

@Component({
  selector: 'jvm-root',
  imports: [RouterOutlet, ScrollFlareComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly scrollService = inject(ScrollService);
  private readonly smoothScroll = inject(SmoothScrollService);

  readonly showScrollTop = signal(false);

  constructor() {
    this.smoothScroll.init();

    fromEvent(window, 'scroll')
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.showScrollTop.set(window.scrollY > 400));

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => {
        const fragment = this.scrollService.consume();
        if (fragment) {
          setTimeout(() => this.scrollService.scrollTo(fragment), 80);
        }
      });
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
