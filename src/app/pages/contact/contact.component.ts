import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
  viewChildren,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { IconComponent } from '../../components/icon/icon.component';
import { MessageComponent } from '../../components/message/message.component';
import { SplitTextComponent } from '../../components/split-text/split-text.component';
import { TurnstileComponent } from '../../components/turnstile/turnstile.component';
import { RevealDirective } from '../../directives/reveal.directive';
import { injectNow } from '../../services/clock';
import { TOPIC_PARAM } from '../../services/consultation';
import { ContactDraftService } from '../../services/contact-draft.service';
import {
  CONTACT_LIMITS,
  CONTACT_SERVICES,
  ContactPayload,
  ContactService,
  isValidEmail,
  isValidMessage,
  isValidName,
  serviceValueFor,
} from '../../services/contact.service';
import { replyByDate, replyByParts } from '../../services/dates';
import { IdeaService } from '../../services/idea.service';
import { LangService } from '../../services/lang.service';
import { prefersReducedMotion } from '../../services/motion';
import { TEAM, TEAM_ORDER } from '../../services/team';

type Status = 'idle' | 'submitting' | 'success' | 'error';

/** Fields that can be wrong, in the order focus visits them after a failed send */
type Field = 'name' | 'email' | 'service' | 'message';
const FIELDS: readonly Field[] = ['name', 'email', 'service', 'message'];

type Errors = Record<Field | 'captcha', boolean>;
const NO_ERRORS: Readonly<Errors> = { name: false, email: false, service: false, message: false, captcha: false };

/** What the fields hold; `service` is the picked pill's English value, '' while none is */
type Values = Record<Field | 'subject' | 'company', string>;
const EMPTY_VALUES: Readonly<Values> = { subject: '', name: '', email: '', company: '', service: '', message: '' };

const RULES: Readonly<Record<Field, (value: string) => boolean>> = {
  name: isValidName,
  email: isValidEmail,
  service: (value) => value !== '',
  message: isValidMessage,
};

/** Characters of the sent message its bubble shows */
const PREVIEW_MAX = 140;
/** Lets the page slide in before the name field takes focus (ms) */
const DRAFT_FOCUS_DELAY = 650;
/** Lets a result panel settle in before its button takes focus (ms) */
const PANEL_FOCUS_DELAY = 700;

/** The sent message as its bubble shows it: at most 140 characters, cut with an ellipsis. */
export function messagePreview(text: string): string {
  const chars = Array.from(text.trim());
  if (chars.length <= PREVIEW_MAX) return chars.join('');
  return `${chars.slice(0, PREVIEW_MAX - 3).join('').trimEnd()}…`;
}

/** For visitor text placed in a translation that is bound with [innerHTML]. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * The contact page: a mail window addressed to the three of us. The Subject carries the
 * idea's name, a message started in the home page composer arrives in the body, and the
 * form sends through ContactService once Turnstile has passed. The sent and failed states
 * take the form's place inside the same window.
 */
