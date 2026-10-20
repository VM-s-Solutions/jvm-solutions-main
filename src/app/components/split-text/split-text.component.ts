import {
  AfterRenderRef,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { whenRevealed } from '../../directives/reveal.directive';
import { prefersReducedMotion } from '../../services/motion';

/** Splits on ordinary whitespace only, so a no-break space keeps two words together. */
function toWords(text: string): string[] {
  return text.trim().split(/[ \t\r\n]+/).filter(Boolean);
}

/** How many leading words two texts share. */
function sharedPrefix(a: readonly string[], b: readonly string[]): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

/** How long the changed words take to drop out; the stylesheet reads it as --out. */
const OUT_MS = 320;

type Phase = 'idle' | 'out' | 'enter';

/**
 * A heading whose words rise out of their own masks the first time it scrolls into view:
 * `<h2 class="h2" [jvmSplit]="'team.title' | translate"></h2>`. When the text changes
 * later (a new language, the idea's name), only the words that differ drop out and the
 * new ones rise in. Screen readers get the plain sentence.
 */
@Component({
  selector: '[jvmSplit]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-in]': 'shown()',
    '[class.is-swapped]': 'swapped()',
    '[style.--from]': 'swapFrom()',
    '[style.--out]': 'outDuration',
  },
  template: `<span class="sr-only">{{ jvmSplit() }}</span><span aria-hidden="true">@for (word of words(); track $index) {<span class="w" [class.is-out]="phase() === 'out' && $index >= swapFrom()" [class.is-enter]="phase() === 'enter' && $index >= swapFrom()"><span [style.--i]="$index">{{ word }}</span></span>{{ $last ? '' : ' ' }}}</span>`,
  styleUrl: './split-text.component.scss',
})
export class SplitTextComponent {
  readonly jvmSplit = input.required<string>();

  protected readonly words = signal<string[]>([]);
  protected readonly shown = signal(false);
  protected readonly phase = signal<Phase>('idle');
  protected readonly swapFrom = signal(0);
  protected readonly swapped = signal(false);
  protected readonly outDuration = `${OUT_MS}ms`;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private timer = 0;
  /** The pending hand-over from 'enter' to the rise, run right after the entering words render */
  private rise: AfterRenderRef | null = null;

  constructor() {
    const destroyRef = inject(DestroyRef);

    effect(() => {
      const next = toWords(this.jvmSplit());
      untracked(() => this.update(next));
    });

    afterNextRender(() => {
      destroyRef.onDestroy(whenRevealed(this.host, () => this.shown.set(true)));
    });

    destroyRef.onDestroy(() => this.callOff());
  }

  private update(next: string[]): void {
    const current = this.words();
    if (!this.shown() || prefersReducedMotion() || current.length === 0) {
      this.callOff();
      this.words.set(next);
      return;
    }
    const from = sharedPrefix(current, next);
    if (from === current.length && from === next.length) {
      // Back to the words on show before a pending swap landed: the dropping words come back
      if (this.phase() === 'out') this.callOff();
      return;
    }

    // Changed words drop out of their masks, then the new ones rise in behind them.
    this.callOff();
    this.swapFrom.set(from);
    this.swapped.set(true);
    this.phase.set('out');
    this.timer = window.setTimeout(() => {
      this.timer = 0;
      this.words.set(next);
      this.phase.set('enter');
      // In the same render: the entering words get styled below their masks (the style read), then
      // the rise starts from there on the next frame, with no frames lost in between. Without the
      // read, a reused word would rise from where it dropped out, above the mask.
      this.rise = afterNextRender(
        () => {
          this.rise = null;
          const entering = this.host.querySelector('.w.is-enter > span');
          // A style-only property: the read applies the styles without laying the page out
          if (entering) getComputedStyle(entering).getPropertyValue('opacity');
          this.phase.set('idle');
        },
        { injector: this.injector },
      );
    }, OUT_MS);
  }

  /** Stops a swap in flight (its timer and pending rise), so a stale one can't land later. */
  private callOff(): void {
    clearTimeout(this.timer);
    this.rise?.destroy();
    this.timer = 0;
    this.rise = null;
    this.phase.set('idle');
  }
}
