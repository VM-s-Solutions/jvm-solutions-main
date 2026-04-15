import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import en from '../i18n/en';
import cs from '../i18n/cs';
import sk from '../i18n/sk';
import uk from '../i18n/uk';

const INLINE: Record<string, TranslationObject> = {
  en: en as TranslationObject,
  cs: cs as TranslationObject,
  sk: sk as TranslationObject,
  uk: uk as TranslationObject,
};

export class InlineTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<TranslationObject> {
    return lang in INLINE
      ? of(INLINE[lang])
      : this.http.get<TranslationObject>(`./i18n/${lang}.json`);
  }
}

export function createInlineTranslateLoader(http: HttpClient): InlineTranslateLoader {
  return new InlineTranslateLoader(http);
}
