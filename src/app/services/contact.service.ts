import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface ContactPayload {
  name: string;
  email: string;
  company?: string;
  service: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  /**
   * Stub implementation — replace the body with an HttpClient POST call
   * when the API endpoint is ready, e.g.:
   *   return this.http.post<void>('/api/contact', payload);
   */
  send(payload: ContactPayload): Observable<void> {
    console.log('[ContactService] Form submission:', payload);
    // Simulate network latency
    return of(undefined).pipe(delay(800));
  }
}
