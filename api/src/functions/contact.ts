import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import * as sgMail from '@sendgrid/mail';

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

  const apiKey = process.env['SENDGRID_API_KEY'];
  if (!apiKey) {
    context.error('SENDGRID_API_KEY environment variable is not set');
    return { status: 500, jsonBody: { error: 'Server configuration error' } };
  }

  const toEmail = process.env['CONTACT_TO_EMAIL'];
  if (!toEmail) {
    context.error('CONTACT_TO_EMAIL environment variable is not set');
    return { status: 500, jsonBody: { error: 'Server configuration error' } };
  }

  const fromEmail = process.env['CONTACT_FROM_EMAIL'] ?? toEmail;

  sgMail.setApiKey(apiKey);

  const safeName    = escapeHtml(name.trim());
  const safeEmail   = escapeHtml(email.trim());
  const safeService = escapeHtml(service.trim());
  const safeCompany = escapeHtml((company as string | undefined)?.trim() ?? '—');
  const safeMessage = escapeHtml(message.trim()).replace(/\n/g, '<br>');

  try {
    await sgMail.send({
      to: toEmail,
      from: { email: fromEmail, name: 'JVM Solutions Website' },
      replyTo: { email: email.trim(), name: name.trim() },
      subject: `[JVM Solutions] New enquiry — ${service.trim()}`,
      text: [
        `Name:    ${name.trim()}`,
        `Email:   ${email.trim()}`,
        `Company: ${(company as string | undefined)?.trim() ?? '—'}`,
        `Service: ${service.trim()}`,
        '',
        message.trim(),
      ].join('\n'),
      html: `
        <table style="font-family:system-ui,sans-serif;font-size:15px;color:#1e1e2e;max-width:600px">
          <tr><td style="padding:8px 0"><strong>Name:</strong> ${safeName}</td></tr>
          <tr><td style="padding:8px 0"><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
          <tr><td style="padding:8px 0"><strong>Company:</strong> ${safeCompany}</td></tr>
          <tr><td style="padding:8px 0"><strong>Service:</strong> ${safeService}</td></tr>
          <tr><td style="padding:24px 0 8px"><strong>Message:</strong></td></tr>
          <tr><td style="background:#f8f9fa;padding:16px;border-left:3px solid #8B5CF6;border-radius:4px">
            ${safeMessage}
          </td></tr>
        </table>
      `,
    });
  } catch (err: unknown) {
    context.error('SendGrid API error', err);
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
