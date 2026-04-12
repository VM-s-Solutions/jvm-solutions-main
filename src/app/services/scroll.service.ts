import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScrollService {
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
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}
