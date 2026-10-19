import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';

export const SUPPORTED_LANGS = ['en', 'cs', 'sk', 'uk'] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

export interface LangOption {
  code: Lang;
  /** Two-letter label for the switcher button */
  short: string;
  /** The language's own name, so every visitor can find theirs */
  name: string;
  /** BCP 47 locale for dates and numbers */
  locale: string;
}

export const LANGS: readonly LangOption[] = [
  { code: 'en', short: 'EN', name: 'English', locale: 'en-GB' },
  { code: 'cs', short: 'CS', name: 'Čeština', locale: 'cs-CZ' },
  { code: 'sk', short: 'SK', name: 'Slovenčina', locale: 'sk-SK' },
  { code: 'uk', short: 'UK', name: 'Українська', locale: 'uk-UA' },
];

export function isLang(value: string | null | undefined): value is Lang {
  return SUPPORTED_LANGS.includes(value as Lang);
}

/** The active language as a signal, plus switching it (remembered for the next visit). */
@Injectable({ providedIn: 'root' })
export class LangService {
  private readonly translate = inject(TranslateService);

  readonly current = toSignal(
    this.translate.onLangChange.pipe(map((e) => toLang(e.lang))),
    { initialValue: toLang(this.translate.getCurrentLang()) },
  );

  use(code: Lang): void {
    this.translate.use(code);
    try {
      localStorage.setItem('lang', code);
    } catch {
      // storage blocked: the choice lasts for this visit
    }
  }
}

function toLang(code: string | null | undefined): Lang {
  return isLang(code) ? code : 'en';
}

/** Locale for Intl formatting of the given language. */
export function localeOf(lang: Lang): string {
  return LANGS.find((l) => l.code === lang)?.locale ?? 'en-GB';
}
