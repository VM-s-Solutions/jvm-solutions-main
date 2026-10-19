import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { SwapTextComponent } from '../swap-text/swap-text.component';
import { BoardStage } from './board-chapters';

/** The wireframe, drawn on a 400 × 280 grid: the frame first (in orange), then the screen inside it. */
const SKETCH_PATHS: readonly string[] = [
  'M5 7 C120 2 280 9 395 4 L397 273 C260 278 140 271 4 276 Z',
  'M7 41 C140 37 262 43 393 38',
  'M96 43 C98 120 95 200 97 271',
  'M150 14 L300 12 L301 29 L151 31 Z',
  'M361 21 a9 9 0 1 0 18 1 a9 9 0 1 0 -18 -1',
  'M18 63 L72 62 M18 84 L60 84 M18 105 L67 104 M18 126 L57 126',
  'M120 121 h12 v12 h-12 z M144 127 L292 125 M120 151 h12 v12 h-12 z M144 157 L270 156 M120 181 h12 v12 h-12 z M144 187 L285 186 M120 211 h12 v12 h-12 z M144 217 L250 216',
  'M292 239 L381 238 L382 261 L293 262 Z',
];

/**
 * The first chapter on the board: a hand-drawn wireframe with the idea's name written
 * on it. It draws itself stroke by stroke once `drawn` turns on; on "write" the orange
 * tags land on it, and from "show" on the working app covers it.
 */
@Component({
  selector: 'jvm-board-sketch',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, SwapTextComponent],
  host: {
    '[attr.data-stage]': 'stage()',
    '[class.is-drawn]': 'drawn()',
  },
  templateUrl: './board-sketch.component.html',
  styleUrl: './board-sketch.component.scss',
})
export class BoardSketchComponent {
  readonly stage = input.required<BoardStage>();
  /** Strokes are drawn (they start hidden and draw in on the first switch) */
  readonly drawn = input.required<boolean>();
  /** The idea's name, or the generic product name */
  readonly product = input.required<string>();

  protected readonly paths = SKETCH_PATHS;
}
