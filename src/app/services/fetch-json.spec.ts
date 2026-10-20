import { lastValueFrom, tap } from 'rxjs';
import { getJson, postJson } from './fetch-json';

function answer(body: string, status = 200): Promise<Response> {
  return Promise.resolve(new Response(body, { status }));
}

describe('getJson', () => {
  it('reads a JSON file with a bare GET, so it can reuse a preload', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callFake(() => answer('{"nav":{"faq":"FAQ"}}'));

    expect(await getJson('/i18n/cs.json')).toEqual({ nav: { faq: 'FAQ' } });
    expect(fetchSpy).toHaveBeenCalledOnceWith('/i18n/cs.json');
  });

  it('rejects an error answer and a body that is not JSON', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callFake(() => answer('Not found', 404));
    await expectAsync(getJson('/i18n/xx.json')).toBeRejected();

    fetchSpy.and.callFake(() => answer('<!doctype html>'));
    await expectAsync(getJson('/i18n/xx.json')).toBeRejected();
  });
});

describe('postJson', () => {
  it('posts the body as JSON, then emits once and completes on a 2xx answer', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callFake(() => answer('{"ok":true}'));
    const next = jasmine.createSpy('next');

    // lastValueFrom settles only on complete
    await lastValueFrom(postJson('/api/contact', { name: 'Ada' }).pipe(tap(next)));

    expect(next).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.calls.mostRecent().args;
    expect(url).toBe('/api/contact');
    expect(init?.method).toBe('POST');
    expect(init?.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(init?.body).toBe('{"name":"Ada"}');
  });

  it('errors on any other answer and on a network failure', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callFake(() => answer('{"error":"Captcha failed"}', 400));
    await expectAsync(lastValueFrom(postJson('/api/contact', {}))).toBeRejected();

    fetchSpy.and.callFake(() => answer('{"error":"Internal server error"}', 500));
    await expectAsync(lastValueFrom(postJson('/api/contact', {}))).toBeRejected();

    fetchSpy.and.callFake(() => Promise.reject(new TypeError('Failed to fetch')));
    await expectAsync(lastValueFrom(postJson('/api/contact', {}))).toBeRejected();
  });

  it('sends nothing until subscribed, and aborts quietly when unsubscribed', async () => {
    let signal: AbortSignal | undefined;
    const fetchSpy = spyOn(window, 'fetch').and.callFake((_url, init) => {
      signal = init?.signal ?? undefined;
      // Rejects once aborted, as fetch() does
      return new Promise<Response>((_resolve, reject) =>
        signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))),
      );
    });
    const error = jasmine.createSpy('error');

    const request = postJson('/api/contact', {});
    expect(fetchSpy).not.toHaveBeenCalled();

    const subscription = request.subscribe({ error });
    expect(signal?.aborted).toBeFalse();
    subscription.unsubscribe();
    expect(signal?.aborted).toBeTrue();

    await new Promise((settled) => setTimeout(settled));
    expect(error).not.toHaveBeenCalled();
  });
});
