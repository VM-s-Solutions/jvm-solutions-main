import { ApplicationConfig, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withPreloading, withViewTransitions } from '@angular/router';
import { HttpClient, provideHttpClient, withFetch } from '@angular/common/http';
import { TranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { createInlineTranslateLoader } from './services/inline-translate-loader';
import { AfterLoadPreloadingStrategy } from './services/after-load-preloading.strategy';
import { initTranslations } from './services/initial-lang';
import { onPageTransition } from './services/page-transition';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // UI state is signal-driven, so change detection needs no zone.js (35 kB off the initial load).
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      // A shared section link (/privacy#cookies) opens at that section; AppComponent sets the top bar offset.
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
      // Pages push and pop like iOS screens; the first page load doesn't slide.
      withViewTransitions({ skipInitialTransition: true, onViewTransitionCreated: onPageTransition }),
      withPreloading(AfterLoadPreloadingStrategy),
    ),
    provideHttpClient(withFetch()),
    provideTranslateService({
      lang: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: createInlineTranslateLoader,
        deps: [HttpClient],
      },
    }),
    provideAppInitializer(initTranslations),
  ],
};
