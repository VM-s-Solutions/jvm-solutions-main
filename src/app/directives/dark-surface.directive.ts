import { DestroyRef, Directive, ElementRef, effect, inject, input } from '@angular/core';
import { NavToneService } from '../services/nav-tone.service';

/**
 * Marks a dark surface, so the top bar switches to its dark tone while it scrolls over it.
 * Bind `false` for a surface that is only dark some of the time (the board on a light chapter).
 */
@Directive({
  selector: '[jvmDarkSurface]',
  standalone: true,
})
export class DarkSurfaceDirective {
  readonly jvmDarkSurface = input<boolean | ''>(true);

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const tone = inject(NavToneService);

    effect(() => {
      const value = this.jvmDarkSurface();
      if (value === '' || value) tone.register(el);
      else tone.unregister(el);
    });
    inject(DestroyRef).onDestroy(() => tone.unregister(el));
  }
}
