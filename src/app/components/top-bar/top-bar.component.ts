import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  computed,
  inject,
  input,
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

/** A tab's place in the tabs row, in px */
interface TabBox {
  readonly left: number;
  readonly width: number;
}

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

  /** The page has scrolled past its first few pixels (AppComponent watches): the bar frosts */
  readonly scrolled = input(false);

  protected readonly tabs = NAV_TABS;
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
  /** Bumped when a tab's size changes, so the tabs are measured again */
  private readonly layoutTick = signal(0);
  /** Each tab's place in the row (null while the tabs are hidden), as last measured */
  private boxes: readonly (TabBox | null)[] = [];
  /** What `boxes` were measured for: the language, the layout tick and the number of tabs */
  private measuredFor = '';

  constructor() {
    const destroyRef = inject(DestroyRef);
    // Whatever changes a tab's size moves the thumb's target: the language, a font swapping in, the
    // desktop breakpoint showing the tabs, text-only zoom. A ResizeObserver hears all of them, after
    // layout, so listening reads nothing.
    afterNextRender(() => {
      const sizes = new ResizeObserver(() => this.layoutTick.update((n) => n + 1));
      for (const { nativeElement } of this.tabLinks()) sizes.observe(nativeElement);
      destroyRef.onDestroy(() => sizes.disconnect());
    });

    // The tabs are measured only when their labels or sizes change (language, fonts, width,
    // zoom), before any hook writes. A page change then just moves the thumb: it reads no
    // layout in the frame that builds the new page and starts its slide. The thumb keeps
    // animating its width, not a scale: scaling would squash the pill's round ends mid-glide.
    afterRenderEffect({
      earlyRead: () => {
        const links = this.tabLinks();
        const key = `${this.lang.current()}|${this.layoutTick()}|${links.length}`;
        if (key !== this.measuredFor) {
          this.measuredFor = key;
          // 0 wide while the tabs are hidden (phones)
          this.boxes = links.map(({ nativeElement: link }) =>
            link.offsetWidth ? { left: link.offsetLeft, width: link.offsetWidth } : null,
          );
        }
        const index = this.thumbAt();
        return index >= 0 ? (this.boxes[index] ?? null) : null;
      },
      write: (box) => {
        const thumb = this.thumb().nativeElement;
        const next = box();
        if (!next) {
          thumb.style.opacity = '0';
          return;
        }
        thumb.style.opacity = '1';
        thumb.style.width = `${next.width}px`;
        thumb.style.transform = `translateX(${next.left}px)`;
      },
    });
  }

  /** A mouse moves the thumb to the tab under it; a tap leaves it on the page that's showing. */
  protected hoverTab(event: PointerEvent, index: number): void {
    if (event.pointerType === 'mouse') this.hovered.set(index);
  }
}
