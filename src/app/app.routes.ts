import { inject } from '@angular/core';
import { ResolveFn, Router, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PAGES } from './seo/pages';
import { TranslationPartsService } from './services/translation-parts.service';

/**
 * The legal pages' strings (public/i18n/legal/), merged in before the page renders, so it never
 * shows raw keys. The router keeps the old page on screen until they're in. When they can't be
 * fetched (offline), an in-app navigation fails: the visitor stays on the page they're on, and the
 * next click asks again. The first page of a visit has nothing to stay on, so it opens anyway.
 */
const legalStrings: ResolveFn<void> = () => {
  const router = inject(Router);
  return inject(TranslationPartsService)
    .load('legal')
    .then((loaded) => {
      if (!loaded && router.navigated) throw new Error('The legal pages’ strings could not be fetched');
    });
};

export const routes: Routes = [
  {
    // Eager on purpose: nearly every visit lands here, and a lazy chunk would put an
    // extra network round trip in front of the hero headline (the LCP element).
    // Its below-the-fold sections stay lazy via @defer.
    path: '',
    component: HomeComponent,
    title: PAGES[''].title,
  },
  {
    path: 'services',
    loadComponent: () => import('./pages/services/services.component').then((m) => m.ServicesComponent),
    title: PAGES.services.title,
  },
  {
    // The pricing page is gone (prices are agreed per scope now): old links land on the home page.
    // A full page load never gets here: server.js answers /pricing with a 301 first.
    path: 'pricing',
    redirectTo: '',
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent),
    title: PAGES.about.title,
  },
  {
    path: 'faq',
    loadComponent: () => import('./pages/faq/faq-page.component').then((m) => m.FaqPageComponent),
    title: PAGES.faq.title,
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.component').then((m) => m.ContactComponent),
    title: PAGES.contact.title,
  },
  {
    path: 'privacy',
    loadComponent: () => import('./pages/privacy/privacy.component').then((m) => m.PrivacyComponent),
    resolve: { strings: legalStrings },
    title: PAGES.privacy.title,
  },
  {
    path: 'terms',
    loadComponent: () => import('./pages/terms/terms.component').then((m) => m.TermsComponent),
    resolve: { strings: legalStrings },
    title: PAGES.terms.title,
  },
  {
    path: 'refunds',
    loadComponent: () => import('./pages/refunds/refunds.component').then((m) => m.RefundsComponent),
    resolve: { strings: legalStrings },
    title: PAGES.refunds.title,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
