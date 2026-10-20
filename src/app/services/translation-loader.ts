import { Injectable } from '@angular/core';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, defer, of } from 'rxjs';
import en from '../i18n/en';
import { getJson } from './fetch-json';

/** Strings only some pages need, kept out of the file every visit loads: public/i18n/<part>/<lang>.json */
export type TranslationPart = 'legal';

/**
 * English ships in main.js, so an English first paint needs no request; the other languages are
 * fetched (index.html preloads the visitor's). Once a page has asked for a part, every language
 * loaded after that brings it along, so switching language on that page swaps every string at once.
 * ngx-translate gets this same instance (useExisting in app.config.ts), so it sees the wanted parts.
 */
@Injectable({ providedIn: 'root' })
export class TranslationLoader implements TranslateLoader {
  private readonly wanted = new Set<TranslationPart>();
  /** One request per language and part ('cs/legal'); a failed one is dropped, so the next ask retries */
  private readonly requests = new Map<string, Promise<TranslationObject>>();

  /** The parts the pages opened so far have asked for */
  get wantedParts(): readonly TranslationPart[] {
    return [...this.wanted];
  }

  want(part: TranslationPart): void {
    this.wanted.add(part);
  }

  part(lang: string, part: TranslationPart): Promise<TranslationObject> {
    const key = `${lang}/${part}`;
    let request = this.requests.get(key);
    if (!request) {
      request = getJson<TranslationObject>(`/i18n/${part}/${lang}.json`);
      this.requests.set(key, request);
      request.catch(() => this.requests.delete(key));
    }
    return request;
  }

  getTranslation(lang: string): Observable<TranslationObject> {
    // Synchronous, so the English first paint and the English fallback never wait
    if (lang === 'en' && this.wanted.size === 0) return of(en as TranslationObject);
    return defer(() => this.load(lang));
  }

  /**
   * The language with every wanted part, including one asked for while these are on their way.
   * A missing or unreadable core file fails the load (initial-lang.ts then stays on English);
   * a part that fails is left out, and the next ask fetches it again.
   */
  private async load(lang: string): Promise<TranslationObject> {
    const core = lang === 'en' ? (en as TranslationObject) : getJson<TranslationObject>(`/i18n/${lang}.json`);
    const parts = new Map<TranslationPart, Promise<TranslationObject>>();
    let strings: TranslationObject[];
    do {
      for (const part of this.wanted) {
        if (!parts.has(part)) parts.set(part, this.part(lang, part).catch((): TranslationObject => ({})));
      }
      strings = await Promise.all([core, ...parts.values()]);
    } while (parts.size < this.wanted.size);
    return strings.reduce((all, next) => ({ ...all, ...next }));
  }
}
