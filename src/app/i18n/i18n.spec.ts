import { TranslationObject } from '@ngx-translate/core';
import cs from './cs';
import en from './en';
import sk from './sk';
import uk from './uk';
import csLegal from './legal/cs';
import enLegal from './legal/en';
import skLegal from './legal/sk';
import ukLegal from './legal/uk';

const CORE: Readonly<Record<string, TranslationObject>> = { en, cs, sk, uk };
const LEGAL: Readonly<Record<string, TranslationObject>> = { en: enLegal, cs: csLegal, sk: skLegal, uk: ukLegal };
/** The legal pages' namespaces, one per document (LEGAL_DOCS) */
const LEGAL_NAMESPACES = ['privacy', 'refunds', 'terms'];

/** Every key of a translation file, as dot paths */
function keysOf(strings: TranslationObject, prefix = ''): string[] {
  return Object.entries(strings).flatMap(([key, value]) =>
    value !== null && typeof value === 'object' && !Array.isArray(value)
      ? keysOf(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

const sortedKeys = (strings: TranslationObject): string[] => keysOf(strings).sort();

describe('translation mirrors', () => {
  it('give every language the same keys as English, in the core and in the legal part', () => {
    for (const lang of ['cs', 'sk', 'uk']) {
      expect(sortedKeys(CORE[lang])).withContext(`${lang}.ts`).toEqual(sortedKeys(en));
      expect(sortedKeys(LEGAL[lang])).withContext(`legal/${lang}.ts`).toEqual(sortedKeys(enLegal));
    }
  });

  it('keep the legal pages in the legal part only', () => {
    for (const lang of Object.keys(CORE)) {
      expect(Object.keys(LEGAL[lang]).sort()).withContext(`legal/${lang}.ts`).toEqual(LEGAL_NAMESPACES);
      expect(Object.keys(CORE[lang]).filter((namespace) => LEGAL_NAMESPACES.includes(namespace)))
        .withContext(`${lang}.ts`)
        .toEqual([]);
    }
  });
});
