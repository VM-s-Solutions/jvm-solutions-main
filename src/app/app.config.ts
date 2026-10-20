import { ApplicationConfig, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withPreloading, withViewTransitions } from '@angular/router';
import { TranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { TranslationLoader } from './services/translation-loader';
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
    // Locale files and the contact form go through fetch() (services/fetch-json.ts), so there's no
    // HttpClient (21 kB off the initial load).
    provideTranslateService({
      lang: 'en',
      // The root TranslationLoader itself, so ngx-translate and TranslationPartsService share its wanted parts
      loader: { provide: TranslateLoader, useExisting: TranslationLoader },
    }),
    provideAppInitializer(initTranslations),
  ],
};
