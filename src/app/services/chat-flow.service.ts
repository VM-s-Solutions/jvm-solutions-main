import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CONSULTATION_PARAMS } from './consultation';
import { IdeaService, cleanIdea } from './idea.service';
import { prefersReducedMotion } from './motion';
import { PersonId } from './team';

/** Who said it: one of us, or the visitor. */
export type Sender = PersonId | 'me';

/** The four things a visitor can ask us in the hero chat. */
export type QuestionId = 'idea' | 'team' | 'care' | 'advice';

/** What the reply area offers: the name box, the question chips, or nothing while we answer. */
export type ReplyMode = 'none' | 'name' | 'chips';

/** A chip on offer. "Write to us directly" stands in once all four questions are asked. */
export type OfferId = QuestionId | 'write';

/** The reply-area control that just turned into the visitor's bubble. */
export type FlownId = QuestionId | 'noName';

/** Values a message is written around: the idea's name. */
export interface ChatParams {
  readonly name?: string;
}

/** A place further down the page; keyboard focus follows to `focusId` once the page is there. */
export interface ChatScrollTarget {
  readonly kind: 'scroll';
  readonly id: string;
  readonly focusId: string;
}

/** A page to open; `queryParams` can pick the contact form's topic (CONSULTATION_PARAMS). */
export interface ChatRouteTarget {
  readonly kind: 'route';
  readonly path: string;
  readonly queryParams?: Readonly<Record<string, string>>;
}

export type ChatTarget = ChatScrollTarget | ChatRouteTarget;

export interface ChatAction {
  readonly key: string;
  readonly target: ChatTarget;
  /** Stamp of the moment it appeared */
  readonly at: number;
}

/**
 * One message. Ours are kept as a translation key plus params, so the whole conversation
 * re-translates when the language changes; the visitor's typed name stays exactly as typed.
 */
export interface ChatMessage {
  /** Unique; also the stamp of the moment it was added */
  readonly id: number;
  readonly from: Sender;
  /** Translation key, or null when the message is the visitor's own words (`typed`) */
  readonly key: string | null;
  readonly params: ChatParams;
  readonly typed: string;
  /** Still showing the three dots */
  readonly typing: boolean;
  /** Stamp of the moment the text appeared (0 while typing) */
  readonly shownAt: number;
  /** A button under the bubble, added a beat after the text */
  readonly action: ChatAction | null;
}

/** A sentence, with a variant written around the idea's name where one exists. */
interface Phrase {
  readonly key: string;
  readonly named?: string;
}

interface Line extends Phrase {
  readonly from: PersonId;
}

type Words = { readonly typed: string } | { readonly key: string; readonly params?: ChatParams };

type ActionSpec = Omit<ChatAction, 'at'>;

interface Question {
  readonly label: Phrase;
  readonly answers: readonly Line[];
  readonly action: ActionSpec;
}

// ─── Timings (ms), as in the concept. Reduced motion turns every wait into 0. ─────
const INTRO_DELAY = 800;
const INTRO_GAP = 240;
const ASK_NAME_DELAY = 200;
const REPLY_DELAY = 450;
const ANSWER_GAP = 260;
const ACTION_DELAY = 220;
const CHIPS_DELAY = 380;
const SKIPPED_CHIPS_DELAY = 300;
/** The reply area empties once the visitor's bubble has left it */
const CLEAR_REPLY_DELAY = 320;
/** The dots show for 420ms plus 13ms a character, 1.5s at most */
const TYPING_BASE = 420;
const TYPING_PER_CHAR = 13;
const TYPING_MAX = 1500;

const TO_PAPER: ChatTarget = { kind: 'scroll', id: 'how', focusId: 'paper-title' };
const TO_CONTACT: ChatTarget = { kind: 'route', path: '/contact' };
const TO_CONSULTATION: ChatTarget = { kind: 'route', path: '/contact', queryParams: CONSULTATION_PARAMS };

const INTRO: readonly Line[] = [
  { from: 'j', key: 'chat.intro1' },
  { from: 'v', key: 'chat.intro2' },
  { from: 'm', key: 'chat.intro3' },
  { from: 'j', key: 'chat.askName' },
];

const NAMED: readonly Line[] = [
  { from: 'j', key: 'chat.named1' },
  { from: 'v', key: 'chat.named2' },
];

const SKIPPED: readonly Line[] = [{ from: 'j', key: 'chat.skipped' }];

const SEE_ON_PAPER: ActionSpec = { key: 'chat.seeOnPaper', target: TO_PAPER };

const QUESTION_ORDER: readonly QuestionId[] = ['idea', 'team', 'care', 'advice'];

