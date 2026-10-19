import { ACCENT, ACCENT_FILL, INK, LINE, MUTED, NOT_PROVIDED, SITE, emailLayout } from './theme';

export interface InternalNotificationData {
  safeName: string;
  safeEmail: string;
  safeCompany: string;
  /** The idea's name from the Subject line, or NOT_PROVIDED when they left it empty */
  safeProject: string;
  safeService: string;
  safeMessage: string;
  rawName: string;
  rawEmail: string;
  rawService: string;
  rawCompany: string;
  rawProject: string;
  rawMessage: string;
  lang: string;
}

// The site language the enquiry was sent from — the language to reply in.
const LANGUAGES: Record<string, string> = { en: 'English', cs: 'Czech', sk: 'Slovak', uk: 'Ukrainian' };

const PREVIEW_LENGTH = 140;

function detailRow(label: string, value: string): string {
  return `
                <tr>
                  <td width="96" style="width:96px;padding:10px 12px 10px 0;border-top:1px solid ${LINE};vertical-align:top;font-size:14px;color:${MUTED};">${label}</td>
                  <td style="padding:10px 0;border-top:1px solid ${LINE};vertical-align:top;font-size:15px;color:${INK};">${value}</td>
                </tr>`;
}

export function internalNotificationHtml(d: InternalNotificationData): string {
  const hasCompany = d.rawCompany !== NOT_PROVIDED;
  const hasProject = d.rawProject !== NOT_PROVIDED;
  const language = LANGUAGES[d.lang] ?? d.lang;
  // Message preview for the inbox list; drop a trailing half-cut HTML entity.
  const preview = d.safeMessage.replace(/<br>/g, ' ').slice(0, PREVIEW_LENGTH).replace(/&[^;\s]*$/, '');
  const replySubject = hasProject ? `Re: JVM Yore — ${d.rawService} — ${d.rawProject}` : `Re: JVM Yore — ${d.rawService}`;
  const replyHref = `mailto:${d.safeEmail}?subject=${encodeURIComponent(replySubject)}`;

  const body = `
          <tr>
            <td class="pad" style="padding:28px 40px 0;">
              <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:${ACCENT};">New enquiry &middot; ${d.safeService}</p>
              <h1 style="margin:0;font-size:24px;line-height:1.3;font-weight:700;letter-spacing:-0.2px;color:${INK};">${d.safeName}</h1>
            </td>
          </tr>
          <tr>
            <td class="pad" style="padding:20px 40px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px solid ${LINE};">${[
                detailRow('Email', `<a href="mailto:${d.safeEmail}" style="color:${ACCENT};text-decoration:none;">${d.safeEmail}</a>`),
                detailRow('Company', hasCompany ? d.safeCompany : `<span style="color:${MUTED};">Not provided</span>`),
                detailRow('Project', hasProject ? d.safeProject : `<span style="color:${MUTED};">Not provided</span>`),
                detailRow('Service', d.safeService),
                detailRow('Language', language),
              ].join('')}
              </table>
            </td>
          </tr>
          <tr>
            <td class="pad" style="padding:28px 40px 0;">
              <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:${INK};">Message</p>
              <div style="background:#FAFAFA;border:1px solid ${LINE};border-radius:8px;padding:16px 20px;font-size:15px;line-height:1.7;color:${INK};">${d.safeMessage}</div>
            </td>
          </tr>
          <tr>
            <td class="pad" style="padding:28px 40px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px;background:${ACCENT_FILL};">
                    <a href="${replyHref}" style="display:inline-block;padding:12px 22px;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:8px;">Reply to ${d.safeName}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;

  return emailLayout({
    lang: 'en',
    title: `New enquiry — ${d.safeName}`,
    preheader: preview,
    body,
    footer: `Sent from the contact form at <a href="${SITE}/contact" style="color:${MUTED};text-decoration:underline;">jvm-yore.com</a>.<br>
              Replying to this email goes straight to ${d.safeName}.`,
  });
}

export function internalNotificationText(d: InternalNotificationData): string {
  return [
    'NEW ENQUIRY — JVM YORE',
    '======================',
    '',
    `Name:     ${d.rawName}`,
    `Email:    ${d.rawEmail}`,
    `Company:  ${d.rawCompany}`,
    `Project:  ${d.rawProject}`,
    `Service:  ${d.rawService}`,
    `Language: ${LANGUAGES[d.lang] ?? d.lang}`,
    '',
    'Message:',
    '--------',
    d.rawMessage,
    '',
    '======================',
    `Reply: mailto:${d.rawEmail}`,
  ].join('\n');
}
