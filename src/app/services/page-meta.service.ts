import { DOCUMENT, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { PAGES, SITE_ORIGIN, isPagePath } from '../seo/pages';

/** The head tags that describe the page on screen, with the attribute that carries each value */
const DESCRIPTIONS = ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]'];
const TITLES = ['meta[property="og:title"]', 'meta[name="twitter:title"]'];

/**
 * Keeps the head's description, canonical URL and share tags on the page on screen. The server
 * already sends each URL with its own head (scripts/page-heads.js); this follows in-app navigation,
 * so a crawler that renders the page, or a visitor who shares it, never reads the previous page's.
 * The <title> itself comes from the route's `title`.
 */
@Injectable({ providedIn: 'root' })
export class PageMetaService {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => this.describe(event.urlAfterRedirects));
  }

  private describe(url: string): void {
    const path = url.split(/[?#]/)[0].replace(/^\/+|\/+$/g, '');
    if (!isPagePath(path)) return;
    const { title, description } = PAGES[path];
    const href = `${SITE_ORIGIN}/${path}`;

    for (const selector of DESCRIPTIONS) this.set(selector, 'content', description);
    for (const selector of TITLES) this.set(selector, 'content', title);
    this.set('meta[property="og:url"]', 'content', href);
    this.set('link[rel="canonical"]', 'href', href);
  }

  private set(selector: string, attribute: string, value: string): void {
    this.document.head.querySelector(selector)?.setAttribute(attribute, value);
  }
}
