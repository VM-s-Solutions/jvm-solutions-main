import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';
import { BoardComponent } from '../board/board.component';
import {
  BoardStage,
  CHAPTER_COLORS,
  Rgb,
  chapterAt,
  chapterTone,
  parseRgb,
  trackProgress,
} from '../board/board-chapters';
import { SwapTextComponent } from '../swap-text/swap-text.component';
import { DarkSurfaceDirective } from '../../directives/dark-surface.directive';
import { RevealDirective } from '../../directives/reveal.directive';
import { IDEA_MAX_LENGTH, IdeaService } from '../../services/idea.service';
import { prefersReducedMotion } from '../../services/motion';

/** Each frame, the eased progress closes this share of the gap to the real scroll position. */
const LERP = 0.14;
/** Closer than this and the easing snaps to the target and stops. */
const SETTLE = 0.0005;
/** Quiet time after typing in the heading before the name is taken. */
const SAVE_DELAY_MS = 300;
/** Room for the caret after the measured text, in px. */
const CARET_ROOM = 3;

const STEPS = ['sketch', 'write', 'show', 'handover'] as const;

/**
 * The chapters' backgrounds as RGB, resolved from their colour tokens through a probe's
 * computed colour, so whatever notation the stylesheet writes them in still reads.
 * Null if one of them can't be read.
 */
function readChapterTones(host: HTMLElement): Rgb[] | null {
  const probe = document.createElement('span');
  probe.hidden = true;
  host.append(probe);
  const tones = CHAPTER_COLORS.map((token) => {
    probe.style.color = `var(${token})`;
    return parseRgb(getComputedStyle(probe).color);
  });
  probe.remove();
  return tones.every((tone): tone is Rgb => tone !== null) ? tones : null;
}

/** The board is pinned while the steps play; a viewport too short for that lists them instead. */
function isPinned(sticky: HTMLElement): boolean {
  return getComputedStyle(sticky).position === 'sticky';
}

/**
 * "Put [your idea] on paper.": the heading has a slot to name the idea in, and below it
 * a pinned board walks through our four steps as the visitor scrolls. The scroll loop
 * eases the progress, paints the chapter colour straight onto the track every frame,
 * and only touches signals when the chapter or the light/dark tone changes.
 */
@Component({
  selector: 'jvm-paper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, RevealDirective, DarkSurfaceDirective, SwapTextComponent, BoardComponent],
  templateUrl: './paper.component.html',
  styleUrl: './paper.component.scss',
})
export class PaperComponent {
  private readonly idea = inject(IdeaService);

  protected readonly maxLength = IDEA_MAX_LENGTH;

  /** The chapter on show: 0 sketch, 1 write, 2 show, 3 hand over */
  protected readonly stage = signal<BoardStage>(0);
  /** The track is on a dark chapter: its text turns light, and so does the top bar */
  protected readonly isDark = signal(false);
  /** The track is mid-grey, half-way between two chapters: the step copy waits it out */
  protected readonly isMurky = signal(false);

  protected readonly steps = computed(() => {
    const named = this.idea.hasName();
    return STEPS.map((id) => ({
      id,
      title: `paper.steps.${id}.title`,
      body: named && id === 'sketch' ? 'paper.steps.sketch.bodyNamed' : `paper.steps.${id}.body`,
    }));
  });
  protected readonly nameParams = computed(() => ({ name: this.idea.name() }));

  // ─── The slot in the heading ────────────────────────────────────────────────
  protected readonly placeholder = toSignal(
    inject(TranslateService)
      .stream('paper.slotPlaceholder')
      .pipe(map((value: unknown) => (typeof value === 'string' ? value : ''))),
    { initialValue: '' },
  );
  private readonly focused = signal(false);
  /** What the visitor has typed so far, while the slot has focus */
  private readonly typed = signal('');
  /** The text the slot is sized to: the input's text, or its placeholder while empty */
  protected readonly mirrorText = computed(
    () => (this.focused() ? this.typed() : this.idea.name()) || this.placeholder(),
  );

  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly sticky = viewChild.required<ElementRef<HTMLElement>>('sticky');
  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');
  private readonly mirror = viewChild.required<ElementRef<HTMLElement>>('mirror');
  /** Bumped when the viewport or the fonts change, so the slot measures its text again */
  private readonly layoutTick = signal(0);
  private saveTimer = 0;

