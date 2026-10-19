import { Injectable, computed, signal } from '@angular/core';

/** Longest name we keep, in characters (not UTF-16 units, so emoji count once). */
export const IDEA_MAX_LENGTH = 24;

const STORAGE_KEY = 'idea';

/** Collapses whitespace, trims and caps the length of a name the visitor typed. */
export function cleanIdea(raw: string | null | undefined): string {
  const collapsed = (raw ?? '').replace(/\s+/g, ' ').trim();
  return Array.from(collapsed).slice(0, IDEA_MAX_LENGTH).join('').trim();
}

/** First letter of a name, upper-cased — the "app icon" in the mock screens. */
export function ideaInitial(name: string): string {
  const first = Array.from(name.trim())[0];
  return first ? first.toLocaleUpperCase() : '';
}

/**
 * The name of the visitor's idea. They give it in the chat or in the "Put … on paper"
 * heading, and the whole site uses it from then on. Kept in localStorage so it survives
 * a reload; it never leaves the browser unless they send the contact form.
 */
@Injectable({ providedIn: 'root' })
export class IdeaService {
  private readonly _name = signal(cleanIdea(readStored()));

  /** The cleaned name, or '' while the visitor hasn't named anything. */
  readonly name = this._name.asReadonly();
  readonly hasName = computed(() => this._name() !== '');

  set(raw: string): void {
    const name = cleanIdea(raw);
    if (name === this._name()) return;
    this._name.set(name);
    try {
      if (name) localStorage.setItem(STORAGE_KEY, name);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // storage blocked (private mode): the name still lives for this visit
    }
  }
}

function readStored(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}