const QUESTIONS: Readonly<Record<QuestionId, Question>> = {
  idea: {
    label: { key: 'chat.q.idea', named: 'chat.q.ideaNamed' },
    answers: [
      { from: 'j', key: 'chat.a.idea1', named: 'chat.a.idea1Named' },
      { from: 'j', key: 'chat.a.idea2' },
    ],
    action: { key: 'chat.act.idea', target: TO_PAPER },
  },
  team: {
    label: { key: 'chat.q.team', named: 'chat.q.teamNamed' },
    answers: [
      { from: 'j', key: 'chat.a.team1', named: 'chat.a.team1Named' },
      { from: 'v', key: 'chat.a.team2' },
    ],
    action: { key: 'chat.act.team', target: TO_CONTACT },
  },
  care: {
    label: { key: 'chat.q.care', named: 'chat.q.careNamed' },
    answers: [
      { from: 'm', key: 'chat.a.care1', named: 'chat.a.care1Named' },
      { from: 'm', key: 'chat.a.care2' },
    ],
    action: { key: 'chat.act.care', target: TO_CONTACT },
  },
  advice: {
    label: { key: 'chat.q.advice' },
    answers: [
      { from: 'v', key: 'chat.a.advice1', named: 'chat.a.advice1Named' },
      { from: 'v', key: 'chat.a.advice2' },
    ],
    action: { key: 'chat.act.advice', target: TO_CONSULTATION },
  },
};

function phraseKey(phrase: Phrase, name: string): string {
  return (name && phrase.named) || phrase.key;
}

/** The chip label for a question: written around the idea's name once it has one. */
export function questionKey(id: QuestionId, name: string): string {
  return phraseKey(QUESTIONS[id].label, name);
}

/**
 * The hero chat's conversation: who said what, what the reply area offers, and the timers
 * that pace it. It lives at the root, so a visitor who leaves the home page and comes back
 * finds the conversation where it got to instead of watching it replay.
 *
 * Every change is stamped with a rising number, so a view can tell what arrived while it
 * was watching (and animate only that).
 */
@Injectable({ providedIn: 'root' })
export class ChatFlowService {
  private readonly translate = inject(TranslateService);
  private readonly idea = inject(IdeaService);
  private readonly timers = new Set<number>();
  private readonly asked = new Set<QuestionId>();
  private clock = 0;
  /** Bumped whenever the reply area gets new content, so a stale clear-out can't wipe it */
  private replyVersion = 0;

  private readonly _messages = signal<readonly ChatMessage[]>([]);
  private readonly _reply = signal<ReplyMode>('none');
  private readonly _offered = signal<readonly OfferId[]>([]);
  private readonly _leaving = signal(false);
  private readonly _flown = signal<FlownId | null>(null);
  private readonly _busy = signal(false);
  private readonly _started = signal(false);

