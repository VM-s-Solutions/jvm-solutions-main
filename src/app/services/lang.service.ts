import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { TranslationPartsService } from './translation-parts.service';

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
  private readonly parts = inject(TranslationPartsService);

  readonly current = toSignal(
    this.translate.onLangChange.pipe(map((e) => toLang(e.lang))),
    { initialValue: toLang(this.translate.getCurrentLang()) },
  );

  /** The language asked for last, so an earlier switch that lands later can't take over */
  private requested: Lang | null = null;

  use(code: Lang): void {
    this.requested = code;
    try {
      localStorage.setItem('lang', code);
    } catch {
      // storage blocked: the choice lasts for this visit
    }
    // The open page's parts in that language come first, so the switch swaps every string at once
    void this.parts.ensure(code).then(() => {
      if (this.requested !== code) return;
      // A part asked for while this language was on its way, or one that failed with it, follows right after
      void firstValueFrom(this.translate.use(code)).then(
        () => this.parts.ensure(code),
        // Download failed: the page stays in the language it was in. Forget ngx-translate's dead request,
        // or the next pick re-fetches through it and switches without ever storing the strings.
        () => this.translate.resetLang(code),
      );
    });
  }
}

function toLang(code: string | null | undefined): Lang {
  return isLang(code) ? code : 'en';
}

/** Locale for Intl formatting of the given language. */
export function localeOf(lang: Lang): string {
  return LANGS.find((l) => l.code === lang)?.locale ?? 'en-GB';
}
