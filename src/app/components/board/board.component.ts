import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ideaInitial } from '../../services/idea.service';
import { prefersReducedMotion } from '../../services/motion';
import { injectProductName } from '../../services/product-name';
import { BoardAppComponent } from './board-app.component';
import { BoardCardsComponent } from './board-cards.component';
import { BoardStage } from './board-chapters';
import { BoardSketchComponent } from './board-sketch.component';

/** Share of the board that must be on screen before the sketch draws itself. */
const DRAW_THRESHOLD = 0.3;

/**
 * The pinned drawing beside "Put … on paper.": the visitor's idea goes from a sketch with
 * sticky notes, to a written spec, to a working app on staging, to a signed handover.
 * `stage` is the chapter; the scroll that drives it lives in the paper section.
 * Purely illustrative, so it is hidden from assistive technology.
 */
@Component({
  selector: 'jvm-board',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, BoardSketchComponent, BoardAppComponent, BoardCardsComponent],
  host: { 'aria-hidden': 'true' },
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
})
export class BoardComponent {
  readonly stage = input.required<BoardStage>();

  protected readonly product = injectProductName();
  protected readonly initial = computed(() => ideaInitial(this.product()));

  /** The sketch has drawn itself; with reduced motion it is simply there. */
  protected readonly drawn = signal(prefersReducedMotion() || !('IntersectionObserver' in window));

  private readonly surface = viewChild.required<ElementRef<HTMLElement>>('surface');

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (this.drawn()) return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            this.drawn.set(true);
            observer.disconnect();
          }
        },
        { threshold: DRAW_THRESHOLD },
      );
      observer.observe(this.surface().nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
