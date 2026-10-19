import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LogoComponent } from '../logo/logo.component';
import { SwapTextComponent } from '../swap-text/swap-text.component';
import { BoardStage } from './board-chapters';

const NAV_ITEMS = ['paper.board.app.inbox', 'paper.board.app.team', 'paper.board.app.settings'] as const;

const CHECKLIST = [
  'paper.board.app.item1',
  'paper.board.app.item2',
  'paper.board.app.item3',
  'paper.board.app.item4',
] as const;

/**
 * The idea as a working app, over the sketch from "show" on: its checklist ticks itself
 * off and a sign-up toast arrives. On "hand over" it settles and carries our v1.0 mark.
 */
@Component({
  selector: 'jvm-board-app',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, LogoComponent, SwapTextComponent],
  host: {
    '[attr.data-stage]': 'stage()',
  },
  templateUrl: './board-app.component.html',
  styleUrl: './board-app.component.scss',
})
export class BoardAppComponent {
  readonly stage = input.required<BoardStage>();
  /** The idea's name, or the generic product name */
  readonly product = input.required<string>();
  /** The letter on the app icon */
  readonly initial = input.required<string>();

  protected readonly navItems = NAV_ITEMS;
  protected readonly checklist = CHECKLIST;
}
