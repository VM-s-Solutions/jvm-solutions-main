import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ScrollService } from '../../services/scroll.service';

@Component({
  selector: 'jvm-navbar',
  standalone: true,
  imports: [RouterLink, TranslateModule],
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
  private readonly router = inject(Router);
  private readonly scrollService = inject(ScrollService);
  private readonly destroyRef = inject(DestroyRef);

  readonly scrolled = signal(false);
  readonly hidden = signal(false);
  readonly menuOpen = signal(false);

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

      const onScroll = () => {
        const y = window.scrollY;
        const delta = y - lastY;
        lastY = y;

        this.scrolled.set(y > 32);

        if (y <= 60) {
          this.hidden.set(false);
        } else if (!this.menuOpen() && y > 120 && delta > 6) {
          this.hidden.set(true);
        } else if (delta < -6) {
          this.hidden.set(false);
        }
      };

      window.addEventListener('scroll', onScroll, { passive: true });

      this.destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));
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
