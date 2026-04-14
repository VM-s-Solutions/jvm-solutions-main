import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { Resend } from 'resend';
import { internalNotificationHtml, internalNotificationText } from '../templates/internal-notification';
import { confirmationHtml, confirmationText } from '../templates/confirmation';

interface ContactPayload {
  name: string;
  email: string;
  company?: string;
  service: string;
  message: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LEN = { name: 100, email: 254, company: 200, service: 100, message: 5000 };

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function contactHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  // Parse body
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return { status: 400, jsonBody: { error: 'Invalid JSON body' } };
  }

  if (typeof payload !== 'object' || payload === null) {
    return { status: 400, jsonBody: { error: 'Invalid request body' } };
  }

  const { name, email, company, service, message } = payload as Record<string, unknown>;

  // Validate types + required fields
  if (
    typeof name !== 'string' || !name.trim() ||
    typeof email !== 'string' || !email.trim() ||
    typeof service !== 'string' || !service.trim() ||
    typeof message !== 'string' || !message.trim()
  ) {
    return { status: 400, jsonBody: { error: 'Missing required fields: name, email, service, message' } };
  }

  // Validate email format
  if (!EMAIL_RE.test(email)) {
    return { status: 400, jsonBody: { error: 'Invalid email address' } };
  }

  // Validate lengths to prevent abuse
  if (name.length > MAX_LEN.name || email.length > MAX_LEN.email || message.length > MAX_LEN.message) {
    return { status: 400, jsonBody: { error: 'One or more fields exceed maximum length' } };
  }

  if (company !== undefined && (typeof company !== 'string' || company.length > MAX_LEN.company)) {
    return { status: 400, jsonBody: { error: 'Invalid company field' } };
  }

  const apiKey = process.env['RESEND_API_KEY'];
  if (!apiKey) {
    context.error('RESEND_API_KEY environment variable is not set');
    return { status: 500, jsonBody: { error: 'Server configuration error' } };
  }

  const toEmail = process.env['CONTACT_TO_EMAIL'];
  if (!toEmail) {
    context.error('CONTACT_TO_EMAIL environment variable is not set');
    return { status: 500, jsonBody: { error: 'Server configuration error' } };
  }

  const fromEmail = process.env['CONTACT_FROM_EMAIL'] ?? toEmail;

  const resend = new Resend(apiKey);

  const safeName    = escapeHtml(name.trim());
  const safeEmail   = escapeHtml(email.trim());
  const safeService = escapeHtml(service.trim());
  const safeCompany = escapeHtml((company as string | undefined)?.trim() ?? '—');
  const safeMessage = escapeHtml(message.trim()).replace(/\n/g, '<br>');

  const rawCompany = (company as string | undefined)?.trim() ?? '—';

  const templateData = {
    safeName, safeEmail, safeService, safeCompany, safeMessage,
    rawName: name.trim(),
    rawEmail: email.trim(),
    rawService: service.trim(),
    rawCompany,
    rawMessage: message.trim(),
  };

  try {
    const [notification, confirmation] = await Promise.all([
      resend.emails.send({
        from: `JVM Solutions Website <${fromEmail}>`,
        to: [toEmail],
        replyTo: `${name.trim()} <${email.trim()}>`,
        subject: `[JVM Solutions] New enquiry — ${service.trim()}`,
        text: internalNotificationText(templateData),
        html: internalNotificationHtml(templateData),
      }),
      resend.emails.send({
        from: `JVM Solutions <${fromEmail}>`,
        to: [email.trim()],
        subject: `We've received your message — JVM Solutions`,
        text: confirmationText(templateData),
        html: confirmationHtml(templateData),
      }),
    ]);

    if (notification.error) {
      context.error('Resend notification error', notification.error);
      return { status: 502, jsonBody: { error: 'Failed to send email. Please try again.' } };
    }

    if (confirmation.error) {
      // Non-fatal: internal notification succeeded; log but don't fail the request
      context.warn('Resend confirmation error', confirmation.error);
    }
  } catch (err: unknown) {
    context.error('Resend unexpected error', err);
    return { status: 502, jsonBody: { error: 'Failed to send email. Please try again.' } };
  }

  return { status: 200, jsonBody: { ok: true } };
}

app.http('contact', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'contact',
  handler: contactHandler,
});