  readonly messages = this._messages.asReadonly();
  readonly reply = this._reply.asReadonly();
  /** The chips on offer, in order. Kept while they fade out, so nothing reflows under the flying bubble. */
  readonly offered = this._offered.asReadonly();
  /** The reply area's content is fading out after the visitor answered */
  readonly leaving = this._leaving.asReadonly();
  readonly flown = this._flown.asReadonly();
  /** We're talking: the visitor's next reply waits */
  readonly busy = this._busy.asReadonly();
  readonly started = this._started.asReadonly();

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      for (const timer of this.timers) clearTimeout(timer);
      this.timers.clear();
    });
  }

  /** The latest stamp. Anything stamped after it is new to whoever asks now. */
  stamp(): number {
    return this.clock;
  }

  /** The three of us introduce ourselves, then ask what the idea is called. Runs once. */
  start(): void {
    if (this._started()) return;
    this._started.set(true);
    void this.intro();
  }

  /** The visitor named their idea. Returns their bubble's id, or null if this wasn't the moment. */
  submitName(raw: string): number | null {
    const name = cleanIdea(raw);
    if (!name || !this.canReply('name')) return null;
    this._busy.set(true);
    const id = this.mine({ typed: name }, null);
    this.idea.set(name);
    void this.afterName(name);
    return id;
  }

  /** "No name yet". Returns the visitor's bubble id, or null if this wasn't the moment. */
  skipName(): number | null {
    if (!this.canReply('name')) return null;
    this._busy.set(true);
    const id = this.mine({ key: 'chat.noName' }, 'noName');
    void this.afterSkip();
    return id;
  }

  /** The visitor picked a question chip. Returns their bubble's id, or null if it isn't on offer. */
  ask(question: QuestionId): number | null {
    if (!this.canReply('chips') || !this._offered().includes(question)) return null;
    this._busy.set(true);
    this.asked.add(question);
    const name = this.idea.name();
    const { label } = QUESTIONS[question];
    const id = this.mine({ key: phraseKey(label, name), params: { name } }, question);
    void this.answer(QUESTIONS[question], name);
    return id;
  }

  // ─── The conversation ───────────────────────────────────────────────────────

  private async intro(): Promise<void> {
    this._busy.set(true);
    await this.wait(INTRO_DELAY);
    await this.sayAll(INTRO, '', INTRO_GAP);
    await this.wait(ASK_NAME_DELAY);
    this.setReply('name', []);
    this._busy.set(false);
  }

  private async afterName(name: string): Promise<void> {
    await this.respond(NAMED, name);
    await this.wait(ACTION_DELAY);
    this.attach(SEE_ON_PAPER);
    await this.wait(CHIPS_DELAY);
    this.offerQuestions();
  }

  private async afterSkip(): Promise<void> {
    await this.respond(SKIPPED, '');
    await this.wait(SKIPPED_CHIPS_DELAY);
    this.offerQuestions();
  }

  private async answer(question: Question, name: string): Promise<void> {
    await this.respond(question.answers, name);
    await this.wait(ACTION_DELAY);
    this.attach(question.action);
    await this.wait(CHIPS_DELAY);
    this.offerQuestions();
  }

  private async respond(lines: readonly Line[], name: string): Promise<void> {
    await this.wait(REPLY_DELAY);
    await this.sayAll(lines, name, ANSWER_GAP);
  }

  private async sayAll(lines: readonly Line[], name: string, gap: number): Promise<void> {
    for (const [i, line] of lines.entries()) {
      if (i > 0) await this.wait(gap);
      await this.say(line, name);
    }
  }

  /** One of us types for a moment, then the text appears. */
  private async say(line: Line, name: string): Promise<void> {
    const key = phraseKey(line, name);
    const params: ChatParams = name ? { name } : {};
    const id = this.push(line.from, { key, params }, true);
    const text: unknown = this.translate.instant(key, params);
    const length = typeof text === 'string' ? text.length : 0;
    await this.wait(Math.min(TYPING_MAX, TYPING_BASE + length * TYPING_PER_CHAR));
    this.patch(id, { typing: false, shownAt: this.tick() });
  }

  /** The visitor's bubble. What they answered with fades out, then the reply area empties. */
  private mine(words: Words, flown: FlownId | null): number {
    const id = this.push('me', words, false);
    this._leaving.set(true);
    this._flown.set(flown);
    const version = this.replyVersion;
    this.later(CLEAR_REPLY_DELAY, () => {
      if (version === this.replyVersion) this.setReply('none', []);
    });
    return id;
  }

  private offerQuestions(): void {
    const left = QUESTION_ORDER.filter((id) => !this.asked.has(id));
    this.setReply('chips', left.length ? left : ['write']);
    this._busy.set(false);
  }

  private canReply(mode: ReplyMode): boolean {
    return !this._busy() && !this._leaving() && this._reply() === mode;
  }

  // ─── State ──────────────────────────────────────────────────────────────────

  private tick(): number {
    return ++this.clock;
  }

  private push(from: Sender, words: Words, typing: boolean): number {
    const id = this.tick();
    const isKey = 'key' in words;
    const message: ChatMessage = {
      id,
      from,
      key: isKey ? words.key : null,
      params: isKey ? (words.params ?? {}) : {},
      typed: isKey ? '' : words.typed,
      typing,
      shownAt: typing ? 0 : id,
      action: null,
    };
    this._messages.update((list) => [...list, message]);
    return id;
  }

  private patch(id: number, change: Partial<Pick<ChatMessage, 'typing' | 'shownAt' | 'action'>>): void {
    this._messages.update((list) => list.map((m) => (m.id === id ? { ...m, ...change } : m)));
  }

  /** Adds the action button under the latest message. */
  private attach(action: ActionSpec): void {
    const last = this._messages().at(-1);
    if (last) this.patch(last.id, { action: { ...action, at: this.tick() } });
  }

  private setReply(mode: ReplyMode, offered: readonly OfferId[]): void {
    this.replyVersion++;
    this._reply.set(mode);
    this._offered.set(offered);
    this._leaving.set(false);
    this._flown.set(null);
  }

  // ─── Timers ─────────────────────────────────────────────────────────────────

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => this.later(ms, resolve));
  }

  private later(ms: number, run: () => void): void {
    const timer = window.setTimeout(() => {
      this.timers.delete(timer);
      run();
    }, prefersReducedMotion() ? 0 : ms);
    this.timers.add(timer);
  }
}
