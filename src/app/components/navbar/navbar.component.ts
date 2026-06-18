import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, NgZone, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ScrollService } from '../../services/scroll.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'jvm-navbar',
  standalone: true,
  imports: [RouterLink, TranslateModule, UpperCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.scrolled]': 'scrolled()',
    '[class.is-hidden]': 'hidden()',
  },
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  readonly translate = inject(TranslateService);
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly scrollService = inject(ScrollService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);

  readonly scrolled = signal(false);
  readonly hidden = signal(false);
  readonly menuOpen = signal(false);
  readonly langDropdownOpen = signal(false);

  private readonly elementRef = inject(ElementRef);

  readonly languages = [
    { code: 'en', label: 'EN' },
    { code: 'cs', label: 'CS' },
    { code: 'sk', label: 'SK' },
    { code: 'uk', label: 'UK' },
  ];

  readonly navLinks: { label: string; fragment?: string; routerLink?: string }[] = [
    { label: 'nav.services', fragment: 'services' },
    { label: 'nav.pricing', routerLink: '/pricing' },
    { label: 'nav.about', routerLink: '/about' },
    { label: 'nav.faq', routerLink: '/faq' },
  ];

  constructor() {
    const SUPPORTED = ['en', 'cs', 'sk', 'uk'];
    const saved = localStorage.getItem('lang');
    const browser = navigator.language.split('-')[0].toLowerCase();
    const lang = (saved && SUPPORTED.includes(saved))
      ? saved
      : (SUPPORTED.includes(browser) ? browser : 'en');
    this.translate.setDefaultLang('en');
    this.translate.use(lang);

    afterNextRender(() => {
      let lastY = window.scrollY;

      // Listener is registered outside NgZone to avoid Zone.js tracking overhead
      // on every scroll event. Signal writes are batched inside ngZone.run() only
      // when values actually change, so CD is triggered reliably on all pages
      // regardless of whether an IntersectionObserver or other Zone task has fired.
      this.ngZone.runOutsideAngular(() => {
      const onScroll = () => {
        const y = window.scrollY;
        const delta = y - lastY;
        lastY = y;

        const nextScrolled = y > 32;
        let nextHidden = this.hidden();
        if (y <= 60) {
          nextHidden = false;
        } else if (!this.menuOpen() && y > 120 && delta > 6) {
          nextHidden = true;
        } else if (delta < -6) {
          nextHidden = false;
        }

        if (nextScrolled !== this.scrolled() || nextHidden !== this.hidden()) {
          this.ngZone.run(() => {
            this.scrolled.set(nextScrolled);
            this.hidden.set(nextHidden);
          });
        }
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      this.destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));

      const onDocClick = (e: MouseEvent) => {
        if (!this.elementRef.nativeElement.contains(e.target as Node)) {
          if (this.langDropdownOpen()) {
            this.langDropdownOpen.set(false);
          }
        }
      };
      document.addEventListener('click', onDocClick);
      this.destroyRef.onDestroy(() => document.removeEventListener('click', onDocClick));
      }); // end runOutsideAngular
    });
  }

  toggleMenu(): void {
    const next = !this.menuOpen();
    this.menuOpen.set(next);
    if (next) this.hidden.set(false);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  toggleLangDropdown(): void {
    this.langDropdownOpen.update(v => !v);
  }

  selectLang(code: string): void {
    this.switchLang(code);
    this.langDropdownOpen.set(false);
  }

  switchLang(code: string): void {
    this.translate.use(code);
    localStorage.setItem('lang', code);
  }

  scrollToSection(fragment: string, event: MouseEvent): void {
    event.preventDefault();
    this.closeMenu();
    const isHome = this.router.url === '/' || this.router.url === '';
    if (isHome) {
      this.scrollService.scrollTo(fragment);
    } else {
      this.scrollService.schedule(fragment);
      this.router.navigate(['']);
    }
  }
}
