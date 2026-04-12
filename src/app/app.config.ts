import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { createInlineTranslateLoader } from './services/inline-translate-loader';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideHttpClient(),
    provideAnimations(),
    provideTranslateService({
      lang: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: createInlineTranslateLoader,
        deps: [HttpClient],
      },
    }),
  ]
};
