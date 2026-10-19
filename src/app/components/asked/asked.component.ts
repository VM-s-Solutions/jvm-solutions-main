import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { RevealDirective } from '../../directives/reveal.directive';
import { PersonId } from '../../services/team';
import { IconComponent } from '../icon/icon.component';
import { MessageComponent } from '../message/message.component';
import { SplitTextComponent } from '../split-text/split-text.component';

interface ThreadLine {
  from: PersonId | 'me';
  key: string;
  /** Reveal stagger, in seconds */
  delay: number;
}

/** Two questions every client asks, answered by the one of us who usually does. */
const THREAD: readonly ThreadLine[] = [
  { from: 'me', key: 'faq.q2', delay: 0 },
  { from: 'v', key: 'faq.a2', delay: 0.15 },
  { from: 'me', key: 'faq.q3', delay: 0.3 },
  { from: 'j', key: 'faq.a3', delay: 0.45 },
];

/** "Your questions, before ours": a short chat thread on the home page, linking to the FAQ. */
@Component({
  selector: 'jvm-asked',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, RevealDirective, IconComponent, MessageComponent, SplitTextComponent],
  templateUrl: './asked.component.html',
  styleUrl: './asked.component.scss',
})
export class AskedComponent {
  protected readonly thread = THREAD;
}
