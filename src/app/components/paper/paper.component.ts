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
import { Stage3dComponent } from '../stage3d/stage3d.component';
import {
  PaperStage,
  Playback,
  STAGE_COUNT,
  STAGE_RESTS,
  play,
  stageAt,
  stageNear,
  storyShare,
  trackProgress,
} from '../stage3d/stage-timeline';
import { SwapTextComponent } from '../swap-text/swap-text.component';
import { RevealDirective } from '../../directives/reveal.directive';
import { IDEA_MAX_LENGTH, IdeaService } from '../../services/idea.service';
import { prefersReducedMotion } from '../../services/motion';

/** One frame at 60 Hz: what the first frame of a playback counts as */
const FRAME_MS = 1000 / 60;
/** A longer gap between frames (a stall, a tab coming back) counts as this long, so the board doesn't leap */
const MAX_FRAME_MS = 100;
/** While a step plays, the page's scroll is held: at most this long, so a stalled frame can never trap the visitor */
const HOLD_MAX_MS = 1800;
/** The hold lets go this close to the step's rest: the last of the move is only its easing out */
const HOLD_UNTIL = 0.03;
/** Once a step has played, the hold lets go at the first pause this long in the gesture: the tail of one fling moves one step */
const HOLD_QUIET_MS = 120;
/** A wheel or touch counts as the cause of a scroll for this long after it */
const GESTURE_MS = 250;
/** How far inside a step's stretch of the track a held-back scroll is put, as a share of that stretch */
const STEP_INSET = 0.12;

/** Quiet time after typing in the heading before the name is taken. */
const SAVE_DELAY_MS = 300;
/** Room for the caret after the measured text, in px. */
const CARET_ROOM = 3;

const STEPS = ['sketch', 'write', 'show', 'handover'] as const;

/** The stage is pinned while the steps play; a short viewport or reduced motion lists them instead. */
function isPinned(sticky: HTMLElement): boolean {
  return getComputedStyle(sticky).position === 'sticky';
}

/**
 * "Put [your idea] on paper.": the heading has a slot to name the idea in, and below it
 * a pinned stage walks through our four steps as the visitor scrolls: a sheet of paper with
 * the sketch, the spec, and the laptop the sketch lands on. The scroll loop eases the
 * progress, hands it to the 3D stage and the progress line every frame, and only touches a
 * signal when the chapter changes. Nothing reads layout while the section renders, so its
 * first layout happens once, in the frame.
 */
@Component({
  selector: 'jvm-paper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, RevealDirective, SwapTextComponent, Stage3dComponent],
  templateUrl: './paper.component.html',
  styleUrl: './paper.component.scss',
})
export class PaperComponent {
  private readonly idea = inject(IdeaService);

  protected readonly maxLength = IDEA_MAX_LENGTH;

