import { Injectable, signal } from '@angular/core';

export type Theme = 'dark' | 'light';

/** Browser chrome colour per theme — matches --bg-primary in styles.scss */
const THEME_COLOR: Record<Theme, string> = { dark: '#0A0A0A', light: '#F8F8F8' };

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'theme';

  readonly theme = signal<Theme>(this.resolveInitial());

  toggle(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.apply(next);
  }

  private resolveInitial(): Theme {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY) as Theme | null;
      if (saved === 'dark' || saved === 'light') return saved;
      return 'dark'; // default is always dark
    } catch {
      return 'dark';
    }
  }

  private apply(theme: Theme): void {
    this.theme.set(theme);
    document.documentElement.dataset['theme'] = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
    try { localStorage.setItem(this.STORAGE_KEY, theme); } catch { /* private/incognito */ }
  }
}
