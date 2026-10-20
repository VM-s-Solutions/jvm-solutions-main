/**
 * Test helper: stands in for the server behind fetch(). Answers the JSON files it's given and a 404
 * for any other URL; a URL with a gate answers only once that promise settles.
 */
export function serveJson(
  files: Readonly<Record<string, unknown>>,
  gates: Readonly<Record<string, Promise<void>>> = {},
): jasmine.Spy<typeof fetch> {
  return spyOn(window, 'fetch').and.callFake(async (input) => {
    const url = String(input);
    await gates[url];
    const body = files[url];
    return body === undefined ? new Response('Not found', { status: 404 }) : new Response(JSON.stringify(body));
  });
}
