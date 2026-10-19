import { Resend } from 'resend';
import { internalNotificationHtml, internalNotificationText } from './templates/internal-notification';
import { confirmationHtml, confirmationText, confirmationSubject } from './templates/confirmation';
import { NOT_PROVIDED } from './templates/theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LEN = { name: 100, email: 254, company: 200, service: 100, project: 100, message: 5000 };
const ALLOWED_LANGS = new Set(['en', 'cs', 'sk', 'uk']);
// Cloudflare's siteverify answers in well under a second; one that stalls fails the request instead of holding it open
const SITEVERIFY_TIMEOUT_MS = 10_000;

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

  const { name, email, company, project, service, message, captchaToken, lang: rawLang } = rawBody as Record<string, unknown>;
  const lang = (typeof rawLang === 'string' && ALLOWED_LANGS.has(rawLang)) ? rawLang : 'en';

  if (
    typeof name !== 'string' || !name.trim() ||
    typeof email !== 'string' || !email.trim() ||
    typeof service !== 'string' || !service.trim() ||
    typeof message !== 'string' || !message.trim() ||
    typeof captchaToken !== 'string' || !captchaToken.trim()
  ) {
    return { status: 400, body: { error: 'Missing required fields: name, email, service, message, captchaToken' } };
  }

  // Lengths first: the email pattern backtracks on long input, so it only ever sees 254 characters or fewer
  if (
    name.length > MAX_LEN.name ||
    email.length > MAX_LEN.email ||
    service.length > MAX_LEN.service ||
    message.length > MAX_LEN.message
  ) {
    return { status: 400, body: { error: 'One or more fields exceed maximum length' } };
  }

  if (!EMAIL_RE.test(email)) {
    return { status: 400, body: { error: 'Invalid email address' } };
  }

  if (company !== undefined && (typeof company !== 'string' || company.length > MAX_LEN.company)) {
    return { status: 400, body: { error: 'Invalid company field' } };
  }

  if (project !== undefined && typeof project !== 'string') {
    return { status: 400, body: { error: 'Invalid project field' } };
  }

  // The idea's name, from the form's Subject line. It goes into the email subject, so it
  // stays on one line; an empty one is ignored.
  const projectName = typeof project === 'string' ? project.replace(/\s+/g, ' ').trim() : '';
  if (projectName.length > MAX_LEN.project) {
    return { status: 400, body: { error: 'One or more fields exceed maximum length' } };
  }

  const apiKey = process.env['RESEND_API_KEY'];
  if (!apiKey) {
    return { status: 500, body: { error: 'Server configuration error' } };
  }

  const toEmail = process.env['CONTACT_TO_EMAIL'];
  if (!toEmail) {
    return { status: 500, body: { error: 'Server configuration error' } };
  }

  const fromEmail = process.env['CONTACT_FROM_EMAIL'] ?? toEmail;

  const turnstileSecret = process.env['TURNSTILE_SECRET_KEY'];
  if (!turnstileSecret) {
    return { status: 500, body: { error: 'Server configuration error' } };
  }

  try {
    const verifyForm = new URLSearchParams();
    verifyForm.append('secret', turnstileSecret);
    verifyForm.append('response', captchaToken.trim());

    const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: verifyForm,
      signal: AbortSignal.timeout(SITEVERIFY_TIMEOUT_MS),
    });

    const verifyData = await verifyResponse.json() as { success: boolean; 'error-codes'?: string[] };

    if (!verifyData.success) {
      // The codes tell a bot or an expired token from our own fault, such as a rotated secret.
      // Never log the secret or the token.
      console.error('Turnstile verification failed', verifyData['error-codes']);
      return { status: 400, body: { error: 'CAPTCHA verification failed. Please try again.' } };
    }
  } catch (err) {
    console.error('Turnstile siteverify request failed', err);
    return { status: 502, body: { error: 'Could not verify CAPTCHA. Please try again.' } };
  }

  const resend = new Resend(apiKey);

  const rawCompany  = (typeof company === 'string' && company.trim()) || NOT_PROVIDED;
  const rawProject  = projectName || NOT_PROVIDED;
  const safeName    = escapeHtml(name.trim());
  const safeEmail   = escapeHtml(email.trim());
  const safeService = escapeHtml(service.trim());
  const safeCompany = escapeHtml(rawCompany);
  const safeProject = escapeHtml(rawProject);
  const safeMessage = escapeHtml(message.trim()).replace(/\n/g, '<br>');

  const templateData = {
    safeName, safeEmail, safeService, safeCompany, safeProject, safeMessage,
    rawName: name.trim(),
    rawEmail: email.trim(),
    rawService: service.trim(),
    rawCompany,
    rawProject,
    rawMessage: message.trim(),
    lang,
  };

  // Same rule as the templates' "Not provided", so the subject and the body agree
  const subject = rawProject !== NOT_PROVIDED
    ? `[JVM Yore] New enquiry — ${service.trim()} — ${rawProject}`
    : `[JVM Yore] New enquiry — ${service.trim()}`;

  // Our copy goes first, on its own: the visitor is told "we've received your message" only once
  // we have it, so a failed send never leaves them holding a confirmation for an enquiry we lost.
  try {
    const notification = await resend.emails.send({
      from: `JVM Yore Website <${fromEmail}>`,
      to: [toEmail],
      replyTo: `${name.trim()} <${email.trim()}>`,
      subject,
      text: internalNotificationText(templateData),
      html: internalNotificationHtml(templateData),
    });

    // Resend's message names the actual cause (e.g. unverified sender domain,
    // revoked key) — log it, since the client only gets a generic error.
    if (notification.error) {
      console.error(`Resend rejected notification email from ${fromEmail} to ${toEmail}`, notification.error);
      const resendErr = notification.error as { statusCode?: number };
      if (resendErr.statusCode === 401 || resendErr.statusCode === 403) {
        return { status: 500, body: { error: 'Email service misconfigured. Please contact us directly.' } };
      }
      return { status: 502, body: { error: 'Failed to send email. Please try again.' } };
    }
  } catch (err) {
    console.error('Resend request failed', err);
    return { status: 502, body: { error: 'Failed to send email. Please try again.' } };
  }

  // The enquiry has reached us, so the request succeeds whatever happens to the visitor's copy:
  // an error here would only make them send it again.
  try {
    const confirmation = await resend.emails.send({
      from: `JVM Yore <${fromEmail}>`,
      to: [email.trim()],
      subject: confirmationSubject(lang),
      text: confirmationText(templateData),
      html: confirmationHtml(templateData),
    });
    if (confirmation.error) {
      console.error(`Resend rejected confirmation email from ${fromEmail}`, confirmation.error);
    }
  } catch (err) {
    console.error('Resend confirmation request failed', err);
  }

  return { status: 200, body: { ok: true } };
}
