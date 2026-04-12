import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  readonly year = new Date().getFullYear();

  readonly footerLinks = [
    { label: 'nav.services', href: '#services' },
    { label: 'nav.work', href: '#portfolio' },
    { label: 'nav.testimonials', href: '#testimonials' },
    { label: 'nav.about', routerLink: '/about' },
    { label: 'nav.contact', routerLink: '/contact' },
  ];
}
