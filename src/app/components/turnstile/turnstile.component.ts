import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  input,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import { LangService } from '../../services/lang.service';

interface TurnstileAPI {
  render(el: HTMLElement, options: TurnstileOptions): string;
  reset(id: string): void;
  remove(id: string): void;
}

interface TurnstileOptions {
  sitekey: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact' | 'flexible';
  /** ISO 639-1 code; without it Cloudflare follows the browser's language, not the site's */
  language?: string;
  callback?: (token: string) => void;
  'expired-callback'?: () => void;
  'error-callback'?: () => void;
}

type TurnstileWin = Window & {
  turnstile?: TurnstileAPI;
};

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let scriptLoad: Promise<void> | undefined;

// Only the contact form needs Turnstile, so its script is injected on first use
// rather than from index.html — every other page skips the ~27 kB download.
// Readiness comes from the <script> element's load event, so no global ?onload= callback is needed.
function loadTurnstile(): Promise<void> {
  scriptLoad ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => {
      // Drop the failed tag and promise so the next mount retries.
      script.remove();
      scriptLoad = undefined;
      reject();
    });
    document.head.appendChild(script);
  });
  return scriptLoad;
}

@Component({
  selector: 'jvm-turnstile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div #container></div>`,
  styles: [':host { display: block; }'],
})
export class TurnstileComponent implements OnDestroy {
  readonly siteKey = input.required<string>();
  readonly resolved = output<string | null>();

  private readonly lang = inject(LangService);
  private readonly container = viewChild.required<ElementRef<HTMLElement>>('container');
  private widgetId: string | undefined;
  private destroyed = false;

  constructor() {
    afterNextRender(() => {
      // On failure the widget simply doesn't render; submit then reports the missing captcha.
      loadTurnstile().then(
        () => {
          if (!this.destroyed) this.render();
        },
        () => {},
      );
    });

    // A live widget can't change its language: re-mount it in the one the visitor switched to.
    // Emitting from here is intended: the old token goes with the old widget, so the parent
    // holds none until the new one passes.
    effect(() => {
      this.lang.current();
      untracked(() => {
        if (this.widgetId === undefined) return;
        (window as TurnstileWin).turnstile?.remove(this.widgetId);
        this.widgetId = undefined;
        this.resolved.emit(null);
        this.render();
      });
    });
  }

  private render(): void {
    const turnstile = (window as TurnstileWin).turnstile;
    if (!turnstile) return;
    this.widgetId = turnstile.render(this.container().nativeElement, {
      sitekey: this.siteKey(),
      theme: 'light',
      size: 'flexible',
      language: this.lang.current(),
      callback: (token: string) => this.resolved.emit(token),
      'expired-callback': () => this.resolved.emit(null),
      'error-callback': () => this.resolved.emit(null),
    });
  }

  reset(): void {
    const win = window as TurnstileWin;
    if (this.widgetId !== undefined) {
      win.turnstile?.reset(this.widgetId);
    }
    this.resolved.emit(null);
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    const win = window as TurnstileWin;
    if (this.widgetId !== undefined) {
      win.turnstile?.remove(this.widgetId);
    }
  }
}
