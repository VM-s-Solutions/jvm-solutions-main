import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, ElementRef, signal } from '@angular/core';
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

  displayValues = signal<string[]>(['0', '0', '0', '0']);

  private observer!: IntersectionObserver;
  private animated = false;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.animated) {
          this.animated = true;
          this.animateAll();
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
      // Ease out cubic
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
