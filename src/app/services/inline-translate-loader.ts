import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, from, of } from 'rxjs';
import en from '../i18n/en';

export class InlineTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<TranslationObject> {
    switch (lang) {
      case 'en': return of(en as TranslationObject);
      case 'cs': return from(import('../i18n/cs').then(m => m.default as TranslationObject));
      case 'sk': return from(import('../i18n/sk').then(m => m.default as TranslationObject));
      case 'uk': return from(import('../i18n/uk').then(m => m.default as TranslationObject));
      default:   return this.http.get<TranslationObject>(`./i18n/${lang}.json`);
    }
  }
}

export function createInlineTranslateLoader(http: HttpClient): InlineTranslateLoader {
  return new InlineTranslateLoader(http);
}
