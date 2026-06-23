import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

interface PricingTier {
  labelKey: string;
  priceKey: string;
  periodKey: string;
  ctaKey: string;
  ctaLink: string;
  badgeKey?: string;
  features: string[];
  highlighted: boolean;
  showMeta: boolean;
}

@Component({
  selector: 'jvm-pricing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NavbarComponent, FooterComponent, ScrollRevealDirective, TranslateModule, RouterLink],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss',
})
export class PricingComponent {
  readonly tiers: PricingTier[] = [
    {
      labelKey: 'pricing.project.label',
      priceKey: 'pricing.project.price',
      periodKey: 'pricing.project.period',
      ctaKey: 'pricing.project.cta',
      ctaLink: '/contact',
      features: ['pricing.project.f1', 'pricing.project.f2', 'pricing.project.f3', 'pricing.project.f4', 'pricing.project.f5'],
      highlighted: false,
      showMeta: false,
    },
    {
      labelKey: 'pricing.retainer.label',
      priceKey: 'pricing.retainer.price',
      periodKey: 'pricing.retainer.period',
      ctaKey: 'pricing.retainer.cta',
      ctaLink: '/contact',
      badgeKey: 'pricing.retainer.badge',
      features: ['pricing.retainer.f1', 'pricing.retainer.f2', 'pricing.retainer.f3', 'pricing.retainer.f4', 'pricing.retainer.f5'],
      highlighted: true,
      showMeta: true,
    },
    {
      labelKey: 'pricing.consulting.label',
      priceKey: 'pricing.consulting.price',
      periodKey: 'pricing.consulting.period',
      ctaKey: 'pricing.consulting.cta',
      ctaLink: '/contact',
      features: ['pricing.consulting.f1', 'pricing.consulting.f2', 'pricing.consulting.f3', 'pricing.consulting.f4', 'pricing.consulting.f5'],
      highlighted: false,
      showMeta: true,
    },
  ];
}
