// Shared look for every email we send. Light, because emails are read in the
// recipient's inbox, not on our dark site. Orange is the site's $accent-light
// (AA on white) and $orange-fill for buttons; the logo is a PNG because
// Gmail/Outlook drop SVG.
export const SITE = 'https://jvm-yore.com';
export const LOGO_URL = `${SITE}/images/email-logo.png`;
export const INK = '#18181B';
export const TEXT = '#3F3F46';
export const MUTED = '#66666E';
export const LINE = '#E4E4E7';
export const ACCENT = '#C33E00';
export const ACCENT_FILL = '#D14400';
export const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

/**
 * Stands in for an optional field the sender left empty. The templates print "Not provided"
 * in its place; the team's plain-text email shows it as it is.
 */
export const NOT_PROVIDED = '—';

export interface EmailLayout {
  lang: string;
  title: string;
  /** Inbox preview line — hidden in the body. */
  preheader: string;
  /** `<tr>` rows placed in the white card, below the logo. */
  body: string;
  /** Small print under the card. */
  footer: string;
}

export function emailLayout({ lang, title, preheader, body, footer }: EmailLayout): string {
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>${title}</title>
  <style>
    :root { color-scheme: light only; }
    @media (max-width: 520px) { .pad { padding-left: 24px !important; padding-right: 24px !important; } }
  </style>
</head>
<body style="margin:0;padding:0;background:#F4F4F5;font-family:${FONT};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F5;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0"
               style="max-width:560px;width:100%;background:#FFFFFF;border:1px solid ${LINE};border-radius:12px;">
          <tr>
            <td class="pad" style="padding:36px 40px 8px;">
              <a href="${SITE}" style="text-decoration:none;">
                <img src="${LOGO_URL}" width="160" height="34" alt="JVM Yore"
                     style="display:block;width:160px;height:34px;border:0;outline:none;color:${INK};font-size:18px;font-weight:700;">
              </a>
            </td>
          </tr>${body}
        </table>
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
          <tr>
            <td class="pad" style="padding:24px 40px 0;font-size:12px;line-height:1.6;color:${MUTED};text-align:center;">
              ${footer}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
