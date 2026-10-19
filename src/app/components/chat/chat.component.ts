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
  ChatInterpolation,
  ChatScrollTarget,
  QuestionId,
  Sender,
  chatInterpolation,
  questionKey,
} from '../../services/chat-flow.service';
import { IDEA_MAX_LENGTH, IdeaService, cleanIdea } from '../../services/idea.service';
import { LangService } from '../../services/lang.service';
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
  readonly params: ChatInterpolation;
  readonly typed: string;
  readonly hasAction: boolean;
  readonly actionKey: string;
  readonly route: string | null;
  readonly scrollTo: ChatScrollTarget | null;
  readonly actionEnter: boolean;
}

type ChipView =
  | {
      readonly kind: 'question';
      readonly id: QuestionId;
      readonly key: string;
      readonly params: ChatInterpolation;
      readonly flown: boolean;
    }
  | { readonly kind: 'write'; readonly id: 'write' };

/** Where the visitor's words were on screen: the bubble's text flies in from there. */
interface FlipOrigin {
  readonly textLeft: number;
  readonly midY: number;
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
 * questions as chips; each answer brings a way onward (the board, pricing, the contact page).
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
  private readonly lang = inject(LangService);
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
    const lang = this.lang.current();
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
        params: chatInterpolation(params, lang),
        typed,
        hasAction: action !== null,
        actionKey: action?.key ?? '',
        route: target?.kind === 'route' ? target.path : null,
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

  private pendingFlip: { readonly id: number; readonly origin: FlipOrigin } | null = null;
  /** After the first render, scrolling to the newest message is smooth */
  private settled = false;

  constructor() {
    const destroyRef = inject(DestroyRef);

    // Keep the newest message in view. A bubble the visitor just sent flies in from where they
    // tapped or typed, so it measures its landing spot with the thread already at the bottom.
    afterRenderEffect(() => {
      this.messages();
      const flip = this.pendingFlip;
      this.pendingFlip = null;
      this.anchor();
      this.toBottom(!flip && this.settled);
      if (flip) this.fly(flip.id, flip.origin);
      this.settled = true;
    });

    // A new set of chips starts at its first one, even when the last set was swiped to its end
    afterRenderEffect(() => {
      if (this.reply() === 'chips') this.replyArea().nativeElement.scrollLeft = 0;
    });

    afterNextRender(() => {
      // When the reply options change height, keep the newest message in view above them
      const resize = new ResizeObserver(() => {
        this.anchor();
        this.toBottom(this.settled);
      });
      resize.observe(this.replyArea().nativeElement);
      resize.observe(this.body().nativeElement);
      resize.observe(this.thread().nativeElement);
      destroyRef.onDestroy(() => resize.disconnect());

      this.startWhenSeen(destroyRef);
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

  /** Carries a thread shorter than the window down to its bottom edge, with a transform rather than layout. */
  private anchor(): void {
    const body = this.body().nativeElement;
    const thread = this.thread().nativeElement;
    const pad = getComputedStyle(body);
    const room = body.clientHeight - parseFloat(pad.paddingTop) - parseFloat(pad.paddingBottom) - thread.offsetHeight;
    thread.style.transform = room > 0 ? `translateY(${room}px)` : '';
  }

  private toBottom(smooth: boolean): void {
    const body = this.body().nativeElement;
    body.scrollTo({ top: body.scrollHeight, behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'instant' });
  }

  /** FLIP: the bubble starts where the visitor's words were and settles into the thread. */
  private fly(id: number, origin: FlipOrigin): void {
    if (prefersReducedMotion()) return;
    const bubble = this.body().nativeElement.querySelector<HTMLElement>(`[data-msg="${id}"] .bubble`);
    if (!bubble || typeof bubble.animate !== 'function') return;
    const to = bubble.getBoundingClientRect();
    const style = getComputedStyle(bubble);
    const dx = origin.textLeft - parseFloat(style.paddingLeft) - to.left;
    const dy = origin.midY - to.height / 2 - to.top;
    bubble.animate(
      [
        { transform: `translate(${dx}px, ${dy}px)`, borderRadius: PILL_RADIUS },
        { transform: 'none', borderRadius: style.borderRadius },
      ],
      { duration: FLIP_MS, easing: tokenEasing('--ios') },
    );
  }

  /** On a phone the chat sits below the fold: it starts talking once it's on screen. */
  private startWhenSeen(destroyRef: DestroyRef): void {
    if (this.flow.started()) return;
    if (!('IntersectionObserver' in window)) {
      this.flow.start();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.intersectionRatio >= START_RATIO)) return;
        observer.disconnect();
        this.flow.start();
      },
      { threshold: START_RATIO },
    );
    observer.observe(this.host);
    destroyRef.onDestroy(() => observer.disconnect());
  }
}
