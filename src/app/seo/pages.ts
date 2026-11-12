import pages from './pages.json';

/**
 * What a search engine reads about each page: its name (the breadcrumb), its <title> and its meta
 * description. Keyed by route path. One list for the app (route titles, PageMetaService) and for
 * scripts/page-heads.js, which writes the same head into the HTML the server sends for each URL.
 */
export const PAGES = pages;

export type PagePath = keyof typeof PAGES;

export const SITE_ORIGIN = 'https://jvm-yore.com';

export const isPagePath = (path: string): path is PagePath => Object.hasOwn(PAGES, path);
