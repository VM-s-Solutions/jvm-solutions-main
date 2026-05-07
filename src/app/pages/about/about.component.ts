import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { TeamGridComponent, TeamMember } from '../../components/team-grid/team-grid.component';

@Component({
  selector: 'jvm-about',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, ScrollRevealDirective, TranslateModule, TeamGridComponent],
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
      photo: 'https://media.licdn.com/dms/image/v2/D4D03AQHFBY-63jXXJQ/profile-displayphoto-crop_800_800/B4DZ2QWbKvGUAM-/0/1776243292635?e=1779926400&v=beta&t=CMy1JdanWD6HzkgUVw_V-zLcGReLTkEYde5mGqihb5g',
    },
    {
      initials: 'V',
      name: 'Vít Chvoj',
      roleKey: 'about.vit.role',
      bioKey: 'about.vit.bio',
      linkedin: 'https://www.linkedin.com/in/vitchvoj/',
      photo: 'https://media.licdn.com/dms/image/v2/D4E03AQF_l_-y5GRpoA/profile-displayphoto-shrink_800_800/B4EZdecuA9HsAc-/0/1749636277675?e=1779926400&v=beta&t=ldTt9FRv1F2e565clT8hmyQg4LwWDw_9XwkG5oDXuCQ',
    },
    {
      initials: 'M',
      name: 'Michael Chaban',
      roleKey: 'about.michael.role',
      bioKey: 'about.michael.bio',
      linkedin: 'https://www.linkedin.com/in/michael-chaban/',
      photo: 'https://media.licdn.com/dms/image/v2/D4D03AQHRCYo7tlGUkw/profile-displayphoto-crop_800_800/B4DZ2QmhQKHMAI-/0/1776247513036?e=1779926400&v=beta&t=8ShtslCQCfH2n8wSi3Ta5IG9ApoaEE6IZxy7nkgIqII',
    },
  ];
}
