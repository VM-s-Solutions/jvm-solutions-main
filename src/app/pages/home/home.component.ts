import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { ServicesComponent } from '../../components/services/services.component';
import { HowItWorksComponent } from '../../components/how-it-works/how-it-works.component';
import { StatsComponent } from '../../components/stats/stats.component';
import { FaqComponent } from '../../components/faq/faq.component';
import { ContactCtaComponent } from '../../components/contact-cta/contact-cta.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NavbarComponent,
    HeroComponent,
    ServicesComponent,
    HowItWorksComponent,
    StatsComponent,
    FaqComponent,
    ContactCtaComponent,
    FooterComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
