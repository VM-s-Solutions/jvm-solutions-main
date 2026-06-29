import { Component, inject, NgZone, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter, fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ScrollService } from './services/scroll.service';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'jvm-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly scrollService = inject(ScrollService);
  private readonly ngZone = inject(NgZone);

  readonly showScrollTop = signal(false);

  constructor() {
    this.ngZone.runOutsideAngular(() => {
      fromEvent(window, 'scroll')
        .pipe(takeUntilDestroyed())
        .subscribe(() => this.showScrollTop.set(window.scrollY > 400));
    });

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
