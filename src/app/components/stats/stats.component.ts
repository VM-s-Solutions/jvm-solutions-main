import { ChangeDetectionStrategy, Component, NgZone, OnInit, OnDestroy, ElementRef, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

interface Stat {
  value: number;
  suffix: string;
  labelKey: string;
  prefix?: string;
}

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
})
export class StatsComponent implements OnInit, OnDestroy {
  readonly stats: Stat[] = [
    { value: 50, suffix: '+', labelKey: 'stats.projects' },
    { value: 5, suffix: '', labelKey: 'stats.experience', prefix: '' },
    { value: 30, suffix: '+', labelKey: 'stats.clients' },
    { value: 4, suffix: '', labelKey: 'stats.services' },
  ];

  displayValues = signal<string[]>(this.stats.map(s => s.value.toString()));

  private observer!: IntersectionObserver;
  private animated = false;
  private readonly prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor(private el: ElementRef, private ngZone: NgZone) {}

  ngOnInit() {
    if (this.prefersReducedMotion) return;

    this.displayValues.set(this.stats.map(() => '0'));

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.animated) {
          this.animated = true;
          // rAF loop runs outside zone — signal updates propagate without zone.js
          this.ngZone.runOutsideAngular(() => this.animateAll());
          this.observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  private animateAll() {
    this.stats.forEach((stat, index) => {
      this.animateStat(stat, index);
    });
  }

  private animateStat(stat: Stat, index: number) {
    const duration = 1400;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * stat.value);

      const values = [...this.displayValues()];
      values[index] = current.toString();
      this.displayValues.set(values);

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }
}
