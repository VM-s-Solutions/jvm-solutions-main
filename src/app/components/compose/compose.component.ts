import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RevealDirective } from '../../directives/reveal.directive';
import { injectNow } from '../../services/clock';
import { ContactDraftService } from '../../services/contact-draft.service';
import { replyByDate, replyByParts } from '../../services/dates';
import { IdeaService } from '../../services/idea.service';
import { LangService } from '../../services/lang.service';
import { TEAM, TEAM_ORDER } from '../../services/team';
import { IconComponent } from '../icon/icon.component';
import { SplitTextComponent } from '../split-text/split-text.component';

/**
 * "Start the conversation": a message composer addressed to the three of us. Sending it
 * (the round button, or Ctrl/Cmd+Enter) carries what was typed over to the contact form,
 * where the visitor adds their details.
 */
@Component({
  selector: 'jvm-compose',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, RevealDirective, IconComponent, SplitTextComponent],
  templateUrl: './compose.component.html',
  styleUrl: './compose.component.scss',
})
export class ComposeComponent {
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly draft = inject(ContactDraftService);
  private readonly idea = inject(IdeaService);
  private readonly lang = inject(LangService);

  protected readonly team = TEAM_ORDER.map((id) => TEAM[id]);

  /** When a message written now gets its reply, in the visitor's language; it moves on with the clock */
  private readonly now = injectNow();
  protected readonly when = computed(() => replyByParts(replyByDate(this.now()), this.lang.current()));

  protected readonly placeholderKey = computed(() =>
    this.idea.hasName() ? 'compose.placeholderNamed' : 'compose.placeholder',
  );
  protected readonly ideaParams = computed(() => ({ name: this.idea.name() }));

  /**
   * Enter starts a new line, as in any text box, so a message is never carried off mid-sentence.
   * Ctrl/Cmd+Enter sends, like the button; Enter that confirms an IME word does nothing.
   */
  protected onKeydown(event: KeyboardEvent, text: string): void {
    if (event.key !== 'Enter' || !(event.ctrlKey || event.metaKey) || event.isComposing) return;
    event.preventDefault();
    this.send(text);
  }

  protected onSubmit(event: Event, text: string): void {
    event.preventDefault();
    this.send(text);
  }

  private send(typed: string): void {
    const text = typed.trim();
    const name = this.idea.name();
    this.draft.hold(text || (name ? this.t('compose.draftNamed', { name }) : ''));
    void this.router.navigate(['/contact']);
  }

  private t(key: string, params: Record<string, string>): string {
    const value: unknown = this.translate.instant(key, params);
    return typeof value === 'string' ? value : '';
  }
}
