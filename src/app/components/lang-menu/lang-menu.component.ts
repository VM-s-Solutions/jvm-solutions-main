import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
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
    '(document:click)': 'closeOnOutside($event)',
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

  toggle(): void {
    this.open.update((v) => !v);
  }

  choose(code: Lang): void {
    this.lang.use(code);
    this.open.set(false);
    this.trigger().nativeElement.focus();
  }

  closeOnOutside(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) this.open.set(false);
  }

  closeOnEscape(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.trigger().nativeElement.focus();
  }

  /**
   * Tabbing out of the list closes it. Focus going nowhere (a click on the page; Safari doesn't
   * focus buttons on click) is left to closeOnOutside.
   */
  closeOnFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (this.open() && next instanceof Node && !this.host.nativeElement.contains(next)) this.open.set(false);
  }
}