  constructor() {
    const destroyRef = inject(DestroyRef);

    // Unfocused, the slot shows the stored name — set here, in the chat, or cleaned on blur.
    afterRenderEffect({
      write: () => {
        const name = this.idea.name();
        if (!this.focused()) this.field().nativeElement.value = name;
      },
    });

    // The slot is as wide as its text (the input's width transition animates it).
    afterRenderEffect({
      earlyRead: () => {
        this.mirrorText();
        this.layoutTick();
        return this.mirror().nativeElement.offsetWidth;
      },
      write: (width) => {
        this.field().nativeElement.style.setProperty('--slot-w', `${width() + CARET_ROOM}px`);
      },
    });

    const remeasure = () => this.layoutTick.update((n) => n + 1);
    window.addEventListener('resize', remeasure, { passive: true });
    document.fonts?.addEventListener('loadingdone', remeasure);

    destroyRef.onDestroy(() => {
      window.removeEventListener('resize', remeasure);
      document.fonts?.removeEventListener('loadingdone', remeasure);
      // Leaving mid-word still keeps the name
      if (this.saveTimer) {
        clearTimeout(this.saveTimer);
        this.idea.set(this.typed());
      }
    });

    afterNextRender(() => this.startScrollLoop(destroyRef));
  }

  protected onFocus(value: string): void {
    this.typed.set(value);
    this.focused.set(true);
  }

  protected onInput(value: string): void {
    this.typed.set(value);
    clearTimeout(this.saveTimer);
    this.saveTimer = window.setTimeout(() => {
      this.saveTimer = 0;
      this.idea.set(value);
    }, SAVE_DELAY_MS);
  }

  protected onBlur(value: string): void {
    clearTimeout(this.saveTimer);
    this.saveTimer = 0;
    this.idea.set(value);
    this.focused.set(false);
  }

  /** Enter takes the name at once. Keyboard focus stays put; a touch keyboard's "done" closes it. */
  protected onEnter(event: Event, field: HTMLInputElement): void {
    // Enter that confirms an IME composition belongs to the composition
    if (event instanceof KeyboardEvent && event.isComposing) return;
    event.preventDefault();
    clearTimeout(this.saveTimer);
    this.saveTimer = 0;
    this.idea.set(field.value);
    if (window.matchMedia('(pointer: coarse)').matches) field.blur();
  }

  /**
   * Eases the scroll position through the track and paints it. Runs only while the eased
   * value is still catching up; a scroll or resize starts it again.
   */
  private startScrollLoop(destroyRef: DestroyRef): void {
    const track = this.track().nativeElement;
    const sticky = this.sticky().nativeElement;
    const tones = readChapterTones(track);
    let smooth = 0;
    let frame = 0;
    let painted = '';

    const progress = (): number => {
      const { top, height } = track.getBoundingClientRect();
      return trackProgress(top, height, window.innerHeight);
    };

    const paint = (p: number): void => {
      if (tones) {
        // Pinned, the track blends through the chapters' colours; listed, it stays on paper
        const tone = chapterTone(isPinned(sticky) ? p : 0, tones);
        if (tone.color !== painted) {
          painted = tone.color;
          track.style.setProperty('--pbg', tone.color);
        }
        if (tone.dark !== this.isDark()) this.isDark.set(tone.dark);
        if (tone.murky !== this.isMurky()) this.isMurky.set(tone.murky);
      }
      const stage = chapterAt(p);
      if (stage !== this.stage()) this.stage.set(stage);
    };

    const loop = (): void => {
      frame = 0;
      const target = progress();
      smooth = prefersReducedMotion() ? target : smooth + (target - smooth) * LERP;
      if (Math.abs(target - smooth) < SETTLE) smooth = target;
      paint(smooth);
      if (smooth !== target) frame = requestAnimationFrame(loop);
    };

    const kick = (): void => {
      if (!frame) frame = requestAnimationFrame(loop);
    };

    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick, { passive: true });
    destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', kick);
      window.removeEventListener('resize', kick);
      cancelAnimationFrame(frame);
    });

    // Arriving mid-track (a reload, a jump to #how) starts on the right chapter, unanimated
    smooth = progress();
    paint(smooth);
  }
}
