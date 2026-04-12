import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { ServicesComponent } from '../../components/services/services.component';
import { StatsComponent } from '../../components/stats/stats.component';
import { PortfolioComponent } from '../../components/portfolio/portfolio.component';
import { TestimonialsComponent } from '../../components/testimonials/testimonials.component';
import { ContactCtaComponent } from '../../components/contact-cta/contact-cta.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NavbarComponent,
    HeroComponent,
    ServicesComponent,
    StatsComponent,
    PortfolioComponent,
    TestimonialsComponent,
    ContactCtaComponent,
    FooterComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
