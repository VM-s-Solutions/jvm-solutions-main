import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  computed,
  inject,
  linkedSignal,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '../icon/icon.component';
import { MessageComponent } from '../message/message.component';
import {
  ChatFlowService,
  ChatParams,
  ChatRouteTarget,
  ChatScrollTarget,
  QuestionId,
  Sender,
  questionKey,
} from '../../services/chat-flow.service';
import { IDEA_MAX_LENGTH, IdeaService, cleanIdea } from '../../services/idea.service';
import { prefersReducedMotion } from '../../services/motion';
import { ScrollService } from '../../services/scroll.service';
import { TEAM, TEAM_ORDER } from '../../services/team';

interface MessageView {
  readonly id: number;
  readonly from: Sender;
  /** First of a run from the same sender: shows the face and the name */
  readonly first: boolean;
  readonly typing: boolean;
  /** Arrived while this view was on screen: the row rises in */
  readonly enter: boolean;
  /** The text appeared while this view was on screen: the bubble pops */
  readonly pop: boolean;
  readonly key: string | null;
  readonly params: ChatParams;
  readonly typed: string;
  readonly hasAction: boolean;
  readonly actionKey: string;
  readonly route: ChatRouteTarget | null;
  readonly scrollTo: ChatScrollTarget | null;
  readonly actionEnter: boolean;
}

type ChipView =
  | {
      readonly kind: 'question';
      readonly id: QuestionId;
      readonly key: string;
      readonly params: ChatParams;
      readonly flown: boolean;
    }
  | { readonly kind: 'write'; readonly id: 'write' };

/** Where the visitor's words were on screen: the bubble's text flies in from there. */
interface FlipOrigin {
  readonly textLeft: number;
  readonly midY: number;
}

/** The visitor's bubble on its way into the thread */
interface PendingFlip {
  readonly id: number;
  readonly origin: FlipOrigin;
}

/** The flying bubble as measured, before the thread moves */
interface Flight {
  readonly bubble: HTMLElement;
  readonly origin: FlipOrigin;
  readonly rect: DOMRect;
  readonly paddingLeft: number;
  readonly radius: string;
  readonly easing: string;
}

/** One measure of the thread in its window, taken before anything is written */
interface ThreadLayout {
  /** Height left below a thread shorter than the window; negative once it overflows */
  readonly room: number;
  readonly scrollTop: number;
  readonly flight: Flight | null;
  /** The newest message eases into view; otherwise it's simply there */
  readonly smooth: boolean;
}

/** The chat starts talking once this much of it is on screen (it sits below the fold on phones). */
const START_RATIO = 0.35;
const FLIP_MS = 560;
/** The chip the visitor tapped is a pill; the bubble keeps its pill shape most of the flight */
const PILL_RADIUS = '999px';
const SHAKE_MS = 380;
const SHAKE: Keyframe[] = [
  { transform: 'none' },
  { transform: 'translateX(-6px)' },
  { transform: 'translateX(5px)' },
  { transform: 'translateX(-3px)' },
  { transform: 'none' },
];

/** A motion curve from the design tokens (--ease, --ios). */
function tokenEasing(name: '--ease' | '--ios'): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || 'ease-out';
}

function textOrigin(el: HTMLElement): FlipOrigin {
  const rect = el.getBoundingClientRect();
  return {
    textLeft: rect.left + parseFloat(getComputedStyle(el).paddingLeft),
    midY: rect.top + rect.height / 2,
  };
}

/**
 * The hero's live chat with the three of us. It asks for the idea's name first, then offers
 * questions as chips; each answer brings a way onward (the board or the contact page).
 * The conversation itself lives in ChatFlowService; this view draws it, keeps the newest
 * message in view and flies the visitor's bubble in from where they tapped or typed.
 */
