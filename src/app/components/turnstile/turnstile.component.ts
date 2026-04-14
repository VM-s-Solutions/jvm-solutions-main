import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  input,
  output,
  viewChild,
} from '@angular/core';

interface TurnstileAPI {
  render(el: HTMLElement, options: TurnstileOptions): string;
  reset(id: string): void;
  remove(id: string): void;
}

interface TurnstileOptions {
  sitekey: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact' | 'flexible';
  callback?: (token: string) => void;
  'expired-callback'?: () => void;
  'error-callback'?: () => void;
}

// Cloudflare calls window.onTurnstileReady() when the API becomes available.
// We enqueue render callbacks here so SPA navigation works correctly.
type TurnstileWin = Window & {
  turnstile?: TurnstileAPI;
  onTurnstileReady?: () => void;
  _turnstileQueue?: Array<() => void>;
};

function whenTurnstileReady(callback: () => void): void {
  const win = window as TurnstileWin;
  if (win.turnstile) {
    // API already loaded (e.g. user navigated back to /contact)
    callback();
  } else {
    // Queue will be drained by window.onTurnstileReady defined in index.html
    win._turnstileQueue = win._turnstileQueue ?? [];
    win._turnstileQueue.push(callback);
  }
}

@Component({
  selector: 'app-turnstile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div #container></div>`,
})
export class TurnstileComponent implements OnDestroy {
  readonly siteKey = input.required<string>();
  readonly resolved = output<string | null>();

  private readonly container = viewChild.required<ElementRef<HTMLElement>>('container');
  private widgetId: string | undefined;

  constructor() {
    afterNextRender(() => {
      whenTurnstileReady(() => {
        const win = window as TurnstileWin;
        this.widgetId = win.turnstile!.render(this.container().nativeElement, {
          sitekey: this.siteKey(),
          theme: 'dark',
          callback: (token: string) => this.resolved.emit(token),
          'expired-callback': () => this.resolved.emit(null),
          'error-callback': () => this.resolved.emit(null),
        });
      });
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
    const win = window as TurnstileWin;
    if (this.widgetId !== undefined) {
      win.turnstile?.remove(this.widgetId);
    }
  }
}
