export interface ConfirmationData {
  safeName: string;
  safeEmail: string;
  safeCompany: string;
  safeService: string;
  safeMessage: string;
  rawName: string;
  rawService: string;
  rawMessage: string;
  rawCompany: string;
}

// Design tokens (mirrors src/styles/_variables.scss)
// $bg-primary: #09090F | $bg-surface: #13131A | $bg-elevated: #1A1A24
// $border-color: #1E1E2E | $border-light: #2A2A3E
// $purple: #8B5CF6 | $purple-light: #A78BFA | $green: #10B981
// $text-primary: #F1F5F9 | $text-secondary: #94A3B8 | $text-muted: #64748B
// $gradient-brand: linear-gradient(135deg, #8B5CF6, #10B981)

export function confirmationHtml(d: ConfirmationData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>We received your message — JVM Solutions</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500&display=swap');
  </style>
</head>
<body style="margin:0;padding:0;background:#09090F;font-family:'Inter','Space Grotesk',system-ui,-apple-system,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#09090F;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0"
               style="max-width:600px;width:100%;border-radius:12px;border:1px solid #1E1E2E;overflow:hidden;">

          <!-- Brand gradient accent bar -->
          <tr>
            <td height="3" style="background:#8B5CF6;background:linear-gradient(135deg,#8B5CF6,#10B981);font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="background:#13131A;padding:40px 40px 32px;text-align:center;">
              <!-- Logo wordmark -->
              <p style="margin:0 0 28px;font-family:'Space Grotesk',system-ui,sans-serif;font-size:18px;font-weight:700;letter-spacing:2px;color:#F1F5F9;text-transform:uppercase;">
                JVM <span style="background:#8B5CF6;background:linear-gradient(135deg,#8B5CF6,#10B981);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;color:#8B5CF6;">Solutions</span>
              </p>
              <!-- Success icon — green to match site success state -->
              <div style="display:inline-block;width:60px;height:60px;background:rgba(16,185,129,0.1);border:2px solid #10B981;border-radius:50%;text-align:center;line-height:56px;font-size:28px;color:#10B981;margin-bottom:24px;">&#10003;</div>
              <h1 style="margin:0 0 12px;font-family:'Space Grotesk',system-ui,sans-serif;font-size:26px;font-weight:700;color:#F1F5F9;line-height:1.3;">
                We've received your message
              </h1>
              <p style="margin:0;font-size:15px;color:#94A3B8;line-height:1.6;">
                Hi <strong style="color:#A78BFA;">${d.safeName}</strong>, thanks for reaching out.<br>
                We'll review your enquiry and get back to you within&nbsp;<strong style="color:#F1F5F9;">24–48 hours</strong>.
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#13131A;padding:0 40px 32px;">

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #1E1E2E;margin:0 0 32px;">

              <!-- What happens next -->
              <p style="margin:0 0 20px;font-size:11px;font-weight:600;letter-spacing:2px;color:#64748B;text-transform:uppercase;">What happens next</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="padding:0 0 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="32" height="32" style="width:32px;height:32px;min-width:32px;background:rgba(139,92,246,0.12);border-radius:50%;text-align:center;font-size:13px;font-weight:700;color:#8B5CF6;vertical-align:middle;" align="center">1</td>
                        <td style="padding-left:14px;font-size:14px;color:#94A3B8;line-height:1.6;">
                          <strong style="color:#F1F5F9;font-family:'Space Grotesk',system-ui,sans-serif;">Our team reviews your enquiry</strong><br>
                          We read every message carefully before responding.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="32" height="32" style="width:32px;height:32px;min-width:32px;background:rgba(139,92,246,0.12);border-radius:50%;text-align:center;font-size:13px;font-weight:700;color:#8B5CF6;vertical-align:middle;" align="center">2</td>
                        <td style="padding-left:14px;font-size:14px;color:#94A3B8;line-height:1.6;">
                          <strong style="color:#F1F5F9;font-family:'Space Grotesk',system-ui,sans-serif;">We reply within 24–48 hours</strong><br>
                          On business days — usually much faster.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="32" height="32" style="width:32px;height:32px;min-width:32px;background:rgba(139,92,246,0.12);border-radius:50%;text-align:center;font-size:13px;font-weight:700;color:#8B5CF6;vertical-align:middle;" align="center">3</td>
                        <td style="padding-left:14px;font-size:14px;color:#94A3B8;line-height:1.6;">
                          <strong style="color:#F1F5F9;font-family:'Space Grotesk',system-ui,sans-serif;">We schedule a discovery call</strong><br>
                          To define scope, timeline, and next steps together.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #1E1E2E;margin:0 0 32px;">

              <!-- Submitted specs -->
              <p style="margin:0 0 16px;font-size:11px;font-weight:600;letter-spacing:2px;color:#64748B;text-transform:uppercase;">Your submission</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="background:#1A1A24;border:1px solid #1E1E2E;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="90" style="font-size:11px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:1.5px;padding-bottom:16px;vertical-align:top;padding-top:2px;">Service</td>
                        <td style="font-size:14px;color:#F1F5F9;padding-bottom:16px;">${d.safeService}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ${d.safeCompany !== '—' ? `<tr>
                  <td style="padding:0 20px 0;border-top:1px solid #1E1E2E;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="90" style="font-size:11px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:1.5px;padding:16px 0;vertical-align:top;padding-top:18px;">Company</td>
                        <td style="font-size:14px;color:#F1F5F9;padding:16px 0;padding-top:18px;">${d.safeCompany}</td>
                      </tr>
                    </table>
                  </td>
                </tr>` : ''}
              </table>

              <!-- Message recap -->
              <p style="margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:2px;color:#64748B;text-transform:uppercase;">Your message</p>
              <div style="background:#1A1A24;border-left:3px solid #8B5CF6;border-radius:0 8px 8px 0;padding:20px 24px;font-size:14px;color:#94A3B8;line-height:1.8;">
                ${d.safeMessage}
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#09090F;border-top:1px solid #1E1E2E;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:#64748B;line-height:1.6;">
                This is an automated confirmation. Please do not reply to this email.<br>
                For urgent matters reach us at
                <a href="mailto:hello@jvm-solutions.dev" style="color:#8B5CF6;text-decoration:none;">hello@jvm-solutions.dev</a>
              </p>
              <p style="margin:12px 0 0;font-size:12px;color:#2A2A3E;">
                &copy; ${new Date().getFullYear()} JVM Solutions &bull;
                <a href="https://jvm-solutions.dev" style="color:#64748B;text-decoration:none;">jvm-solutions.dev</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function confirmationText(d: ConfirmationData): string {
  const companyLine = d.rawCompany !== '—' ? `Company: ${d.rawCompany}\n` : '';
  return [
    `Hi ${d.rawName},`,
    '',
    "Thank you for reaching out to JVM Solutions. We've received your enquiry and will get back to you within 24–48 hours.",
    '',
    '--- YOUR SUBMISSION ---',
    `Service: ${d.rawService}`,
    companyLine.trim(),
    '',
    'Message:',
    d.rawMessage,
    '',
    '----------------------',
    '',
    'What happens next:',
    '1. Our team reviews your enquiry',
    '2. We reply within 24–48 hours (business days)',
    '3. We schedule a discovery call to define scope and next steps',
    '',
    'This is an automated confirmation. Please do not reply to this email.',
    'For urgent matters contact us at hello@jvm-solutions.dev',
    '',
    'JVM Solutions — https://jvm-solutions.dev',
  ].filter(line => line !== undefined).join('\n');
}
