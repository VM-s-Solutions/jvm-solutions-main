import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { TeamGridComponent, TeamMember } from '../../components/team-grid/team-grid.component';

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
      photo: 'images/about/janis_joanu.jpg',
    },
    {
      initials: 'V',
      name: 'Vít Chvoj',
      roleKey: 'about.vit.role',
      bioKey: 'about.vit.bio',
      linkedin: 'https://www.linkedin.com/in/vitchvoj/',
      photo: 'images/about/vit_chvoj.JPG',
    },
    {
      initials: 'M',
      name: 'Michael Chaban',
      roleKey: 'about.michael.role',
      bioKey: 'about.michael.bio',
      linkedin: 'https://www.linkedin.com/in/michael-chaban/',
      photo: 'images/about/michael_chaban.jpg',
    },
  ];
}
