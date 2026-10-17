import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, NgZone, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LogoComponent } from '../logo/logo.component';
import { ScrollService } from '../../services/scroll.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'jvm-navbar',
  standalone: true,
  imports: [LogoComponent, RouterLink, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.scrolled]': 'scrolled()',
    '[class.menu-open]': 'menuOpen()',
    '(document:keydown.escape)': 'closeOnEscape()',
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
  readonly menuOpen = signal(false);
  readonly langDropdownOpen = signal(false);

  private readonly elementRef = inject(ElementRef);
  private readonly langTrigger = viewChild.required<ElementRef<HTMLButtonElement>>('langTrigger');
  private readonly menuTrigger = viewChild.required<ElementRef<HTMLButtonElement>>('menuTrigger');

  readonly languages = [
    { code: 'en', label: 'EN' },
    { code: 'cs', label: 'CS' },
    { code: 'sk', label: 'SK' },
    { code: 'uk', label: 'UK' },
  ];

  private readonly lang = toSignal(this.translate.onLangChange, { initialValue: null });
  readonly currentLangLabel = computed(() => (this.lang()?.lang ?? this.translate.currentLang).toUpperCase());
  readonly themeToggleLabelKey = computed(() =>
    this.themeService.theme() === 'dark' ? 'a11y.themeToLight' : 'a11y.themeToDark',
  );

  readonly navLinks: { label: string; fragment?: string; routerLink?: string }[] = [
    { label: 'nav.services', fragment: 'services' },
    { label: 'nav.pricing', routerLink: '/pricing' },
    { label: 'nav.about', routerLink: '/about' },
    { label: 'nav.faq', routerLink: '/faq' },
  ];

  constructor() {
    afterNextRender(() => {
      let lastY = window.scrollY;

      // Listener is registered outside NgZone to avoid Zone.js tracking overhead
      // on every scroll event. Signal writes are batched inside ngZone.run() only
      // when values actually change, so CD is triggered reliably on all pages
      // regardless of whether an IntersectionObserver or other Zone task has fired.
      this.ngZone.runOutsideAngular(() => {
      const onScroll = () => {
        const y = window.scrollY;
        lastY = y;

        const nextScrolled = y > 32;

        if (nextScrolled !== this.scrolled()) {
          this.ngZone.run(() => {
            this.scrolled.set(nextScrolled);
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
    this.menuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  /** Escape closes whichever menu is open and hands focus back to the button that opened it. */
  closeOnEscape(): void {
    if (this.langDropdownOpen()) {
      this.langDropdownOpen.set(false);
      this.langTrigger().nativeElement.focus();
    } else if (this.menuOpen()) {
      this.menuOpen.set(false);
      this.menuTrigger().nativeElement.focus();
    }
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
