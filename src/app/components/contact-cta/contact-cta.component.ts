import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

@Component({
  selector: 'jvm-contact-cta',
  standalone: true,
  imports: [RouterLink, ScrollRevealDirective, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact-cta.component.html',
  styleUrl: './contact-cta.component.scss',
})
export class ContactCtaComponent {}
