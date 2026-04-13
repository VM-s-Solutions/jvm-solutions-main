import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { TeamGridComponent, TeamMember } from '../../components/team-grid/team-grid.component';

@Component({
  selector: 'app-about',
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
      photo: 'https://scontent-prg1-1.xx.fbcdn.net/v/t39.30808-6/486072466_122093528186826207_499545333775373266_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=1d70fc&_nc_ohc=X53ZYuBhetwQ7kNvwES9qH8&_nc_oc=AdrJwQgi1YFJwnUzQLIzVcFro6bm059zE3FeKs1HW1wu228rnny0nK82SF1Q6_9cdYM&_nc_zt=23&_nc_ht=scontent-prg1-1.xx&_nc_gid=b7PJ5E65pV0AsJ3-JUHvyA&_nc_ss=7a3a8&oh=00_Af1QTRk4zYSUJXua6Yh6CHr_smbzJELag2v4JHamVTLghQ&oe=69E1ACBC',
    },
    {
      initials: 'V',
      name: 'Vít Chvoj',
      roleKey: 'about.vit.role',
      bioKey: 'about.vit.bio',
      linkedin: 'https://www.linkedin.com/in/vitchvoj/',
      photo: 'https://media.licdn.com/dms/image/v2/D4E03AQF_l_-y5GRpoA/profile-displayphoto-shrink_800_800/B4EZdecuA9HsAc-/0/1749636277675?e=1777507200&v=beta&t=tZrGRa_gjSR781ZImDAaE5MYqJlF3kfixXlK3viNrh8',
    },
    {
      initials: 'M',
      name: 'Michael Chaban',
      roleKey: 'about.michael.role',
      bioKey: 'about.michael.bio',
      linkedin: 'https://www.linkedin.com/in/michael-chaban-014825236/',
      photo: 'https://media.licdn.com/dms/image/v2/D4D03AQGUY89Kpcck2A/profile-displayphoto-crop_800_800/B4DZ2CpMucIAAI-/0/1776013334382?e=1777507200&v=beta&t=kGRtCufJ--JkoP5q0O0i2tzFOyX3XzjX0xOmfXCvXxc',
    },
  ];
}
