import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { processContactRequest } from '../contact-core';

export async function contactHandler(
  request: HttpRequest,
  _context: InvocationContext
): Promise<HttpResponseInit> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return { status: 400, jsonBody: { error: 'Invalid JSON body' } };
  }

  const result = await processContactRequest(payload);
  return { status: result.status, jsonBody: result.body };
}

app.http('contact', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'contact',
  handler: contactHandler,
});
