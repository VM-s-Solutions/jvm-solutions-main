import { Observable } from 'rxjs';

/**
 * GETs a JSON file as a bare request, with no custom headers, so it picks up index.html's
 * `<link rel="preload" as="fetch">` (a request with other headers misses the preload and downloads
 * again). Rejects on a non-2xx answer, a network failure or a body that isn't JSON.
 */
export async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`GET ${url}: HTTP ${response.status}`);
  return (await response.json()) as T;
}

/**
 * POSTs a JSON body once subscribed. Emits once and completes on a 2xx answer; errors on any other
 * answer or a network failure. Unsubscribing aborts the request, so a late answer never reaches a
 * page that's gone.
 */
export function postJson(url: string, body: unknown): Observable<void> {
  return new Observable<void>((subscriber) => {
    const request = new AbortController();
    fetch(url, {
      method: 'POST',
      // express.json() in server.js parses only this type
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: request.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`POST ${url}: HTTP ${response.status}`);
        subscriber.next();
        subscriber.complete();
      })
      .catch((error: unknown) => subscriber.error(error));
    return () => request.abort();
  });
}
