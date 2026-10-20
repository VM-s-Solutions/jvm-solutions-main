import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IconComponent } from '../icon/icon.component';
import { LANGS, Lang, LangService } from '../../services/lang.service';

/**
 * Language switcher: a small pill that discloses the four languages, each in its own name.
 * A plain disclosure (aria-expanded), not a menu: Tab moves through the options.
 */
@Component({
  selector: 'jvm-lang-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, IconComponent],
  host: {
    '(document:keydown.escape)': 'closeOnEscape()',
    '(focusout)': 'closeOnFocusOut($event)',
  },
  templateUrl: './lang-menu.component.html',
  styleUrl: './lang-menu.component.scss',
})
export class LangMenuComponent {
  private readonly lang = inject(LangService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  protected readonly langs = LANGS;
  protected readonly open = signal(false);
  protected readonly current = this.lang.current;
  protected readonly currentShort = computed(() => LANGS.find((l) => l.code === this.current())?.short ?? 'EN');

  constructor() {
    // A click anywhere else closes the list. The listener lives only while the list is open: one
    // bound for good would run change detection on every click on the page. The effect runs after
    // the opening click has finished, so that click can't close the list it opened.
    effect((onCleanup) => {
      if (!this.open()) return;
      const closeOnOutside = (event: MouseEvent) => {
        const { target } = event;
        if (!(target instanceof Node && this.host.nativeElement.contains(target))) this.open.set(false);
      };
      document.addEventListener('click', closeOnOutside);
      onCleanup(() => document.removeEventListener('click', closeOnOutside));
    });
  }

  toggle(): void {
    this.open.update((v) => !v);
  }

  choose(code: Lang): void {
    this.lang.use(code);
    this.open.set(false);
    this.trigger().nativeElement.focus();
  }

  closeOnEscape(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.trigger().nativeElement.focus();
  }

  /**
   * Tabbing out of the list closes it. Focus going nowhere (a click on the page; Safari doesn't
   * focus buttons on click) is left to the outside-click listener.
   */
  closeOnFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (this.open() && next instanceof Node && !this.host.nativeElement.contains(next)) this.open.set(false);
  }
}
