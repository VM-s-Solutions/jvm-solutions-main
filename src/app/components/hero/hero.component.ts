import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TypewriterService } from '../../services/typewriter.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent implements OnInit, OnDestroy {
  typedText = signal('');
  private langSub!: Subscription;

  constructor(
    private typewriter: TypewriterService,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.startTypewriter();
    this.langSub = this.translate.onLangChange.subscribe(() => {
      this.startTypewriter();
    });
  }

  ngOnDestroy() {
    this.typewriter.stop();
    this.langSub?.unsubscribe();
  }

  private startTypewriter() {
    const strings = [
      this.translate.instant('hero.typewriter.frontend'),
      this.translate.instant('hero.typewriter.backend'),
      this.translate.instant('hero.typewriter.mobile'),
      this.translate.instant('hero.typewriter.ai'),
    ];
    this.typewriter.start(strings, (text) => {
      this.typedText.set(text);
    });
  }

  scrollToSection(fragment: string, event: MouseEvent): void {
    event.preventDefault();
    const el = document.getElementById(fragment);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}
