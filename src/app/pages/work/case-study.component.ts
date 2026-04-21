import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { ProjectsService, CaseStudy } from '../../services/projects.service';

@Component({
  selector: 'jvm-case-study',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NavbarComponent, FooterComponent, ScrollRevealDirective, TranslateModule, RouterLink],
  templateUrl: './case-study.component.html',
  styleUrl: './case-study.component.scss',
})
export class CaseStudyComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly projectsService = inject(ProjectsService);

  readonly project = toSignal(
    this.route.paramMap.pipe(map(params => this.projectsService.getById(params.get('id') ?? '')))
  );
}
