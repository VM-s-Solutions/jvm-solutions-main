/** The legal documents the site publishes; each id is also its route path and i18n namespace. */
export const LEGAL_DOCS = [
  { id: 'privacy', path: '/privacy', labelKey: 'legal.docs.privacy' },
  { id: 'terms', path: '/terms', labelKey: 'legal.docs.terms' },
  { id: 'refunds', path: '/refunds', labelKey: 'legal.docs.refunds' },
] as const;

export type LegalDocId = (typeof LEGAL_DOCS)[number]['id'];

/** A paragraph (one key) or a bulleted list (one key per item). */
export interface LegalBlock {
  list: boolean;
  keys: readonly string[];
}

/** A link shown under a section — a mailto request or a licence file. */
export interface LegalLink {
  labelKey: string;
  href: string;
}

export interface LegalSection {
  /** Anchor id, used by the table of contents. */
  id: string;
  /** Absolute href of the anchor, so a middle-click opens the right section. */
  href: string;
  titleKey: string;
  blocks: readonly LegalBlock[];
  links: readonly LegalLink[];
}

/**
 * Builds a section from its shape: `'p'` is a paragraph, a number is a list of that many
 * items. Keys follow `<doc>.<id>.title`, `.p1…pN` and `.li1…liN`, numbered across the section.
 */
export function legalSection(
  doc: LegalDocId,
  id: string,
  shape: readonly ('p' | number)[],
  links: readonly LegalLink[] = [],
): LegalSection {
  const base = `${doc}.${id}`;
  let paragraph = 0;
  let item = 0;
  const blocks = shape.map((part): LegalBlock =>
    part === 'p'
      ? { list: false, keys: [`${base}.p${++paragraph}`] }
      : { list: true, keys: Array.from({ length: part }, () => `${base}.li${++item}`) },
  );
  return { id, href: `/${doc}#${id}`, titleKey: `${base}.title`, blocks, links };
}

const CONTACT_EMAIL = 'hello@jvm-yore.com';

/** A mailto link to our inbox with the subject already filled in. */
export function mailtoHref(subject: string): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
