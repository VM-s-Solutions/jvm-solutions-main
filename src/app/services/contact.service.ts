import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { postJson } from './fetch-json';

export interface ContactPayload {
  name: string;
  email: string;
  company?: string;
  /** The idea's name, from the Subject line; left out when it's empty */
  project?: string;
  service: string;
  message: string;
  captchaToken: string;
  lang?: string;
}

/**
 * The longest values, in characters, the API accepts (api/src/contact-core.ts). server.js's 32kb
 * JSON body cap fits them at up to 3 bytes a character plus the Turnstile token, so the form
 * never sends more than the server takes.
 */
export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  company: 200,
  project: 100,
  message: 5000,
} as const;

const NAME_MIN = 2;
const MESSAGE_MIN = 20;
/** Stricter than the API's check (a two-letter top-level domain at least), so whatever passes here passes there. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidName(value: string): boolean {
  return value.trim().length >= NAME_MIN;
}

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function isValidMessage(value: string): boolean {
  return value.trim().length >= MESSAGE_MIN;
}

/**
 * What an enquiry can be about. Our inbox always gets the English value, whatever
 * language the visitor used the site in; `id` names the label key (contact.services.*)
 * and is what a link puts in ?about= to pick it (services/consultation.ts).
 */
export const CONTACT_SERVICES = [
  { id: 'frontend', value: 'Frontend Development' },
  { id: 'backend', value: 'Backend Systems' },
  { id: 'mobile', value: 'Mobile Application' },
  { id: 'ai', value: 'AI Automation' },
  { id: 'fullstack', value: 'Full-stack Product' },
  { id: 'consultation', value: 'Consultation' },
  { id: 'other', value: 'Other' },
] as const;

export type ContactServiceId = (typeof CONTACT_SERVICES)[number]['id'];

/** The value of the topic a link asks for (?about=consultation), or '' when the form offers no such topic. */
export function serviceValueFor(id: string | null): string {
  return CONTACT_SERVICES.find((service) => service.id === id)?.value ?? '';
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  /** Completes on a 2xx answer, errors on any other; unsubscribing (leaving the page) aborts the request */
  send(payload: ContactPayload): Observable<void> {
    return postJson('/api/contact', payload);
  }
}
