import { Injectable, OnDestroy } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TypewriterService implements OnDestroy {
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private currentIndex = 0;
  private charIndex = 0;
  private isDeleting = false;

  private readonly typingSpeed = 80;
  private readonly deletingSpeed = 45;
  private readonly pauseAfterType = 2000;
  private readonly pauseAfterDelete = 400;

  start(
    strings: string[],
    onUpdate: (text: string, cursor: boolean) => void
  ): void {
    this.stop();
    this.currentIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;
    this.tick(strings, onUpdate);
  }

  private tick(strings: string[], onUpdate: (text: string, cursor: boolean) => void): void {
    const current = strings[this.currentIndex];
    const displayed = this.isDeleting
      ? current.substring(0, this.charIndex - 1)
      : current.substring(0, this.charIndex + 1);

    this.charIndex = displayed.length;
    onUpdate(displayed, true);

    let delay: number;

    if (!this.isDeleting && this.charIndex === current.length) {
      delay = this.pauseAfterType;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.currentIndex = (this.currentIndex + 1) % strings.length;
      delay = this.pauseAfterDelete;
    } else {
      delay = this.isDeleting ? this.deletingSpeed : this.typingSpeed;
    }

    this.timeoutId = setTimeout(() => this.tick(strings, onUpdate), delay);
  }

  stop(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
