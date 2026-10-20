import { Injectable, inject } from '@angular/core';
import { TranslateService, TranslateStore, TranslationObject } from '@ngx-translate/core';
import { TranslationLoader, TranslationPart } from './translation-loader';

/**
 * Puts a part's strings (public/i18n/<part>/<lang>.json) into ngx-translate for the pages that need
 * them: a route resolver loads the part before its page renders, and LangService completes a
 * language with the wanted parts before switching to it.
 */
@Injectable({ providedIn: 'root' })
export class TranslationPartsService {
  private readonly translate = inject(TranslateService);
  private readonly store = inject(TranslateStore);
  private readonly loader = inject(TranslationLoader);

  /**
   * For a route resolver: the part is in before the page renders, and every language loaded later
   * brings it along. Where this language's part can't be fetched, the fallback language's stands in
   * (the page reads it where this one has no strings). False when neither is in (offline); the next
   * ask fetches them again.
   */
  async load(part: TranslationPart): Promise<boolean> {
    this.loader.want(part);
    // ngx-translate switches only to a language it has loaded, so this one is always held
    const lang = this.translate.getCurrentLang();
    if (await this.merge(lang, part)) return true;
    const fallback = this.translate.getFallbackLang();
    if (!fallback || fallback === lang || !this.store.hasTranslationFor(fallback)) return false;
    return this.merge(fallback, part);
  }

  /**
   * Merges the wanted parts into a language ngx-translate holds. One it doesn't hold yet is left to
   * the loader: merging a part into it first would make it look loaded, and its core would never come.
   */
  async ensure(lang: string): Promise<void> {
    if (!this.store.hasTranslationFor(lang)) return;
    await Promise.all(this.loader.wantedParts.map((part) => this.merge(lang, part)));
  }

  /** True once the part is in that language */
  private async merge(lang: string, part: TranslationPart): Promise<boolean> {
    let strings: TranslationObject;
    try {
      strings = await this.loader.part(lang, part);
    } catch {
      // Offline or a failed request: TranslationLoader dropped it, so the next ask fetches it again
      return false;
    }
    // Already in, brought by the loader or an earlier merge
    const held = this.store.getTranslations(lang);
    if (!Object.keys(strings).every((namespace) => namespace in held)) {
      this.translate.setTranslation(lang, strings, true);
    }
    return true;
  }
}
