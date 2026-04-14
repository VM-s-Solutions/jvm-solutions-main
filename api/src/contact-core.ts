import { Resend } from 'resend';
import { internalNotificationHtml, internalNotificationText } from './templates/internal-notification';
import { confirmationHtml, confirmationText } from './templates/confirmation';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LEN = { name: 100, email: 254, company: 200, service: 100, message: 5000 };

export interface ContactResult {
  status: number;
  body: unknown;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function processContactRequest(rawBody: unknown): Promise<ContactResult> {
  if (typeof rawBody !== 'object' || rawBody === null) {
    return { status: 400, body: { error: 'Invalid request body' } };
  }

  const { name, email, company, service, message, captchaToken } = rawBody as Record<string, unknown>;

  if (
    typeof name !== 'string' || !name.trim() ||
    typeof email !== 'string' || !email.trim() ||
    typeof service !== 'string' || !service.trim() ||
    typeof message !== 'string' || !message.trim() ||
    typeof captchaToken !== 'string' || !captchaToken.trim()
  ) {
    return { status: 400, body: { error: 'Missing required fields: name, email, service, message, captchaToken' } };
  }

  if (!EMAIL_RE.test(email)) {
    return { status: 400, body: { error: 'Invalid email address' } };
  }

  if (name.length > MAX_LEN.name || email.length > MAX_LEN.email || message.length > MAX_LEN.message) {
    return { status: 400, body: { error: 'One or more fields exceed maximum length' } };
  }

  if (company !== undefined && (typeof company !== 'string' || company.length > MAX_LEN.company)) {
    return { status: 400, body: { error: 'Invalid company field' } };
  }

  const apiKey = process.env['RESEND_API_KEY'];
  if (!apiKey) {
    console.error('RESEND_API_KEY environment variable is not set');
    return { status: 500, body: { error: 'Server configuration error' } };
  }

  const toEmail = process.env['CONTACT_TO_EMAIL'];
  if (!toEmail) {
    console.error('CONTACT_TO_EMAIL environment variable is not set');
    return { status: 500, body: { error: 'Server configuration error' } };
  }

  const fromEmail = process.env['CONTACT_FROM_EMAIL'] ?? toEmail;

  const turnstileSecret = process.env['TURNSTILE_SECRET_KEY'];
  if (!turnstileSecret) {
    console.error('TURNSTILE_SECRET_KEY environment variable is not set');
    return { status: 500, body: { error: 'Server configuration error' } };
  }

  try {
    const verifyForm = new URLSearchParams();
    verifyForm.append('secret', turnstileSecret);
    verifyForm.append('response', captchaToken.trim());

    const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: verifyForm,
    });

    const verifyData = await verifyResponse.json() as { success: boolean; 'error-codes'?: string[] };

    if (!verifyData.success) {
      console.warn('Turnstile verification failed', verifyData['error-codes']);
      return { status: 400, body: { error: 'CAPTCHA verification failed. Please try again.' } };
    }
  } catch (err: unknown) {
    console.error('Turnstile verification request error', err);
    return { status: 502, body: { error: 'Could not verify CAPTCHA. Please try again.' } };
  }

  const resend = new Resend(apiKey);

  const safeName    = escapeHtml(name.trim());
  const safeEmail   = escapeHtml(email.trim());
  const safeService = escapeHtml(service.trim());
  const safeCompany = escapeHtml((company as string | undefined)?.trim() ?? '—');
  const safeMessage = escapeHtml(message.trim()).replace(/\n/g, '<br>');
  const rawCompany  = (company as string | undefined)?.trim() ?? '—';

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
      console.error('Resend notification error', notification.error);
      return { status: 502, body: { error: 'Failed to send email. Please try again.' } };
    }

    if (confirmation.error) {
      console.warn('Resend confirmation error', confirmation.error);
    }
  } catch (err: unknown) {
    console.error('Resend unexpected error', err);
    return { status: 502, body: { error: 'Failed to send email. Please try again.' } };
  }

  return { status: 200, body: { ok: true } };
}
