import { TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateService, provideTranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import en from '../i18n/en';
import { TranslationLoader } from './translation-loader';
import { TranslationPartsService } from './translation-parts.service';
import { serveJson } from './testing/serve-json';

const CS = { nav: { faq: 'Otázky' } };
const CS_LEGAL = { privacy: { title: 'Zásady ochrany osobních údajů' } };
const EN_LEGAL = { privacy: { title: 'Privacy Policy' } };
const FILES = { '/i18n/cs.json': CS, '/i18n/legal/cs.json': CS_LEGAL, '/i18n/legal/en.json': EN_LEGAL };

describe('TranslationPartsService', () => {
  let translate: TranslateService;
  let parts: TranslationPartsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideTranslateService({ lang: 'en', loader: { provide: TranslateLoader, useExisting: TranslationLoader } })],
    });
    translate = TestBed.inject(TranslateService);
    parts = TestBed.inject(TranslationPartsService);
  });

  it('merges a part into the language on screen, next to its core', async () => {
    serveJson(FILES);

    await parts.load('legal');

    expect(translate.instant('privacy.title')).toBe(EN_LEGAL.privacy.title);
    expect(translate.instant('legal.toc')).toBe(en.legal.toc);
  });

  it('fetches and merges a part once per language', async () => {
    const fetchSpy = serveJson(FILES);
    const changes = jasmine.createSpy('translation change');
    const subscription = translate.onTranslationChange.subscribe(changes);

    await parts.load('legal');
    await parts.load('legal');
    await parts.ensure('en');
    subscription.unsubscribe();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(changes).toHaveBeenCalledTimes(1);
  });

  it('never merges a part into a language ngx-translate does not hold yet', async () => {
    const fetchSpy = serveJson(FILES);
    await parts.load('legal');
    fetchSpy.calls.reset();

    await parts.ensure('cs');

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(translate.getLangs()).not.toContain('cs');
  });

  it('lets a language loaded afterwards bring the part along', async () => {
    serveJson(FILES);
    await parts.load('legal');

    await firstValueFrom(translate.use('cs'));

    expect(translate.instant('nav.faq')).toBe(CS.nav.faq);
    expect(translate.instant('privacy.title')).toBe(CS_LEGAL.privacy.title);
  });

  it('still lets the page open when the part cannot be fetched, and fetches it on the next ask', async () => {
    const fetchSpy = serveJson({});
    await expectAsync(parts.load('legal')).toBeResolved();

    fetchSpy.and.callFake(async () => new Response(JSON.stringify(EN_LEGAL)));
    await parts.load('legal');

    expect(translate.instant('privacy.title')).toBe(EN_LEGAL.privacy.title);
  });
});
