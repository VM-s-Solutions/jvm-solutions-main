import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'arrow'
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'check'
  | 'home'
  | 'grid'
  | 'tag'
  | 'people'
  | 'chat';

/**
 * Line icons on a 24px grid, drawn in currentColor. Decorative by default — the
 * control around an icon carries the label. Size it through the host (`.icon`).
 */
@Component({
  selector: 'jvm-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'icon', 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" focusable="false">
      @switch (name()) {
        @case ('arrow') { <path d="M5 12h14M13 6l6 6-6 6" stroke-width="2" /> }
        @case ('left') { <path d="M15 6l-6 6 6 6" stroke-width="2.2" /> }
        @case ('right') { <path d="M9 6l6 6-6 6" stroke-width="2.2" /> }
        @case ('up') { <path d="M12 19V5M6 11l6-6 6 6" stroke-width="2.4" /> }
        @case ('down') { <path d="M6 9l6 6 6-6" stroke-width="2.4" /> }
        @case ('check') { <path d="M5 12.5l4.5 4.5L19 7.5" stroke-width="2.4" /> }
        @case ('home') { <path d="M4 10.5L12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" stroke-width="1.8" /> }
        @case ('grid') {
          <rect x="4" y="4" width="7" height="7" rx="2" stroke-width="1.8" />
          <rect x="13" y="4" width="7" height="7" rx="2" stroke-width="1.8" />
          <rect x="4" y="13" width="7" height="7" rx="2" stroke-width="1.8" />
          <rect x="13" y="13" width="7" height="7" rx="2" stroke-width="1.8" />
        }
        @case ('tag') {
          <path d="M3.5 12.2V5a1.5 1.5 0 0 1 1.5-1.5h7.2a1.5 1.5 0 0 1 1 .44l7.4 7.4a1.5 1.5 0 0 1 0 2.12l-7.2 7.2a1.5 1.5 0 0 1-2.12 0l-7.4-7.4a1.5 1.5 0 0 1-.38-1.06z" stroke-width="1.8" />
          <circle cx="8.5" cy="8.5" r="1.6" fill="currentColor" stroke="none" />
        }
        @case ('people') {
          <circle cx="9" cy="8.5" r="3.2" stroke-width="1.8" />
          <path d="M3.5 19a5.5 5.5 0 0 1 11 0M15.5 5.6a3.2 3.2 0 0 1 0 5.8M17 14.2a5.5 5.5 0 0 1 3.5 4.8" stroke-width="1.8" />
        }
        @case ('chat') { <path d="M12 4c4.7 0 8.5 3.1 8.5 7s-3.8 7-8.5 7c-1 0-2-.13-2.9-.4L5 19.5l1.2-3.6C4.5 14.6 3.5 12.9 3.5 11 3.5 7.1 7.3 4 12 4z" stroke-width="1.8" /> }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-block;
      flex: none;
      width: 1.125rem;
      height: 1.125rem;
    }

    svg {
      width: 100%;
      height: 100%;
    }
  `,
})
export class IconComponent {
  readonly name = input.required<IconName>();
}
