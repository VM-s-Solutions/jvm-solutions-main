import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '../icon/icon.component';
import { SwapTextComponent } from '../swap-text/swap-text.component';
import { BoardStage } from './board-chapters';

const SPEC_ITEMS = [
  'paper.board.spec.goals',
  'paper.board.spec.users',
  'paper.board.spec.constraints',
  'paper.board.spec.done',
] as const;

const STAGING_ROWS = [
  { term: 'paper.board.staging.demo', value: 'paper.board.staging.demoValue' },
  { term: 'paper.board.staging.now', value: 'paper.board.staging.nowValue' },
  { term: 'paper.board.staging.link', value: 'paper.board.staging.linkValue' },
] as const;

const HANDOVER_ITEMS = [
  'paper.board.handover.repo',
  'paper.board.handover.docs',
  'paper.board.handover.fixes',
  'paper.board.handover.critical',
] as const;

/**
 * The paperwork beside the drawing, one card per chapter after the sketch: the written
 * spec with its fixed price, the staging link, and the signed handover.
 */
@Component({
  selector: 'jvm-board-cards',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, IconComponent, SwapTextComponent],
  host: {
    '[attr.data-stage]': 'stage()',
  },
  templateUrl: './board-cards.component.html',
  styleUrl: './board-cards.component.scss',
})
export class BoardCardsComponent {
  readonly stage = input.required<BoardStage>();
  /** The idea's name, or the generic product name */
  readonly product = input.required<string>();

  protected readonly specItems = SPEC_ITEMS;
  protected readonly stagingRows = STAGING_ROWS;
  protected readonly handoverItems = HANDOVER_ITEMS;
}
