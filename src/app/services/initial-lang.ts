import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { catchError, firstValueFrom, of } from 'rxjs';
import { Lang, SUPPORTED_LANGS, isLang } from './lang.service';

/** The saved choice, else the browser language, else English. */
function detectLang(): Lang {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem('lang');
  } catch {
    // storage blocked: fall through to the browser language
  }
  if (isLang(saved)) return saved;
  const browser = navigator.language.split('-')[0].toLowerCase();
  return isLang(browser) ? browser : SUPPORTED_LANGS[0];
}

/**
 * App initializer: loads the visitor's language before the first render, so the page
 * never paints in English first and `instant()` lookups at startup get the right strings.
 * index.html already preloads the locale file, so this rarely waits on the network.
 */
export function initTranslations(): Promise<unknown> {
  const translate = inject(TranslateService);
  translate.setFallbackLang('en');
  // A failed locale download falls back to English instead of blocking bootstrap.
  return firstValueFrom(translate.use(detectLang()).pipe(catchError(() => of(null))));
}
