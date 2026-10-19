import { Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';
import { IdeaService } from './idea.service';

/**
 * What the mock screens call the visitor's app: the idea's name, or "Your product" in the
 * current language until they name it. Call in an injection context.
 */
export function injectProductName(): Signal<string> {
  const idea = inject(IdeaService);
  const fallback = toSignal(
    inject(TranslateService)
      .stream('idea.product')
      .pipe(map((value: unknown) => (typeof value === 'string' ? value : ''))),
    { initialValue: '' },
  );
  return computed(() => idea.name() || fallback());
}
