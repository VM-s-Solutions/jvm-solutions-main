import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
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
    path: '**',
    redirectTo: '',
  }
];
