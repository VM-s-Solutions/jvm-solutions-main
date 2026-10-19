import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChildren } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { RevealDirective } from '../../directives/reveal.directive';
import { PersonId, TEAM, TEAM_ORDER } from '../../services/team';
import { SplitTextComponent } from '../split-text/split-text.component';

/** One face in the row, with what its tab and its panel need */
interface Member {
  id: PersonId;
  full: string;
  avatar: string;
  /** The letter of "JVM" that comes from their name */
  initial: string;
  tabId: string;
  panelId: string;
  roleKey: string;
  bioKey: string;
}

const MEMBERS: readonly Member[] = TEAM_ORDER.map((id) => {
  const { first, full, avatar } = TEAM[id];
  return {
    id,
    full,
    avatar,
    initial: first.charAt(0),
    tabId: `team-tab-${id}`,
    panelId: `team-bio-${id}`,
    roleKey: `team.role.${id}`,
    bioKey: `team.bio.${id}`,
  };
});

/** The tab a key moves to from `index`, wrapping around the ends; null for keys tabs ignore. */
function tabFor(key: string, index: number, count: number): number | null {
  switch (key) {
    case 'ArrowRight':
      return (index + 1) % count;
    case 'ArrowLeft':
      return (index + count - 1) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}

/**
 * "The three of us": our faces as tabs. Picking one shows that person's own line about
 * their work. Only the selected face is in the tab order; the arrow keys move between them.
 */
@Component({
  selector: 'jvm-team-trio',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, RevealDirective, SplitTextComponent],
  templateUrl: './team-trio.component.html',
  styleUrl: './team-trio.component.scss',
})
export class TeamTrioComponent {
  protected readonly members = MEMBERS;
  protected readonly selected = signal(0);

  private readonly tabs = viewChildren<ElementRef<HTMLButtonElement>>('tab');

  protected select(index: number): void {
    this.selected.set(index);
  }

  protected onKeydown(event: KeyboardEvent, index: number): void {
    const next = tabFor(event.key, index, MEMBERS.length);
    if (next === null) return;
    event.preventDefault();
    this.selected.set(next);
    this.tabs()[next]?.nativeElement.focus();
  }
}
