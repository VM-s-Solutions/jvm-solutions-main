import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'JVM Yore — Frontend, Backend, Mobile & AI Development',
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent),
    title: 'Get In Touch — JVM Yore',
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent),
    title: 'About Us — JVM Yore',
  },
  {
    path: 'faq',
    loadComponent: () => import('./pages/faq/faq-page.component').then(m => m.FaqPageComponent),
    title: 'FAQ — JVM Yore',
  },
  {
    path: 'pricing',
    loadComponent: () => import('./pages/pricing/pricing.component').then(m => m.PricingComponent),
    title: 'Pricing — JVM Yore',
  },
  {
    path: 'work/:id',
    loadComponent: () => import('./pages/work/case-study.component').then(m => m.CaseStudyComponent),
    title: 'Case Study — JVM Yore',
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./pages/privacy/privacy.component').then(m => m.PrivacyComponent),
    title: 'Privacy Policy — JVM Yore',
  },
  {
    path: '**',
    redirectTo: '',
  }
];
