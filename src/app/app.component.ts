import { Component, DOCUMENT, inject, NgZone, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter, fromEvent, map, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ScrollService } from './services/scroll.service';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'jvm-root',
  imports: [RouterOutlet, NavbarComponent, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly scrollService = inject(ScrollService);
  private readonly ngZone = inject(NgZone);
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);

  readonly showScrollTop = signal(false);

  constructor() {
    this.ngZone.runOutsideAngular(() => {
      fromEvent(window, 'scroll')
        .pipe(takeUntilDestroyed())
        .subscribe(() => this.showScrollTop.set(window.scrollY > 400));
    });

    // Screen readers pick pronunciation from <html lang>, so it must follow the language switcher.
    this.translate.onLangChange
      .pipe(map(e => e.lang), startWith(this.translate.currentLang), takeUntilDestroyed())
      .subscribe(lang => (this.document.documentElement.lang = lang));

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => {
        const fragment = this.scrollService.consume();
        if (fragment) {
          setTimeout(() => this.scrollService.scrollTo(fragment), 80);
        }
      });
  }

  skipToContent(event: MouseEvent): void {
    event.preventDefault();
    const main = this.document.getElementById('main-content');
    if (!main) return;
    main.tabIndex = -1;
    main.focus();
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
