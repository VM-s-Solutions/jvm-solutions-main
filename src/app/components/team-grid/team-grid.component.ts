import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

export interface TeamMember {
  initials: string;
  name: string;
  roleKey: string;
  bioKey: string;
  linkedin: string;
  photo?: string;
}

@Component({
  selector: 'jvm-team-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, ScrollRevealDirective],
  templateUrl: './team-grid.component.html',
  styleUrl: './team-grid.component.scss',
})
export class TeamGridComponent {
  readonly members = input.required<TeamMember[]>();
}
