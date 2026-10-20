import { ViewportScroller } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { filter, skip } from 'rxjs';
import { FooterComponent } from './components/footer/footer.component';
import { TabBarComponent } from './components/tab-bar/tab-bar.component';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { KeyboardService } from './services/keyboard.service';
import { LangService } from './services/lang.service';
import { RenderQueueService } from './services/render-queue.service';
import { ScrollService } from './services/scroll.service';

/** The footer's place in the render queue: after the page's own deferred sections (order 0) */
const FOOTER_ORDER = 1;

@Component({
  selector: 'jvm-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, TranslateModule, TopBarComponent, TabBarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly document = inject(DOCUMENT);
  private readonly lang = inject(LangService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');
  private readonly topSentinel = viewChild.required<ElementRef<HTMLElement>>('topSentinel');
  protected readonly tabbed = inject(KeyboardService).tabbed;
  /** The render queue has reached the footer */
  protected readonly footerReady = signal(false);
  /** The page has scrolled past its first few pixels: the top bar frosts */
  protected readonly scrolled = signal(false);

  constructor() {
    // Screen readers pick pronunciation from <html lang>, so it follows the language switcher.
    effect(() => (this.document.documentElement.lang = this.lang.current()));

    // A sentinel over the page's first pixels tells the top bar when the page has scrolled.
    // An observer, not a scroll listener: reading scrollY on every scroll event forced style.
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      // A batch can hold several entries for the sentinel: the newest tells where the page is now
      const observer = new IntersectionObserver((entries) => this.scrolled.set(!entries[entries.length - 1].isIntersecting));
      observer.observe(this.topSentinel().nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });

    // The footer renders in an idle moment of its own, once the page's sections have had theirs
    inject(RenderQueueService).add(() => this.footerReady.set(true), FOOTER_ORDER);

    // A link to a section (/privacy#cookies) lands it below the fixed top bar.
    const scroll = inject(ScrollService);
    inject(ViewportScroller).setOffset(() => [0, scroll.topOffset]);

    // After a move to another page, keyboard and screen reader users start at its content rather
    // than on the link they followed. Not on the first load, and not when the router is taking
    // focus to an anchor of its own (#fragment).
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        skip(1),
        filter((event) => !this.router.parseUrl(event.urlAfterRedirects).fragment),
        takeUntilDestroyed(),
      )
      .subscribe(() =>
        afterNextRender(() => this.main().nativeElement.focus({ preventScroll: true }), { injector: this.injector }),
      );
  }

  /** With <base href="/"> a bare "#main" link would navigate home, so the skip link focuses in code. */
  skipToContent(event: MouseEvent): void {
    event.preventDefault();
    this.main().nativeElement.focus();
  }
}
