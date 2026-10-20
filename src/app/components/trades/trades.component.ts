import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DemoCodeComponent } from '../demo-code/demo-code.component';
import { DemoLangComponent } from '../demo-lang/demo-lang.component';
import { DemoLockComponent } from '../demo-lock/demo-lock.component';
import { DemoPromptComponent } from '../demo-prompt/demo-prompt.component';
import { IconComponent } from '../icon/icon.component';
import { SplitTextComponent } from '../split-text/split-text.component';
import { SwapTextComponent } from '../swap-text/swap-text.component';
import { RevealDirective } from '../../directives/reveal.directive';
import { IdeaService } from '../../services/idea.service';
import { prefersReducedMotion } from '../../services/motion';
import { STACK_SHORT, StackChip, TradeId } from '../../services/stack';

interface TradeCard {
  readonly id: TradeId;
  readonly titleKey: string;
  readonly textKey: string;
  readonly chips: readonly StackChip[];
  /** Reveal stagger, in seconds */
  readonly delay: number;
}

const TRADES: readonly TradeId[] = ['web', 'api', 'mobile', 'ai'];

const REVEAL_STAGGER = 0.08;

const CARDS: readonly TradeCard[] = TRADES.map((id, i) => ({
  id,
  titleKey: `service.${id}`,
  textKey: `trades.${id}`,
  chips: STACK_SHORT[id],
  delay: i * REVEAL_STAGGER,
}));

/** Mouse travel (px) before a press becomes a drag, so a plain click stays a click */
const DRAG_THRESHOLD = 5;
/** Slack (px) when deciding whether the scroller sits at either end */
const END_SLACK = 4;

/**
 * "Four trades, three people": one card per service, each with a live mock screen,
 * in a sideways scroller. Cards snap to the container's left edge; the arrows step one
 * card, a mouse can drag it (touch and trackpads scroll natively), and the bar below
 * shows how much is in view and where.
 */
@Component({
  selector: 'jvm-trades',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    RevealDirective,
    SplitTextComponent,
    SwapTextComponent,
    IconComponent,
    DemoLangComponent,
    DemoCodeComponent,
    DemoLockComponent,
    DemoPromptComponent,
  ],
  templateUrl: './trades.component.html',
  styleUrl: './trades.component.scss',
})
export class TradesComponent {
  private readonly idea = inject(IdeaService);

  protected readonly cards = CARDS;
  protected readonly name = this.idea.name;
  protected readonly leadKey = computed(() => (this.idea.hasName() ? 'trades.leadNamed' : 'trades.lead'));

  /** The scroller rests on its first / last card, so that arrow is disabled */
  protected readonly atStart = signal(true);
  protected readonly atEnd = signal(false);
  /** The card under the mouse or holding keyboard focus: its demo plays again */
  protected readonly hot = signal<TradeId | null>(null);

  private readonly car = viewChild.required<ElementRef<HTMLElement>>('car');
  private readonly bar = viewChild.required<ElementRef<HTMLElement>>('bar');
  private readonly prev = viewChild.required<ElementRef<HTMLButtonElement>>('prev');
  private readonly next = viewChild.required<ElementRef<HTMLButtonElement>>('next');
  private readonly cardEls = viewChildren('card', { read: ElementRef<HTMLElement> });

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => this.wire(destroyRef));
  }

  /** One card plus the gap: the arrows move by exactly one card. */
  protected step(direction: 1 | -1): void {
    const car = this.car().nativeElement;
    car.scrollBy({ left: direction * this.stepWidth(car), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }

  /** A mouse over a card, or focus inside it. A finger landing on one to swipe isn't a hover. */
  protected warm(id: TradeId, event?: PointerEvent): void {
    if (event?.pointerType === 'touch') return;
    this.hot.set(id);
  }

  protected cool(): void {
    this.hot.set(null);
  }

  private stepWidth(car: HTMLElement): number {
    const card = this.cardEls().at(0)?.nativeElement;
    if (!card) return car.clientWidth;
    return card.getBoundingClientRect().width + (parseFloat(getComputedStyle(car).columnGap) || 0);
  }

  /**
   * Progress bar, arrow states and mouse dragging. Scroll frames write to the DOM directly. Nothing
   * is measured while the section renders: the ResizeObserver's first report, after the browser's
   * own layout, brings the first measure in the frame after.
   */
  private wire(destroyRef: DestroyRef): void {
    const car = this.car().nativeElement;
    const bar = this.bar().nativeElement;
    const life = new AbortController();
    let frame = 0;

    const measure = (): void => {
      frame = 0;
      const width = car.clientWidth;
      if (!width) return;
      const max = car.scrollWidth - width;
      const visible = Math.min(1, width / car.scrollWidth);
      const progress = max > 0 ? car.scrollLeft / max : 0;
      bar.style.width = `${visible * 100}%`;
      bar.style.transform = `translateX(${progress * (1 / visible - 1) * 100}%)`;
      this.setEnds(car, car.scrollLeft < END_SLACK, car.scrollLeft > max - END_SLACK);
    };
    const schedule = (): void => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    car.addEventListener('scroll', schedule, { passive: true, signal: life.signal });
    const resize = new ResizeObserver(schedule);
    resize.observe(car);
    document.fonts?.addEventListener('loadingdone', schedule, { signal: life.signal });
    document.fonts?.ready.then(() => {
      if (!life.signal.aborted) schedule();
    });

    // Drag with a mouse; touch keeps its native scrolling
    let startX = 0;
    let startLeft = 0;
    let moved = false;
    let drag: AbortController | null = null;

    const endDrag = (): void => {
      drag?.abort();
      drag = null;
      if (!moved) return;
      const step = this.stepWidth(car);
      car.classList.remove('is-drag');
      car.scrollTo({
        left: Math.round(car.scrollLeft / step) * step,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    };

    car.addEventListener(
      'pointerdown',
      (down) => {
        moved = false;
        if (down.pointerType !== 'mouse' || down.button !== 0) return;
        startX = down.clientX;
        startLeft = car.scrollLeft;
        drag?.abort();
        drag = new AbortController();
        window.addEventListener(
          'pointermove',
          (move) => {
            const dx = move.clientX - startX;
            if (!moved && Math.abs(dx) > DRAG_THRESHOLD) {
              moved = true;
              // the class goes on before the first scroll, so snapping can't fight the drag
              car.classList.add('is-drag');
              window.getSelection()?.removeAllRanges();
            }
            if (moved) car.scrollLeft = startLeft - dx;
          },
          { signal: drag.signal },
        );
        window.addEventListener('pointerup', endDrag, { signal: drag.signal });
        window.addEventListener('pointercancel', endDrag, { signal: drag.signal });
      },
      { signal: life.signal },
    );

    // A drag ends in a click on whatever sits under the pointer: swallow it
    car.addEventListener(
      'click',
      (click) => {
        if (!moved) return;
        click.preventDefault();
        click.stopPropagation();
        moved = false;
      },
      { capture: true, signal: life.signal },
    );

    destroyRef.onDestroy(() => {
      life.abort();
      drag?.abort();
      resize.disconnect();
      cancelAnimationFrame(frame);
    });
  }

  private setEnds(car: HTMLElement, atStart: boolean, atEnd: boolean): void {
    // Disabling the focused arrow would drop keyboard focus on the floor: hand it to the scroller
    const focused = document.activeElement;
    if ((atStart && focused === this.prev().nativeElement) || (atEnd && focused === this.next().nativeElement)) {
      car.focus({ preventScroll: true });
    }
    this.atStart.set(atStart);
    this.atEnd.set(atEnd);
  }
}
