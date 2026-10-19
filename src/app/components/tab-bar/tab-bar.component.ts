import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { filter, map } from 'rxjs';
import { IconComponent } from '../icon/icon.component';
import { TAB_BAR, activeTabIndex } from '../top-bar/nav-tabs';

/** The floating tab bar phones get instead of the top bar's tabs. */
@Component({
  selector: 'jvm-tab-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule, IconComponent],
  templateUrl: './tab-bar.component.html',
  styleUrl: './tab-bar.component.scss',
})
export class TabBarComponent {
  private readonly router = inject(Router);

  protected readonly tabs = TAB_BAR;

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    // The root view renders before the router's first navigation, while router.url is still '/'
    { initialValue: inject(Location).path() },
  );
  protected readonly active = computed(() => activeTabIndex(this.url(), TAB_BAR));
}