  /** The chapter on show: 0 sketch, 1 write, 2 show, 3 hand over */
  protected readonly stage = signal<PaperStage>(0);
  protected readonly count = STAGE_COUNT;
  /** The chapter's number as people count, for "2 / 4" */
  protected readonly stageNumber = computed(() => this.stage() + 1);

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
  private readonly stage3d = viewChild.required(Stage3dComponent);
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
   * Plays the story to the chapter the scroll has reached. The scroll only picks the chapter; the
   * stage then plays to that chapter's rest at its own pace, so stopping the scroll never leaves a
   * move half done and a fast scroll can't rush it. A wheel or a swipe moves it one chapter at a
   * time: while a step plays the page's scroll is held for a moment, so the story can't be flown through. Runs only while the playback is under way; a
   * scroll or resize starts it again.
   */
  private startScrollLoop(destroyRef: DestroyRef): void {
    const track = this.track().nativeElement;
    const sticky = this.sticky().nativeElement;
    const stage3d = this.stage3d();
    /** Whether the stage is pinned, from its computed style: read once, and again after a resize */
    let pinned: boolean | null = null;
    let playback: Playback = { at: STAGE_RESTS[0], speed: 0 };
    let frame = 0;
    let last = 0;
    let painted = -1;
    /** The chapter the story is at or playing to */
    let chapter: PaperStage = 0;
    /** Until when the page's scroll is held (a timestamp), 0 when it is free */
    let holdUntil = 0;
    /** When a wheel or a finger last moved the page */
    let gestureAt = 0;
    /** The step being held for has played: the hold ends with the gesture that started it */
    let played = false;

    /** The chapter the scroll is in. A wheel or a swipe moves the story one chapter at a time. */
    const scrolledTo = (): PaperStage => {
      pinned ??= isPinned(sticky);
      const { top, height } = track.getBoundingClientRect();
      const run = height - window.innerHeight;
      const reached = stageAt(trackProgress(top, height, window.innerHeight));
      if (reached === chapter || !pinned || prefersReducedMotion()) return (chapter = reached);
      const now = performance.now();
      // Only a gesture is held back: a jump by key, link or scrollbar goes where it was sent
      if (now - gestureAt > GESTURE_MS) return (chapter = reached);
      const next = (chapter + Math.sign(reached - chapter)) as PaperStage;
      if (next !== reached && run > 0) {
        // Flung past more than one step: back to the near edge of the next one
        const share = reached > chapter ? next + STEP_INSET : next + 1 - STEP_INSET;
        window.scrollTo({ top: window.scrollY + top + (run * share) / STAGE_COUNT, behavior: 'instant' });
      }
      holdUntil = now + HOLD_MAX_MS;
      played = false;
      return (chapter = next);
    };

    /** The rest of the chapter the scroll is in */
    const target = (): number => STAGE_RESTS[scrolledTo()];

    /** While a step plays, wheel and touch scrolling of the page is swallowed */
    const hold = (event: Event): void => {
      const now = performance.now();
      // Free again after the longest hold, or when the step has played and this is a new gesture
      if (holdUntil && (now > holdUntil || (played && now - gestureAt > HOLD_QUIET_MS))) holdUntil = 0;
      gestureAt = now;
      // Checked here as well as in the frame: several of these can arrive between two frames,
      // and each one that is let through carries the page further
      if (!holdUntil) scrolledTo();
      if (!holdUntil) return;
      if (event.cancelable) event.preventDefault();
      kick();
    };

    const paint = (p: number): void => {
      // Everything is read before anything is written, so a frame works out layout only once
      pinned ??= isPinned(sticky);
      // Listed instead of pinned, the stage rests on its last frame: the finished product
      const shown = pinned ? p : 1;
      if (shown !== painted) {
        painted = shown;
        stage3d.setProgress(shown);
        track.style.setProperty('--p', storyShare(shown).toFixed(4));
      }
      // The step list follows the picture, not the scroll: a step is named once its move is half played
      const stage = stageNear(p);
      if (stage !== this.stage()) this.stage.set(stage);
    };

    const loop = (now: number): void => {
      frame = 0;
      const elapsed = last ? Math.min(now - last, MAX_FRAME_MS) : FRAME_MS;
      last = now;
      const rest = target();
      playback = prefersReducedMotion() ? { at: rest, speed: 0 } : play(playback, rest, elapsed / 1000);
      paint(playback.at);
      if (holdUntil && Math.abs(rest - playback.at) < HOLD_UNTIL) played = true;
      if (playback.at === rest) last = 0;
      else frame = requestAnimationFrame(loop);
    };

    const kick = (): void => {
      if (!frame) frame = requestAnimationFrame(loop);
    };
    // A viewport too short to pin the stage lists the steps instead (a media query on height)
    const onResize = (): void => {
      pinned = null;
      kick();
    };

    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    // Not passive: holding the scroll means cancelling these
    window.addEventListener('wheel', hold, { passive: false });
    window.addEventListener('touchmove', hold, { passive: false });
    destroyRef.onDestroy(() => {
      window.removeEventListener('wheel', hold);
      window.removeEventListener('touchmove', hold);
      window.removeEventListener('scroll', kick);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frame);
    });

    // The first frame reads the new section's layout, the one the browser works out for that frame
    // anyway. Arriving mid-track (a reload, a jump to #how) starts on the right chapter, unanimated.
    frame = requestAnimationFrame(() => {
      frame = 0;
      pinned = isPinned(sticky);
      const { top, height } = track.getBoundingClientRect();
      chapter = stageAt(trackProgress(top, height, window.innerHeight));
      playback = { at: STAGE_RESTS[chapter], speed: 0 };
      paint(playback.at);
    });
  }
}