@Component({
  selector: 'jvm-contact',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    TranslateModule,
    IconComponent,
    MessageComponent,
    SplitTextComponent,
    TurnstileComponent,
    RevealDirective,
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  private readonly contact = inject(ContactService);
  private readonly idea = inject(IdeaService);
  private readonly lang = inject(LangService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  /** The time now, refreshed every minute and whenever the visitor comes back to the tab */
  private readonly now = injectNow();

  /** A link can pick the topic: every "Book a consultation" opens /contact?about=consultation */
  private readonly topic = serviceValueFor(inject(ActivatedRoute).snapshot.queryParamMap.get(TOPIC_PARAM));
  /** A message started in the home page composer arrives once, as the message field's first value */
  protected readonly draft = inject(ContactDraftService).take().slice(0, CONTACT_LIMITS.message);

  protected readonly siteKey = environment.turnstileSiteKey;
  protected readonly limits = CONTACT_LIMITS;
  protected readonly team = TEAM_ORDER.map((id) => TEAM[id]);
  protected readonly services = CONTACT_SERVICES.map(({ id, value }) => ({
    value,
    labelKey: `contact.services.${id}`,
    preset: value === this.topic, // starts picked: the topic the link asked for
  }));

  /**
   * What the fields hold, kept from their input and change events. Nothing writes a field while
   * the visitor types in it, so a word still being composed (IME) is never disturbed.
   */
  private readonly values = signal<Readonly<Values>>({ ...EMPTY_VALUES, service: this.topic, message: this.draft });

  protected readonly status = signal<Status>('idle');
  protected readonly sending = computed(() => this.status() === 'submitting');
  /** The form steps aside while a result panel shows */
  protected readonly away = computed(() => this.status() === 'success' || this.status() === 'error');
  protected readonly errors = signal<Readonly<Errors>>(NO_ERRORS);

  protected readonly titleKey = computed(() => (this.idea.hasName() ? 'contact.titleNamed' : 'contact.title'));
  protected readonly titleParams = computed(() => ({ name: this.idea.name() }));
  protected readonly leadKey = computed(() => (this.idea.hasName() ? 'contact.leadNamed' : 'contact.lead'));
  /** "You'll hear back by …" counts from now, so a tab left open never promises a time gone by */
  protected readonly leadParams = computed(() => ({
    name: escapeHtml(this.idea.name()),
    ...replyByParts(replyByDate(this.now()), this.lang.current()),
  }));

  private readonly sentNote = signal<{ text: string; replyBy: Date } | null>(null);
  /** What the sent panel shows. It outlives "Write another", so the panel fades out whole. */
  protected readonly sent = computed(() => {
    const note = this.sentNote();
    return note && { text: note.text, when: replyByParts(note.replyBy, this.lang.current()) };
  });

  /** Turnstile's token. Single-use: the server spends it, so every send needs a fresh one. */
  private readonly token = signal<string | null>(null);
  /** The Subject follows the idea's name until the visitor types their own */
  private subjectFollowsIdea = true;
  private readonly timers = new Set<number>();

  private readonly mail = viewChild.required<ElementRef<HTMLElement>>('mail');
  private readonly form = viewChild.required<ElementRef<HTMLFormElement>>('form');
  private readonly subjectInput = viewChild.required<ElementRef<HTMLInputElement>>('subjectInput');
  private readonly nameInput = viewChild.required<ElementRef<HTMLInputElement>>('nameInput');
  private readonly emailInput = viewChild.required<ElementRef<HTMLInputElement>>('emailInput');
  private readonly serviceInputs = viewChildren<ElementRef<HTMLInputElement>>('serviceInput');
  private readonly messageInput = viewChild.required<ElementRef<HTMLTextAreaElement>>('messageInput');
  private readonly sendButton = viewChild.required<ElementRef<HTMLButtonElement>>('sendButton');
  private readonly againButton = viewChild<ElementRef<HTMLButtonElement>>('againButton');
  private readonly retryButton = viewChild<ElementRef<HTMLButtonElement>>('retryButton');
  private readonly turnstile = viewChild(TurnstileComponent);

  constructor() {
    // Writes the field, and the value kept for it, on purpose: keeping the Subject on the idea's
    // name is the intent. Effects run on change detection, so the field exists by then.
    effect(() => {
      const name = this.idea.name();
      untracked(() => {
        if (this.subjectFollowsIdea) this.fillSubject(name);
      });
    });

    // With a draft in the message, the name is what's left to fill
    if (this.draft) {
      afterNextRender(() => this.later(() => this.focusIfFree(this.nameInput(), false), DRAFT_FOCUS_DELAY));
    }

    this.destroyRef.onDestroy(() => this.timers.forEach((id) => clearTimeout(id)));
  }

  /**
   * A field's input, or a pill's change: the value is kept, and a shown error clears as soon as
   * its field is right. An error only ever appears on blur or send, never while typing.
   */
  protected onField(field: keyof Values, value: string): void {
    this.store(field, value);
    this.clearFixed();
  }

  protected onSubjectInput(value: string): void {
    this.subjectFollowsIdea = false;
    this.onField('subject', value);
  }

  /** A field with something in it is checked as the visitor leaves it */
  protected onBlur(field: 'name' | 'email' | 'message'): void {
    if (this.values()[field] !== '') this.check(field);
  }

  protected onCaptcha(token: string | null): void {
    this.token.set(token);
    if (token && this.errors().captcha) this.errors.update((errors) => ({ ...errors, captcha: false }));
  }

  protected submit(event: Event): void {
    // Sent from here: the browser's own submission would load the page anew and lose the message
    event.preventDefault();
    if (this.sending()) return;
    const token = this.token();
    const errors: Errors = {
      name: !this.isValid('name'),
      email: !this.isValid('email'),
      service: !this.isValid('service'),
      message: !this.isValid('message'),
      captcha: !token,
    };
    this.errors.set(errors);

    const firstWrong = FIELDS.find((field) => errors[field]);
    if (firstWrong) {
      this.focusField(firstWrong);
      return;
    }
    // Without a token, the check's own message says what's missing
    if (token) this.send(token);
  }

  protected writeAnother(): void {
    this.clear();
    this.errors.set(NO_ERRORS);
    this.subjectFollowsIdea = true;
    this.fillSubject(this.idea.name());
    this.turnstile()?.reset();
    this.status.set('idle');
    afterNextRender(() => this.nameInput().nativeElement.focus(), { injector: this.injector });
  }

  protected retry(): void {
    this.status.set('idle');
    afterNextRender(() => this.sendButton().nativeElement.focus(), { injector: this.injector });
  }

  private send(captchaToken: string): void {
    const { subject, name, email, company, service, message } = this.values();
    const project = subject.trim();
    const companyName = company.trim();
    const payload: ContactPayload = {
      name: name.trim(),
      email: email.trim(),
      ...(companyName ? { company: companyName } : {}),
      ...(project ? { project } : {}),
      service,
      message: message.trim(),
      captchaToken,
      lang: this.lang.current(),
    };

    this.status.set('submitting');
    this.contact
      .send(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.onSent(payload.message),
        error: () => this.onFailed(),
      });
  }

  private onSent(message: string): void {
    this.sentNote.set({ text: messagePreview(message), replyBy: replyByDate(new Date()) });
    this.status.set('success');
    this.clear();
    this.errors.set(NO_ERRORS);
    this.token.set(null);
    this.focusWhenSettled(() => this.againButton());
  }

  private onFailed(): void {
    this.status.set('error');
    // The token may already be spent: a fresh check runs while the visitor reads the panel
    this.turnstile()?.reset();
    this.focusWhenSettled(() => this.retryButton());
  }

  private store(field: keyof Values, value: string): void {
    this.values.update((values) => ({ ...values, [field]: value }));
  }

  /** Puts the idea's name in the Subject. A field written from code fires no input event, so it keeps following. */
  private fillSubject(name: string): void {
    this.subjectInput().nativeElement.value = name;
    this.store('subject', name);
  }

  /**
   * Every field empty and no pill picked. The draft, the topic and the Subject were set as the
   * fields' current values, never as their defaults, so the form's native reset clears them too.
   */
  private clear(): void {
    this.form().nativeElement.reset();
    this.values.set(EMPTY_VALUES);
  }

  private isValid(field: Field): boolean {
    return RULES[field](this.values()[field]);
  }

  private check(field: Field): void {
    const wrong = !this.isValid(field);
    if (wrong !== this.errors()[field]) this.errors.update((errors) => ({ ...errors, [field]: wrong }));
  }

  private clearFixed(): void {
    const errors = this.errors();
    const fixed = FIELDS.filter((field) => errors[field] && this.isValid(field));
    if (fixed.length === 0) return;
    const next: Errors = { ...errors };
    for (const field of fixed) next[field] = false;
    this.errors.set(next);
  }

  private focusField(field: Field): void {
    const target = {
      name: this.nameInput(),
      email: this.emailInput(),
      service: this.serviceInputs()[0],
      message: this.messageInput(),
    }[field];
    const el = target?.nativeElement;
    if (!el) return;
    // Centred rather than flush with the top edge, where the fixed top bar would cover it
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }

  /** Moves focus into a result panel once it has rendered and slid in */
  private focusWhenSettled(target: () => ElementRef<HTMLElement> | undefined): void {
    afterNextRender(() => this.later(() => this.focusIfFree(target(), true), PANEL_FOCUS_DELAY), {
      injector: this.injector,
    });
  }

  /**
   * Moves focus without taking it from where the visitor has put it: only from nowhere
   * (the page itself, or `<main>`, where the app shell parks focus after every navigation)
   * or, with `fromMail`, from a control the window just hid.
   */
  private focusIfFree(target: ElementRef<HTMLElement> | undefined, fromMail: boolean): void {
    const active = document.activeElement;
    const free =
      !active ||
      active === document.body ||
      active === document.getElementById('main') ||
      (fromMail && this.mail().nativeElement.contains(active));
    if (free) target?.nativeElement.focus({ preventScroll: true });
  }

  /** A timeout that dies with the page, and doesn't wait when motion is reduced */
  private later(fn: () => void, ms: number): void {
    const id = window.setTimeout(
      () => {
        this.timers.delete(id);
        fn();
      },
      prefersReducedMotion() ? 0 : ms,
    );
    this.timers.add(id);
  }
}
