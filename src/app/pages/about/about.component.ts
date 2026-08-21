import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { TeamGridComponent, TeamMember } from '../../components/team-grid/team-grid.component';

/** A single row of the public-register details block. Locale-independent data
 *  (company ID, address, names) uses `value`; translated data uses `valueKey`. */
interface CompanyFact {
  labelKey: string;
  value?: string;
  valueKey?: string;
}

@Component({
  selector: 'jvm-about',
  standalone: true,
  imports: [FooterComponent, ScrollRevealDirective, TranslateModule, TeamGridComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  readonly team: TeamMember[] = [
    {
      initials: 'J',
      name: 'Janis Joanu',
      roleKey: 'about.janis.role',
      bioKey: 'about.janis.bio',
      linkedin: 'https://www.linkedin.com/in/janis-joanu/',
      // head-and-shoulders crop — the full beach photo is too tall for an 80px avatar
      photo: 'images/about/janis_joanu_avatar.jpg',
    },
    {
      initials: 'V',
      name: 'Vít Chvoj',
      roleKey: 'about.vit.role',
      bioKey: 'about.vit.bio',
      linkedin: 'https://www.linkedin.com/in/vitchvoj/',
      // head-and-shoulders crop — the full seated photo is too wide for an 80px avatar
      photo: 'images/about/vit_chvoj_avatar.jpg',
    },
    {
      initials: 'M',
      name: 'Michael Chaban',
      roleKey: 'about.michael.role',
      bioKey: 'about.michael.bio',
      linkedin: 'https://www.linkedin.com/in/michael-chaban/',
      // head-and-shoulders crop — the full photo is too wide for an 80px avatar
      photo: 'images/about/michael_chaban_avatar.jpg',
    },
  ];

  /** Verbatim from the Czech commercial register (IČO 29633443). */
  readonly companyFacts: CompanyFact[] = [
    { labelKey: 'about.company.legalName', value: 'JVM Yore, s.r.o.' },
    { labelKey: 'about.company.ico', value: '29633443' },
    { labelKey: 'about.company.seat', value: 'Příčná 1892/4, Nové Město, 110 00 Praha 1' },
    { labelKey: 'about.company.registration', valueKey: 'about.company.registrationValue' },
    { labelKey: 'about.company.founded', valueKey: 'about.company.foundedValue' },
    { labelKey: 'about.company.directors', value: 'Janis Joanu, Vít Chvoj, Mykhailo Chaban' },
    { labelKey: 'about.company.scope', valueKey: 'about.company.scopeValue' },
  ];

  readonly registryUrl = 'https://or.justice.cz/ias/ui/rejstrik-$firma?ico=29633443';

  readonly detailsOpen = signal(false);

  toggleDetails(): void {
    this.detailsOpen.update((open) => !open);
  }
}
