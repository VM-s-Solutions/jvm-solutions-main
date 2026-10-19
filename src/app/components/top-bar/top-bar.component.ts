import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { filter, map } from 'rxjs';
import { IconComponent } from '../icon/icon.component';
import { LangMenuComponent } from '../lang-menu/lang-menu.component';
import { LogoComponent } from '../logo/logo.component';
import { LangService } from '../../services/lang.service';
import { NavToneService } from '../../services/nav-tone.service';
import { NAV_TABS, activeTabIndex } from './nav-tabs';

/**
 * The fixed top bar: logo, the page tabs with a thumb that slides to the active (or
 * hovered) tab, the language menu and the call to action. It frosts once the page
 * scrolls and turns dark over dark surfaces. Phones get the tab bar instead of the tabs.
 */
@Component({
  selector: 'jvm-top-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule, IconComponent, LangMenuComponent, LogoComponent],
  host: {
    role: 'banner',
    '[class.is-scrolled]': 'scrolled()',
    '[class.is-dark]': 'tone.dark()',
  },
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss',
})
export class TopBarComponent {
  protected readonly tone = inject(NavToneService);
  private readonly router = inject(Router);
  private readonly lang = inject(LangService);

  protected readonly tabs = NAV_TABS;
  protected readonly scrolled = signal(false);
  protected readonly hovered = signal<number | null>(null);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    // The root view renders before the router's first navigation, while router.url is still '/'
    { initialValue: inject(Location).path() },
  );
  protected readonly active = computed(() => activeTabIndex(this.url()));
  /** The tab the white thumb sits under: the hovered or focused one, else the page that's showing */
  protected readonly thumbAt = computed(() => this.hovered() ?? this.active());

  private readonly tabLinks = viewChildren('tab', { read: ElementRef<HTMLElement> });
  private readonly thumb = viewChild.required<ElementRef<HTMLElement>>('thumb');
  /** Bumped when fonts or the viewport change, so the thumb measures again */
  private readonly layoutTick = signal(0);

  constructor() {
    const destroyRef = inject(DestroyRef);
    const onScroll = () => {
      const next = window.scrollY > 8;
      if (next !== this.scrolled()) this.scrolled.set(next);
    };
    const onResize = () => this.layoutTick.update((n) => n + 1);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    // The real fonts swap in after the first paint, and the Cyrillic subset only once it's needed
    document.fonts?.addEventListener('loadingdone', onResize);
    destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.fonts?.removeEventListener('loadingdone', onResize);
    });
    document.fonts?.ready.then(onResize);
    onScroll();

    // Tab widths change with the language too
    afterRenderEffect(() => {
      this.lang.current();
      this.layoutTick();
      const index = this.thumbAt();
      const link = index >= 0 ? this.tabLinks()[index]?.nativeElement : undefined;
      const thumb = this.thumb().nativeElement;
      if (!link || !link.offsetWidth) {
        thumb.style.opacity = '0';
        return;
      }
      thumb.style.opacity = '1';
      thumb.style.width = `${link.offsetWidth}px`;
      thumb.style.transform = `translateX(${link.offsetLeft}px)`;
    });
  }

  /** A mouse moves the thumb to the tab under it; a tap leaves it on the page that's showing. */
  protected hoverTab(event: PointerEvent, index: number): void {
    if (event.pointerType === 'mouse') this.hovered.set(index);
  }
}
