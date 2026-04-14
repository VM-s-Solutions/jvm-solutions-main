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
      const win = window as Window & { turnstile?: TurnstileAPI };

      const render = () => {
        this.widgetId = win.turnstile!.render(this.container().nativeElement, {
          sitekey: this.siteKey(),
          theme: 'dark',
          callback: (token: string) => this.resolved.emit(token),
          'expired-callback': () => this.resolved.emit(null),
          'error-callback': () => this.resolved.emit(null),
        });
      };

      if (win.turnstile) {
        render();
      } else {
        // Script not yet evaluated (fast navigation / slow connection)
        window.addEventListener('load', render, { once: true });
      }
    });
  }

  reset(): void {
    const win = window as Window & { turnstile?: TurnstileAPI };
    if (this.widgetId !== undefined) {
      win.turnstile?.reset(this.widgetId);
    }
    this.resolved.emit(null);
  }

  ngOnDestroy(): void {
    const win = window as Window & { turnstile?: TurnstileAPI };
    if (this.widgetId !== undefined) {
      win.turnstile?.remove(this.widgetId);
    }
  }
}
