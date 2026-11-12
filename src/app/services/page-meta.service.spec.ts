import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { PAGES } from '../seo/pages';
import { PageMetaService } from './page-meta.service';

@Component({ standalone: true, template: '' })
class BlankComponent {}

describe('PageMetaService', () => {
  const added: Element[] = [];
  let canonical: HTMLLinkElement;
  let description: HTMLMetaElement;

  /** The tests' own head tags, put first so the service finds them before any the test page has */
  function add<T extends Element>(element: T, attributes: Record<string, string>): T {
    for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
    document.head.prepend(element);
    added.push(element);
    return element;
  }

  beforeEach(() => {
    canonical = add(document.createElement('link'), { rel: 'canonical', href: 'https://jvm-yore.com/' });
    description = add(document.createElement('meta'), { name: 'description', content: PAGES[''].description });
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: BlankComponent },
          { path: 'about', component: BlankComponent },
          { path: '**', redirectTo: '' },
        ]),
      ],
    });
    TestBed.inject(PageMetaService);
  });

  afterEach(() => added.splice(0).forEach((element) => element.remove()));

  it('points the canonical URL and the description at the page on screen', async () => {
    await TestBed.inject(Router).navigateByUrl('/about?from=home#team');

    expect(canonical.getAttribute('href')).toBe('https://jvm-yore.com/about');
    expect(description.content).toBe(PAGES.about.description);
  });

  it('describes the home page again after an unknown address redirects there', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/about');
    await router.navigateByUrl('/no-such-page');

    expect(canonical.getAttribute('href')).toBe('https://jvm-yore.com/');
    expect(description.content).toBe(PAGES[''].description);
  });
});
