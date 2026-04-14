import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { trigger, transition, style, animate, query } from '@angular/animations';
import { filter, fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ScrollService } from './services/scroll.service';

export const routeFadeAnimation = trigger('routeAnimation', [
  transition('navigating => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(8px)' })
    ], { optional: true }),
    query(':enter', [
      animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
    ], { optional: true }),
  ])
]);

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [routeFadeAnimation]
})
export class AppComponent implements OnInit {
  private routeState: string | null = null;
  readonly showScrollTop = signal(false);

  constructor(private router: Router, private scrollService: ScrollService) {
    fromEvent(window, 'scroll')
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.showScrollTop.set(window.scrollY > 400));
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnInit(): void {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.routeState = 'navigating';
        const fragment = this.scrollService.consume();
        if (fragment) {
          // Wait one animation frame for the route component to render
          setTimeout(() => this.scrollService.scrollTo(fragment), 80);
        }
      });
  }

  getRouteState(outlet: RouterOutlet): string | null {
    if (!outlet?.isActivated) return null;
    return this.routeState;
  }
}
