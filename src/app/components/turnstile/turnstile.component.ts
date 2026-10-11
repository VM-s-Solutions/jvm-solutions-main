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
import { ThemeService } from '../../services/theme.service';

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

// Zone.js patches window.on* properties, which breaks the onload= callback approach.
// Instead we poll for window.turnstile every 50 ms (max ~5 s) after the component mounts.
type TurnstileWin = Window & {
  turnstile?: TurnstileAPI;
};

function whenTurnstileReady(callback: () => void): () => void {
  const win = window as TurnstileWin;
  if (win.turnstile) {
    callback();
    return () => {};
  }
  let attempts = 0;
  const id = setInterval(() => {
    attempts++;
    if (win.turnstile) {
      clearInterval(id);
      callback();
    } else if (attempts >= 100) {
      // ~5 s timeout — give up silently; widget simply won't render
      clearInterval(id);
    }
  }, 50);
  return () => clearInterval(id);
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

  private readonly container = viewChild.required<ElementRef<HTMLElement>>('container');
  private readonly themeService = inject(ThemeService);
  private widgetId: string | undefined;
  private cancelPoll: (() => void) | undefined;

  constructor() {
    afterNextRender(() => {
      this.cancelPoll = whenTurnstileReady(() => this.render());
    });

    // A live widget can't be restyled — re-mount it when the site theme flips.
    effect(() => {
      this.themeService.theme();
      untracked(() => {
        if (this.widgetId === undefined) return;
        (window as TurnstileWin).turnstile?.remove(this.widgetId);
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
      theme: this.themeService.theme(),
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
    this.cancelPoll?.();
    const win = window as TurnstileWin;
    if (this.widgetId !== undefined) {
      win.turnstile?.remove(this.widgetId);
    }
  }
}
