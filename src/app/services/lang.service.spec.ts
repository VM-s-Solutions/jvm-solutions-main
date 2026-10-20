import { TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateService, provideTranslateService } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { LangService } from './lang.service';
import { TranslationLoader } from './translation-loader';
import { TranslationPartsService } from './translation-parts.service';
import { serveJson } from './testing/serve-json';

const FILES = {
  '/i18n/cs.json': { nav: { faq: 'Otázky' } },
  '/i18n/uk.json': { nav: { faq: 'Питання' } },
  '/i18n/legal/en.json': { privacy: { title: 'Privacy Policy' } },
  '/i18n/legal/cs.json': { privacy: { title: 'Zásady ochrany osobních údajů' } },
  '/i18n/legal/uk.json': { privacy: { title: 'Політика конфіденційності' } },
};

/** Lets the callbacks queued behind settled promises run */
const settle = (): Promise<void> => new Promise<void>((settled) => setTimeout(settled));

describe('LangService', () => {
  let translate: TranslateService;
  let lang: LangService;

  beforeEach(() => {
    localStorage.removeItem('lang');
    TestBed.configureTestingModule({
      providers: [provideTranslateService({ lang: 'en', loader: { provide: TranslateLoader, useExisting: TranslationLoader } })],
    });
    translate = TestBed.inject(TranslateService);
    lang = TestBed.inject(LangService);
  });

  afterEach(() => localStorage.removeItem('lang'));

  /** cs and uk loaded on a page that needed no part, then a legal page opened in English */
  async function openLegalPageAfterVisitingCsAndUk(): Promise<void> {
    await firstValueFrom(translate.use('cs'));
    await firstValueFrom(translate.use('uk'));
    await firstValueFrom(translate.use('en'));
    await TestBed.inject(TranslationPartsService).load('legal');
  }

  it('switches and remembers the choice for the next visit', async () => {
    serveJson(FILES);
    const switched = firstValueFrom(translate.onLangChange);

    lang.use('cs');
    await switched;

    expect(lang.current()).toBe('cs');
    expect(translate.instant('nav.faq')).toBe(FILES['/i18n/cs.json'].nav.faq);
    expect(localStorage.getItem('lang')).toBe('cs');
  });

  it('on a page that needs a part, swaps to a loaded language only once its part is in', async () => {
    serveJson(FILES);
    await openLegalPageAfterVisitingCsAndUk();
    // What the page reads at the very moment the language changes
    const titleAtSwitch = firstValueFrom(translate.onLangChange.pipe(map((): unknown => translate.instant('privacy.title'))));

    lang.use('cs');

    expect(await titleAtSwitch).toBe(FILES['/i18n/legal/cs.json'].privacy.title);
  });

  it('lets the language asked for last win, even when an earlier one gets its part later', async () => {
    let releaseCs: () => void = () => undefined;
    serveJson(FILES, { '/i18n/legal/cs.json': new Promise<void>((release) => (releaseCs = release)) });
    await openLegalPageAfterVisitingCsAndUk();
    const switched = firstValueFrom(translate.onLangChange);

    lang.use('cs');
    lang.use('uk');
    await switched;
    releaseCs();
    await TestBed.inject(TranslationLoader).part('cs', 'legal');
    await settle();

    expect(translate.getCurrentLang()).toBe('uk');
    expect(translate.instant('privacy.title')).toBe(FILES['/i18n/legal/uk.json'].privacy.title);
    expect(localStorage.getItem('lang')).toBe('uk');
  });
});
