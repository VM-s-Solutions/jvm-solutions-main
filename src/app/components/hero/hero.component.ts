import { ChangeDetectionStrategy, Component, OnDestroy, afterNextRender, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TypewriterService } from '../../services/typewriter.service';

@Component({
  selector: 'jvm-hero',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent implements OnDestroy {
  private readonly typewriter = inject(TypewriterService);
  private readonly translate = inject(TranslateService);

  readonly typedText = signal('');
  readonly phrases = signal<string[]>([]);
  readonly phrasesText = computed(() => this.phrases().join(', '));

  constructor() {
    afterNextRender(() => {
      const strings = [
        this.translate.instant('hero.typewriter.frontend'),
        this.translate.instant('hero.typewriter.backend'),
        this.translate.instant('hero.typewriter.mobile'),
        this.translate.instant('hero.typewriter.ai'),
      ];
      this.phrases.set(strings);
      // Reduced motion: show the first phrase still instead of a never-ending typing loop
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.typedText.set(strings[0]);
        return;
      }
      this.typewriter.start(strings, (text) => this.typedText.set(text));
    });
  }

  ngOnDestroy(): void {
    this.typewriter.stop();
  }
}
