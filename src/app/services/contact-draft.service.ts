import { Injectable } from '@angular/core';

/**
 * Carries a message started in the home page composer over to the contact form.
 * The form takes it once; a later visit to the contact page starts empty.
 */
@Injectable({ providedIn: 'root' })
export class ContactDraftService {
  private draft = '';

  hold(text: string): void {
    this.draft = text;
  }

  take(): string {
    const text = this.draft;
    this.draft = '';
    return text;
  }
}
