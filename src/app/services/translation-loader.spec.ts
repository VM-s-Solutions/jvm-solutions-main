import { firstValueFrom } from 'rxjs';
import en from '../i18n/en';
import { TranslationLoader } from './translation-loader';
import { serveJson } from './testing/serve-json';

const CS = { nav: { faq: 'Otázky' } };
const CS_LEGAL = { privacy: { title: 'Zásady ochrany osobních údajů' } };
const EN_LEGAL = { privacy: { title: 'Privacy Policy' } };

/** The strings ngx-translate would get, as unknown: jasmine's matcher types recurse forever on TranslationObject */
function load(loader: TranslationLoader, lang: string): Promise<unknown> {
  return firstValueFrom(loader.getTranslation(lang));
}

describe('TranslationLoader', () => {
  it('serves English from main.js, synchronously and without a request', () => {
    const fetchSpy = serveJson({});
    let strings: unknown;

    new TranslationLoader().getTranslation('en').subscribe((value) => (strings = value));

    expect(strings).toBe(en);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('fetches the other languages, and fails when a file is missing', async () => {
    serveJson({ '/i18n/cs.json': CS });
    const loader = new TranslationLoader();

    expect(await load(loader, 'cs')).toEqual(CS);
    // initial-lang.ts then stays on English
    await expectAsync(load(loader, 'sk')).toBeRejected();
  });

  it('brings every wanted part along with a language', async () => {
    const fetchSpy = serveJson({ '/i18n/cs.json': CS, '/i18n/legal/cs.json': CS_LEGAL, '/i18n/legal/en.json': EN_LEGAL });
    const loader = new TranslationLoader();
    loader.want('legal');

    expect(await load(loader, 'cs')).toEqual({ ...CS, ...CS_LEGAL });
    expect(await load(loader, 'en')).toEqual({ ...en, ...EN_LEGAL });
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });

  it('brings along a part wanted while the language is on its way', async () => {
    serveJson({ '/i18n/cs.json': CS, '/i18n/legal/cs.json': CS_LEGAL });
    const loader = new TranslationLoader();

    const strings = load(loader, 'cs');
    loader.want('legal');

    expect(await strings).toEqual({ ...CS, ...CS_LEGAL });
  });

  it('loads a language without a part that fails, and asks for the part again next time', async () => {
    const fetchSpy = serveJson({ '/i18n/cs.json': CS });
    const loader = new TranslationLoader();
    loader.want('legal');

    expect(await load(loader, 'cs')).toEqual(CS);
    await expectAsync(loader.part('cs', 'legal')).toBeRejected();
    expect(fetchSpy.calls.allArgs().filter(([url]) => url === '/i18n/legal/cs.json').length).toBe(2);
  });

  it('asks for a part once per language', async () => {
    const fetchSpy = serveJson({ '/i18n/legal/cs.json': CS_LEGAL, '/i18n/legal/uk.json': {} });
    const loader = new TranslationLoader();

    const [first, second]: unknown[] = await Promise.all([loader.part('cs', 'legal'), loader.part('cs', 'legal')]);
    await loader.part('cs', 'legal');
    await loader.part('uk', 'legal');

    expect(first).toBe(second);
    expect(first).toEqual(CS_LEGAL);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
