import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

@Component({
  selector: 'jvm-contact-cta',
  standalone: true,
  imports: [ScrollRevealDirective, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact-cta.component.html',
  styleUrl: './contact-cta.component.scss',
})
export class ContactCtaComponent {}
