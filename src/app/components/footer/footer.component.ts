import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollService } from '../../services/scroll.service';

interface FooterLink {
  label: string;
  fragment?: string;
  routerLink?: string;
}

@Component({
  selector: 'jvm-footer',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  private readonly router = inject(Router);
  private readonly scrollService = inject(ScrollService);

  readonly year = new Date().getFullYear();

  readonly footerLinks: FooterLink[] = [
    { label: 'nav.services', fragment: 'services' },
    { label: 'nav.pricing',  routerLink: '/pricing' },
    { label: 'nav.about',    routerLink: '/about' },
  ];

  scrollToSection(fragment: string, event: MouseEvent): void {
    event.preventDefault();
    const isHome = this.router.url === '/' || this.router.url === '';
    if (isHome) {
      this.scrollService.scrollTo(fragment);
    } else {
      this.scrollService.schedule(fragment);
      this.router.navigate(['']);
    }
  }
}
