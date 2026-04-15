import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import en from '../i18n/en';

export class InlineTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<TranslationObject> {
    if (lang === 'en') {
      return of(en as TranslationObject);
    }
    return this.http.get<TranslationObject>(`/i18n/${lang}.json`);
  }
}

export function createInlineTranslateLoader(http: HttpClient): InlineTranslateLoader {
  return new InlineTranslateLoader(http);
}
