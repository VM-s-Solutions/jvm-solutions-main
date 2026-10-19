import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Text that settles in softly whenever it changes — the idea's name across the mock
 * screens, for instance. Each new value is a fresh element, so its fade replays.
 */
@Component({
  selector: 'jvm-swap-text',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@for (item of current(); track item.text) {<span class="swap">{{ item.text }}</span>}`,
  styles: `
    @use 'abstracts' as *;

    .swap {
      animation: soft-in $duration-swift $ease-out;
    }
  `,
})
export class SwapTextComponent {
  readonly text = input.required<string>();

  // A one-item list keyed by the text: a new text is a new element, so its fade replays
  protected readonly current = computed(() => [{ text: this.text() }]);
}
