import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PersonId, TEAM } from '../../services/team';

/**
 * One row of a conversation. Theirs sit on the left with a face and a name on the first
 * message of a run; the visitor's (`from="me"`) sit on the right in orange. The bubble
 * text is projected; an element marked `msgAction` sits under the bubble.
 */
@Component({
  selector: 'jvm-message',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'msg',
    '[class.msg--me]': 'isMe()',
    '[class.msg--them]': '!isMe()',
    '[class.msg--first]': 'first()',
  },
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss',
})
export class MessageComponent {
  readonly from = input.required<PersonId | 'me'>();
  /** First message of a run: shows their face and name */
  readonly first = input(true);
  /** Shows the three typing dots instead of the text */
  readonly typing = input(false);
  /** The bubble pops in when it appears (a live conversation) */
  readonly pop = input(false);

  protected readonly isMe = computed(() => this.from() === 'me');
  protected readonly person = computed(() => {
    const from = this.from();
    return from === 'me' ? null : TEAM[from];
  });
}
