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

/** Each 60 Hz frame, the eased progress closes this share of the gap to the real scroll position. */
const LERP = 0.14;
/** The frame LERP is tuned for: other refresh rates ease by the time that has passed, so they feel the same */
const FRAME_MS = 1000 / 60;
/** A longer gap between frames (a stall, a tab coming back) counts as this long, so the board doesn't leap */
const MAX_FRAME_MS = 100;
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
 * and only touches signals when the chapter or the light/dark tone changes. Nothing reads
 * layout while the section renders, so its first layout happens once, in the frame.
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

    destroyRef.onDestroy(() => {
      // Leaving mid-word still keeps the name
      if (this.saveTimer) {
        clearTimeout(this.saveTimer);
        this.idea.set(this.typed());
      }
    });

    // Both only start watching here; their first reads wait for the frame
    afterNextRender(() => {
      this.startScrollLoop(destroyRef);
      this.sizeSlot(destroyRef);
    });
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
   * The slot is as wide as its text, measured on the hidden mirror beside it. A ResizeObserver
   * reports the mirror's size after layout, so measuring never forces one, and it reports again
   * whenever the text, the viewport or the font changes it. The input's width transition
   * animates every change but the first.
   */
  private sizeSlot(destroyRef: DestroyRef): void {
    const field = this.field().nativeElement;
    const mirror = this.mirror().nativeElement;
    let first = true;
    let frame = 0;
    const observer = new ResizeObserver(() => {
      field.style.setProperty('--slot-w', `${mirror.offsetWidth + CARET_ROOM}px`);
      if (!first) return;
      first = false;
      // The first width is simply there: the transition only comes back from the next frame
      field.style.transition = 'none';
      frame = requestAnimationFrame(() => field.style.removeProperty('transition'));
    });
    observer.observe(mirror);
    destroyRef.onDestroy(() => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    });
  }

  /**
   * Eases the scroll position through the track and paints it. Runs only while the eased
   * value is still catching up; a scroll or resize starts it again.
   */
  private startScrollLoop(destroyRef: DestroyRef): void {
    const track = this.track().nativeElement;
    const sticky = this.sticky().nativeElement;
    /** The chapters' colours, read on the first frame (undefined until then; null if they can't be) */
    let tones: readonly Rgb[] | null | undefined;
    /** Whether the board is pinned, from its computed style: read once, and again after a resize */
    let pinned: boolean | null = null;
    let smooth = 0;
    let frame = 0;
    let last = 0;
    let painted = '';

    const progress = (): number => {
      const { top, height } = track.getBoundingClientRect();
      return trackProgress(top, height, window.innerHeight);
    };

    const paint = (p: number): void => {
      // Everything is read before anything is written, so a frame works out layout only once
      if (tones === undefined) tones = readChapterTones(track);
      pinned ??= isPinned(sticky);
      if (tones) {
        // Pinned, the track blends through the chapters' colours; listed, it stays on paper.
        // Its own background colour, which restyles the track alone (not all of the board).
        const tone = chapterTone(pinned ? p : 0, tones);
        if (tone.color !== painted) {
          painted = tone.color;
          track.style.backgroundColor = tone.color;
        }
        if (tone.dark !== this.isDark()) this.isDark.set(tone.dark);
        if (tone.murky !== this.isMurky()) this.isMurky.set(tone.murky);
      }
      const stage = chapterAt(p);
      if (stage !== this.stage()) this.stage.set(stage);
    };

    const loop = (now: number): void => {
      frame = 0;
      const elapsed = last ? Math.min(now - last, MAX_FRAME_MS) : FRAME_MS;
      last = now;
      const target = progress();
      // LERP of the gap per 60 Hz frame's worth of time, whatever the display's refresh rate
      const ease = 1 - Math.pow(1 - LERP, elapsed / FRAME_MS);
      smooth = prefersReducedMotion() ? target : smooth + (target - smooth) * ease;
      if (Math.abs(target - smooth) < SETTLE) smooth = target;
      paint(smooth);
      if (smooth === target) last = 0;
      else frame = requestAnimationFrame(loop);
    };

    const kick = (): void => {
      if (!frame) frame = requestAnimationFrame(loop);
    };
    // A viewport too short to pin the board lists the steps instead (a media query on height)
    const onResize = (): void => {
      pinned = null;
      kick();
    };

    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', kick);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frame);
    });

    // The first frame reads the new section's layout, the one the browser works out for that frame
    // anyway. Arriving mid-track (a reload, a jump to #how) starts on the right chapter, unanimated.
    frame = requestAnimationFrame(() => {
      frame = 0;
      smooth = progress();
      paint(smooth);
    });
  }
}
