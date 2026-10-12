import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { catchError, firstValueFrom, of } from 'rxjs';

const SUPPORTED_LANGS = ['en', 'cs', 'sk', 'uk'];

/** The saved choice, else the browser language, else English. */
function detectLang(): string {
  const saved = localStorage.getItem('lang');
  if (saved && SUPPORTED_LANGS.includes(saved)) return saved;
  const browser = navigator.language.split('-')[0].toLowerCase();
  return SUPPORTED_LANGS.includes(browser) ? browser : 'en';
}

/**
 * App initializer: loads the visitor's language before the first render, so the page
 * never paints in English first and `instant()` lookups at startup get the right strings.
 * index.html already preloads the locale file, so this rarely waits on the network.
 */
export function initTranslations(): Promise<unknown> {
  const translate = inject(TranslateService);
  translate.setDefaultLang('en');
  // A failed locale download falls back to English instead of blocking bootstrap.
  return firstValueFrom(translate.use(detectLang()).pipe(catchError(() => of(null))));
}
