import { ApplicationConfig, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withPreloading } from '@angular/router';
import { HttpClient, provideHttpClient, withFetch } from '@angular/common/http';
import { TranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { createInlineTranslateLoader } from './services/inline-translate-loader';
import { AfterLoadPreloadingStrategy } from './services/after-load-preloading.strategy';
import { initTranslations } from './services/initial-lang';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // UI state is signal-driven, so change detection needs no zone.js (35 kB off the initial load).
    provideZonelessChangeDetection(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' }), withPreloading(AfterLoadPreloadingStrategy)),
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
  ]
};
