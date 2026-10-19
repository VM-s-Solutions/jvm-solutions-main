import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { SwapTextComponent } from '../swap-text/swap-text.component';
import { IdeaService } from '../../services/idea.service';

/**
 * AI agents: the system prompt of an assistant that answers questions about the idea
 * from its own documents, the subject highlighted. Decorative; the card around it is
 * aria-hidden.
 */
@Component({
  selector: 'jvm-demo-prompt',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, SwapTextComponent],
  templateUrl: './demo-prompt.component.html',
  styleUrl: './demo-prompt.component.scss',
})
export class DemoPromptComponent {
  private readonly idea = inject(IdeaService);

  protected readonly name = this.idea.name;
  protected readonly subjectKey = computed(() =>
    this.idea.hasName() ? 'trades.prompt.subjectNamed' : 'trades.prompt.subject',
  );
}