@Component({
  selector: 'jvm-chat',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, IconComponent, MessageComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  private readonly flow = inject(ChatFlowService);
  private readonly idea = inject(IdeaService);
  private readonly scroll = inject(ScrollService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  private readonly body = viewChild.required<ElementRef<HTMLElement>>('body');
  private readonly thread = viewChild.required<ElementRef<HTMLElement>>('thread');
  private readonly replyArea = viewChild.required<ElementRef<HTMLElement>>('replyGroup');
  private readonly nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');

  protected readonly faces = TEAM_ORDER.map((id) => TEAM[id]);
  protected readonly maxLength = IDEA_MAX_LENGTH;
  protected readonly reply = this.flow.reply;
  protected readonly leaving = this.flow.leaving;
  /** On phones the question chips scroll sideways in one row */
  protected readonly isRow = computed(() => this.reply() === 'chips');
  protected readonly skipFlown = computed(() => this.flow.flown() === 'noName');

  /** The name box shows the idea's current name, and follows it while the visitor isn't typing there */
  protected readonly draft = linkedSignal<string, string>({
    source: this.idea.name,
    computation: (name, previous) => (previous && this.typingName() ? previous.value : name),
  });
  /** The visitor sent the name box empty (cleared as soon as they type) */
  private readonly sentEmpty = signal(false);
  /** ...and it still is: the box says what it needs instead of its placeholder */
  protected readonly nameMissing = computed(() => this.sentEmpty() && !cleanIdea(this.draft()));

  /** What was already said when this view appeared renders settled, without replaying */
  private readonly mountedAt = this.flow.stamp();

  protected readonly messages = computed<readonly MessageView[]>(() => {
    const since = this.mountedAt;
    let previous: Sender | null = null;
    return this.flow.messages().map(({ id, from, key, params, typed, typing, shownAt, action }) => {
      const theirs = from !== 'me';
      const target = action?.target;
      const view: MessageView = {
        id,
        from,
        first: from !== previous,
        typing,
        enter: theirs && id > since,
        pop: theirs && shownAt > since,
        key,
        params,
        typed,
        hasAction: action !== null,
        actionKey: action?.key ?? '',
        route: target?.kind === 'route' ? target : null,
        scrollTo: target?.kind === 'scroll' ? target : null,
        actionEnter: action !== null && action.at > since,
      };
      previous = from;
      return view;
    });
  });

  protected readonly chips = computed<readonly ChipView[]>(() => {
    const name = this.idea.name();
    const flown = this.flow.flown();
    return this.flow.offered().map((id): ChipView =>
      id === 'write'
        ? { kind: 'write', id }
        : { kind: 'question', id, key: questionKey(id, name), params: { name }, flown: id === flown },
    );
  });

  private pendingFlip: PendingFlip | null = null;
  /** After the first render, scrolling to the newest message is smooth */
  private settled = false;
  /** Off screen, the thread scrolls straight to its end: nobody watches it ease */
  private onScreen = true;
  /** How far the thread is carried down, and where the window was last told to scroll */
  private shift = 0;
  private scrolledTo = Number.NaN;
  /** A pass the ResizeObserver asked for, due next frame */
  private resizeFrame = 0;

  constructor() {
    const destroyRef = inject(DestroyRef);

    // A new set of chips starts at its first one, even when the last set was swiped to its end.
    // Ahead of the thread's own write below, so the layout it needs is still the measured one.
    afterRenderEffect({
      write: () => {
        if (this.reply() === 'chips') this.replyArea().nativeElement.scrollLeft = 0;
      },
    });

    // Keep the newest message in view: one measure, then one write, with no read in between. A
    // bubble the visitor just sent flies in from where they tapped or typed.
    afterRenderEffect({
      earlyRead: () => {
        this.messages();
        const flip = this.pendingFlip;
        this.pendingFlip = null;
        const layout = this.measure(flip, !flip && this.settled);
        this.settled = true;
        return layout;
      },
      write: (layout) => this.apply(layout()),
    });

    afterNextRender(() => {
      // When the reply options or the window change height, keep the newest message in view above
      // them: one pass in the next frame, however many sizes changed
      const resize = new ResizeObserver(() => {
        this.resizeFrame ||= requestAnimationFrame(() => {
          this.resizeFrame = 0;
          this.apply(this.measure(null, this.settled));
        });
      });
      resize.observe(this.replyArea().nativeElement);
      resize.observe(this.body().nativeElement);
      resize.observe(this.thread().nativeElement);
      destroyRef.onDestroy(() => {
        resize.disconnect();
        cancelAnimationFrame(this.resizeFrame);
      });

      this.watchView(destroyRef);
    });
  }

  protected onDraft(value: string): void {
    this.draft.set(value);
    this.sentEmpty.set(false);
  }

  protected submitName(event: Event, form: HTMLFormElement, input: HTMLInputElement): void {
    event.preventDefault();
    if (this.flow.busy()) return;
    if (!cleanIdea(input.value)) {
      // Nothing but spaces counts as empty: clear them, so the box shows what it needs instead
      this.draft.set('');
      this.sentEmpty.set(true);
      input.focus();
      if (!prefersReducedMotion()) form.animate(SHAKE, { duration: SHAKE_MS, easing: tokenEasing('--ease') });
      return;
    }
    this.sentEmpty.set(false);
    const origin = textOrigin(input);
    const keepFocus = this.replyHasFocus();
    // Closes the keyboard on phones
    input.blur();
    this.sent(this.flow.submitName(input.value), origin, keepFocus);
  }

  protected skip(chip: HTMLElement): void {
    const origin = textOrigin(chip);
    const keepFocus = this.replyHasFocus();
    this.sent(this.flow.skipName(), origin, keepFocus);
  }

  protected ask(question: QuestionId, chip: HTMLElement): void {
    const origin = textOrigin(chip);
    const keepFocus = this.replyHasFocus();
    this.sent(this.flow.ask(question), origin, keepFocus);
  }

  /** Down to the section, and keyboard focus with it, so the next Tab carries on from there. */
  protected scrollTo({ id, focusId }: ChatScrollTarget): void {
    this.scroll.scrollTo(id, focusId);
  }

  /**
   * The visitor's bubble is on its way (id null: the flow wasn't ready for it). Keyboard focus
   * waits on the reply group, so Tab reaches the next chips as soon as they appear.
   */
  private sent(id: number | null, origin: FlipOrigin, keepFocus: boolean): void {
    if (id === null) return;
    this.pendingFlip = { id, origin };
    if (keepFocus) this.replyArea().nativeElement.focus({ preventScroll: true });
  }

  private replyHasFocus(): boolean {
    return this.replyArea().nativeElement.contains(document.activeElement);
  }

  private typingName(): boolean {
    const input = untracked(this.nameInput)?.nativeElement;
    return !!input && document.activeElement === input;
  }

  /** Reads how the thread sits in its window, and where a bubble that flies in has landed. Reads only. */
  private measure(flip: PendingFlip | null, smooth: boolean): ThreadLayout {
    // This pass covers whatever a resize asked for
    cancelAnimationFrame(this.resizeFrame);
    this.resizeFrame = 0;
    const body = this.body().nativeElement;
    const pad = getComputedStyle(body);
    const room =
      body.clientHeight -
      parseFloat(pad.paddingTop) -
      parseFloat(pad.paddingBottom) -
      this.thread().nativeElement.offsetHeight;
    return {
      room,
      scrollTop: body.scrollTop,
      flight: flip && this.measureFlight(flip),
      smooth: smooth && this.onScreen && !prefersReducedMotion(),
    };
  }

  private measureFlight({ id, origin }: PendingFlip): Flight | null {
    if (prefersReducedMotion()) return null;
    const bubble = this.body().nativeElement.querySelector<HTMLElement>(`[data-msg="${id}"] .bubble`);
    if (!bubble || typeof bubble.animate !== 'function') return null;
    const { paddingLeft, borderRadius } = getComputedStyle(bubble);
    return {
      bubble,
      origin,
      rect: bubble.getBoundingClientRect(),
      paddingLeft: parseFloat(paddingLeft),
      radius: borderRadius,
      easing: tokenEasing('--ios'),
    };
  }

  /**
   * Carries a thread shorter than the window down to its bottom edge, with a transform rather than
   * layout, and scrolls a longer one to its end. Writes only.
   */
  private apply({ room, scrollTop, flight, smooth }: ThreadLayout): void {
    const shift = Math.max(0, room);
    const top = Math.max(0, -room);
    // Scrolled before the thread moves: the layout is still the measured one, and the end is in reach
    // whatever the old offset. An end already on its way isn't asked for again (a smooth scroll would
    // start over); a flight always lands on it at once.
    if (top !== this.scrolledTo || flight) {
      this.body().nativeElement.scrollTo({ top, behavior: smooth ? 'smooth' : 'instant' });
      this.scrolledTo = top;
    }
    // How far the thread's content moves on screen, so the bubble's landing spot needs no new measure
    const moved = shift - this.shift - (top - scrollTop);
    if (shift !== this.shift) {
      this.thread().nativeElement.style.transform = shift > 0 ? `translateY(${shift}px)` : '';
      this.shift = shift;
    }
    if (flight) this.fly(flight, moved);
  }

  /**
   * FLIP: the bubble starts where the visitor's words were and settles into the thread. The flight
   * is transform alone, so it runs on the compositor; the corner morph is a separate effect, which
   * repaints on the main thread without holding the flight back.
   */
  private fly({ bubble, origin, rect, paddingLeft, radius, easing }: Flight, moved: number): void {
    const dx = origin.textLeft - paddingLeft - rect.left;
    const dy = origin.midY - rect.height / 2 - (rect.top + moved);
    const timing: KeyframeAnimationOptions = { duration: FLIP_MS, easing };
    bubble.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], timing);
    bubble.animate([{ borderRadius: PILL_RADIUS }, { borderRadius: radius }], timing);
  }

  /**
   * Follows the chat in and out of view: off screen its thread scrolls without easing, and on a
   * phone, where it sits below the fold, it starts talking once it's well on screen.
   */
  private watchView(destroyRef: DestroyRef): void {
    if (!('IntersectionObserver' in window)) {
      this.flow.start();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const { isIntersecting, intersectionRatio } of entries) {
          this.onScreen = isIntersecting;
          if (intersectionRatio >= START_RATIO) this.flow.start();
        }
      },
      { threshold: [0, START_RATIO] },
    );
    observer.observe(this.host);
    destroyRef.onDestroy(() => observer.disconnect());
  }
}
