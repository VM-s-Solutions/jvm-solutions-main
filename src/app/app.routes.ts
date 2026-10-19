import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  {
    // Eager on purpose: nearly every visit lands here, and a lazy chunk would put an
    // extra network round trip in front of the hero headline (the LCP element).
    // Its below-the-fold sections stay lazy via @defer.
    path: '',
    component: HomeComponent,
    title: 'JVM Yore — Frontend, Backend, Mobile & AI Development',
  },
  {
    path: 'services',
    loadComponent: () => import('./pages/services/services.component').then((m) => m.ServicesComponent),
    title: 'Services — JVM Yore',
  },
  {
    path: 'pricing',
    loadComponent: () => import('./pages/pricing/pricing.component').then((m) => m.PricingComponent),
    title: 'Pricing — JVM Yore',
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent),
    title: 'About — JVM Yore',
  },
  {
    path: 'faq',
    loadComponent: () => import('./pages/faq/faq-page.component').then((m) => m.FaqPageComponent),
    title: 'FAQ — JVM Yore',
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.component').then((m) => m.ContactComponent),
    title: 'Message us — JVM Yore',
  },
  {
    path: 'privacy',
    loadComponent: () => import('./pages/privacy/privacy.component').then((m) => m.PrivacyComponent),
    title: 'Privacy Policy — JVM Yore',
  },
  {
    path: 'terms',
    loadComponent: () => import('./pages/terms/terms.component').then((m) => m.TermsComponent),
    title: 'Terms of Service — JVM Yore',
  },
  {
    path: 'refunds',
    loadComponent: () => import('./pages/refunds/refunds.component').then((m) => m.RefundsComponent),
    title: 'Payments & Refunds — JVM Yore',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
