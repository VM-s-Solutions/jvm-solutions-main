import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, HostListener, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ScrollService } from '../../services/scroll.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, OnDestroy {
  scrolled = signal(false);
  menuOpen = signal(false);

  readonly languages = [
    { code: 'en', label: 'EN' },
    { code: 'cs', label: 'CS' },
    { code: 'sk', label: 'SK' },
    { code: 'uk', label: 'UK' },
  ];

  constructor(public translate: TranslateService, private router: Router, private scrollService: ScrollService) {
    const saved = localStorage.getItem('lang');
    const lang = saved && ['en', 'cs', 'sk', 'uk'].includes(saved) ? saved : 'en';
    translate.setDefaultLang('en');
    translate.use(lang);
  }

  ngOnInit() {
    this.onScroll();
  }

  ngOnDestroy() {}

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 32);
  }

  toggleMenu() {
    this.menuOpen.update(v => !v);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }

  switchLang(code: string) {
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

  readonly navLinks: { label: string; fragment?: string; routerLink?: string }[] = [
    { label: 'nav.services', fragment: 'services' },
    { label: 'nav.work', fragment: 'portfolio' },
    { label: 'nav.testimonials', fragment: 'testimonials' },
    { label: 'nav.pricing', routerLink: '/pricing' },
    { label: 'nav.about', routerLink: '/about' },
  ];
}
