import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  initials: string;
}

interface ClientLogo {
  name: string;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [ScrollRevealDirective, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss',
})
export class TestimonialsComponent {
  readonly testimonials: Testimonial[] = [
    {
      quote: 'JVM Solutions transformed our internal tooling from a bottleneck into a competitive advantage. The team delivered ahead of schedule with incredible attention to detail.',
      author: 'Martin Kovář',
      role: 'CTO',
      company: 'Nexera Systems',
      initials: 'MK',
    },
    {
      quote: 'The mobile app they built for us exceeded every benchmark. Real, thoughtful engineering — not just code pushed out the door. We\'ve partnered with them ever since.',
      author: 'Tereza Nováková',
      role: 'Product Lead',
      company: 'Orbidal',
      initials: 'TN',
    },
    {
      quote: 'Their AI automation work saved our team roughly 30 hours per week in document processing. The ROI was visible within the first month of deployment.',
      author: 'Pavel Horák',
      role: 'Operations Director',
      company: 'SupplyBridge',
      initials: 'PH',
    },
  ];

  readonly clients: ClientLogo[] = [
    { name: 'TechVenture' },
    { name: 'Nexera' },
    { name: 'Orbidal' },
    { name: 'SupplyBridge' },
    { name: 'Luminex' },
  ];
}
