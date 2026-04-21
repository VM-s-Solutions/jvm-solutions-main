import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-scroll-flare',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="node" #robot>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <radialGradient id="core" cx="40%" cy="35%" r="68%">
            <stop offset="0%"   stop-color="#c4b5fd"/>
            <stop offset="40%"  stop-color="#8B5CF6"/>
            <stop offset="100%" stop-color="#10B981"/>
          </radialGradient>
          <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="pulse-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="1.6" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <!-- Six connection lines -->
        <path id="p1" d="M50,50 L50,10"/>
        <path id="p2" d="M50,50 L85,30"/>
        <path id="p3" d="M50,50 L85,70"/>
        <path id="p4" d="M50,50 L50,90"/>
        <path id="p5" d="M50,50 L15,70"/>
        <path id="p6" d="M50,50 L15,30"/>
        <use href="#p1" stroke="#8B5CF6" stroke-width="0.9" opacity="0.45"/>
        <use href="#p2" stroke="#8B5CF6" stroke-width="0.9" opacity="0.45"/>
        <use href="#p3" stroke="#10B981" stroke-width="0.9" opacity="0.45"/>
        <use href="#p4" stroke="#10B981" stroke-width="0.9" opacity="0.45"/>
        <use href="#p5" stroke="#10B981" stroke-width="0.9" opacity="0.45"/>
        <use href="#p6" stroke="#8B5CF6" stroke-width="0.9" opacity="0.45"/>

        <!-- Outer nodes -->
        <circle cx="50" cy="10" r="3.5" fill="#A78BFA" filter="url(#glow)"/>
        <circle cx="85" cy="30" r="3.5" fill="#A78BFA" filter="url(#glow)"/>
        <circle cx="85" cy="70" r="3.5" fill="#34D399" filter="url(#glow)"/>
        <circle cx="50" cy="90" r="3.5" fill="#34D399" filter="url(#glow)"/>
        <circle cx="15" cy="70" r="3.5" fill="#34D399" filter="url(#glow)"/>
        <circle cx="15" cy="30" r="3.5" fill="#A78BFA" filter="url(#glow)"/>

        <!-- Signal pulses — staggered so they feel async -->
        <circle r="2.2" fill="#A78BFA" filter="url(#pulse-glow)">
          <animateMotion dur="1.6s" repeatCount="indefinite" begin="0s"><mpath href="#p1"/></animateMotion>
          <animate attributeName="opacity" values="0;0.95;0.95;0" keyTimes="0;0.08;0.88;1" dur="1.6s" repeatCount="indefinite"/>
        </circle>
        <circle r="2.2" fill="#A78BFA" filter="url(#pulse-glow)">
          <animateMotion dur="1.6s" repeatCount="indefinite" begin="0.27s"><mpath href="#p2"/></animateMotion>
          <animate attributeName="opacity" values="0;0.95;0.95;0" keyTimes="0;0.08;0.88;1" dur="1.6s" repeatCount="indefinite" begin="0.27s"/>
        </circle>
        <circle r="2.2" fill="#34D399" filter="url(#pulse-glow)">
          <animateMotion dur="1.6s" repeatCount="indefinite" begin="0.54s"><mpath href="#p3"/></animateMotion>
          <animate attributeName="opacity" values="0;0.95;0.95;0" keyTimes="0;0.08;0.88;1" dur="1.6s" repeatCount="indefinite" begin="0.54s"/>
        </circle>
        <circle r="2.2" fill="#34D399" filter="url(#pulse-glow)">
          <animateMotion dur="1.6s" repeatCount="indefinite" begin="0.81s"><mpath href="#p4"/></animateMotion>
          <animate attributeName="opacity" values="0;0.95;0.95;0" keyTimes="0;0.08;0.88;1" dur="1.6s" repeatCount="indefinite" begin="0.81s"/>
        </circle>
        <circle r="2.2" fill="#34D399" filter="url(#pulse-glow)">
          <animateMotion dur="1.6s" repeatCount="indefinite" begin="1.08s"><mpath href="#p5"/></animateMotion>
          <animate attributeName="opacity" values="0;0.95;0.95;0" keyTimes="0;0.08;0.88;1" dur="1.6s" repeatCount="indefinite" begin="1.08s"/>
        </circle>
        <circle r="2.2" fill="#A78BFA" filter="url(#pulse-glow)">
          <animateMotion dur="1.6s" repeatCount="indefinite" begin="1.35s"><mpath href="#p6"/></animateMotion>
          <animate attributeName="opacity" values="0;0.95;0.95;0" keyTimes="0;0.08;0.88;1" dur="1.6s" repeatCount="indefinite" begin="1.35s"/>
        </circle>

        <!-- Central sphere -->
        <circle cx="50" cy="50" r="18" fill="url(#core)" filter="url(#glow)"/>

        <!-- </> inside the sphere -->
        <polyline points="44,43 38,50 44,57"
          stroke="rgba(255,255,255,0.75)" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="48" y1="57" x2="52" y2="43"
          stroke="rgba(255,255,255,0.75)" stroke-width="2"
          stroke-linecap="round"/>
        <polyline points="56,43 62,50 56,57"
          stroke="rgba(255,255,255,0.75)" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  `,
  styleUrl: './scroll-flare.component.scss',
})
export class ScrollFlareComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  @ViewChild('robot', { static: true }) private robotRef!: ElementRef<HTMLDivElement>;

  private baseY = 0;
  private targetBaseY = 0;
  private lastScrollY = 0;
  private currentX = 0;
  private currentY = 0;
  private rafId = 0;
  private idleTimer = 0;
  private startTime = 0;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.lastScrollY = window.scrollY;
    this.baseY = window.innerHeight * 0.42;
    this.targetBaseY = this.baseY;
    this.currentY = this.baseY;
    // cos(0) = 1 so sweep starts at 92vw — first movement is leftward
    this.currentX = window.innerWidth * 0.92;
    this.startTime = performance.now();

    const onScroll = (): void => {
      const y = window.scrollY;
      const delta = y - this.lastScrollY;
      this.lastScrollY = y;

      this.targetBaseY = Math.max(
        window.innerHeight * 0.18,
        Math.min(window.innerHeight * 0.78, this.targetBaseY + delta * 0.2)
      );

      clearTimeout(this.idleTimer);
      this.idleTimer = window.setTimeout(() => {
        this.targetBaseY = window.innerHeight * 0.42;
      }, 250) as unknown as number;
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    const el = this.robotRef.nativeElement;
    const W = 40; // half robot width for edge clamping

    const tick = (): void => {
      const t = (performance.now() - this.startTime) / 1000;

      this.baseY += (this.targetBaseY - this.baseY) * 0.05;

      // Primary sweep: cosine drives right→left→right, period ~105s
      const sweepX = window.innerWidth * 0.5 + Math.cos(t * 0.06) * window.innerWidth * 0.42;

      // Vertical wander on top of scroll tracking — makes path curved, not horizontal
      const sweepY = this.baseY
        + Math.sin(t * 0.11) * window.innerHeight * 0.1
        + Math.cos(t * 0.07) * window.innerHeight * 0.06;

      // Chaos overlay — irrational ratios, path never repeats
      const xChaos =
        Math.sin(t * 1.13) * 14 +
        Math.sin(t * 2.37) * 8 +
        Math.cos(t * 0.79) * 10;

      const yChaos =
        Math.sin(t * 0.53) * 20 +
        Math.sin(t * 1.27) * 11 +
        Math.cos(t * 1.89) * 7 +
        Math.sin(t * 3.01) * 4;

      const targetX = sweepX + xChaos;
      const targetY = sweepY + yChaos;

      this.currentX += (targetX - this.currentX) * 0.04;
      this.currentY += (targetY - this.currentY) * 0.04;

      // Keep fully on screen
      const clampedX = Math.max(W, Math.min(window.innerWidth - W, this.currentX));
      const clampedY = Math.max(80, Math.min(window.innerHeight - 80, this.currentY));

      el.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(this.rafId);
      clearTimeout(this.idleTimer);
    });
  }
}
