import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'JVM Solutions — Frontend, Backend, Mobile & AI Development',
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent),
    title: 'Get In Touch — JVM Solutions',
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent),
    title: 'About Us — JVM Solutions',
  },
  {
    path: 'pricing',
    loadComponent: () => import('./pages/pricing/pricing.component').then(m => m.PricingComponent),
    title: 'Pricing — JVM Solutions',
  },
  {
    path: 'work/:id',
    loadComponent: () => import('./pages/work/case-study.component').then(m => m.CaseStudyComponent),
    title: 'Case Study — JVM Solutions',
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./pages/privacy/privacy.component').then(m => m.PrivacyComponent),
    title: 'Privacy Policy — JVM Solutions',
  },
  {
    path: '**',
    redirectTo: '',
  }
];
