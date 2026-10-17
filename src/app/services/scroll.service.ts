import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScrollService {
  /** Height of the fixed navbar — keep in sync with $nav-height (4.25rem). */
  readonly navbarHeight = 68;
  /** Where a scrolled-to element lands: just below the navbar. */
  readonly topOffset = this.navbarHeight + 12;

  private pending = signal<string | null>(null);

  schedule(fragment: string): void {
    this.pending.set(fragment);
  }

  consume(): string | null {
    const val = this.pending();
    this.pending.set(null);
    return val;
  }

  scrollTo(fragment: string): void {
    const el = document.getElementById(fragment);
    if (el) {
      this.scrollToEl(el);
    } else {
      const observer = new MutationObserver(() => {
        const found = document.getElementById(fragment);
        if (found) {
          observer.disconnect();
          this.scrollToEl(found);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => observer.disconnect(), 3000);
    }
  }

  private scrollToEl(el: HTMLElement): void {
    const top = el.getBoundingClientRect().top + window.scrollY - this.topOffset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}
