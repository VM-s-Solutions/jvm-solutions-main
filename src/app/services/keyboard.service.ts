import { Injectable, signal } from '@angular/core';

/**
 * Turns on at the first Tab press and stays on. The deferred blocks render then, whatever
 * their other triggers, so keyboard users meet every section in reading order instead of
 * tabbing straight past a placeholder.
 */
@Injectable({ providedIn: 'root' })
export class KeyboardService {
  private readonly tabbedOnce = signal(false);
  readonly tabbed = this.tabbedOnce.asReadonly();

  constructor() {
    const onKeydown = (event: KeyboardEvent): void => {
      if (event.key !== 'Tab') return;
      this.tabbedOnce.set(true);
      document.removeEventListener('keydown', onKeydown, true);
    };
    document.addEventListener('keydown', onKeydown, true);
  }
}
