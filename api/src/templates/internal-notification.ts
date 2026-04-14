export interface InternalNotificationData {
  safeName: string;
  safeEmail: string;
  safeCompany: string;
  safeService: string;
  safeMessage: string;
  rawName: string;
  rawEmail: string;
  rawService: string;
  rawCompany: string;
  rawMessage: string;
}

// Design tokens (mirrors src/styles/_variables.scss)
// $bg-primary: #09090F | $bg-surface: #13131A | $bg-elevated: #1A1A24
// $border-color: #1E1E2E | $border-light: #2A2A3E
// $purple: #8B5CF6 | $purple-light: #A78BFA | $green: #10B981
// $text-primary: #F1F5F9 | $text-secondary: #94A3B8 | $text-muted: #64748B
// $gradient-brand: linear-gradient(135deg, #8B5CF6, #10B981)

export function internalNotificationHtml(d: InternalNotificationData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>New enquiry — JVM Solutions</title>
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
            <td style="background:#13131A;padding:32px 40px 28px;text-align:center;">
              <p style="margin:0 0 6px;font-family:'Space Grotesk',system-ui,sans-serif;font-size:11px;font-weight:600;letter-spacing:2px;color:#8B5CF6;text-transform:uppercase;">JVM Solutions</p>
              <h1 style="margin:0 0 12px;font-family:'Space Grotesk',system-ui,sans-serif;font-size:24px;font-weight:700;color:#F1F5F9;line-height:1.3;">New Website Enquiry</h1>
              <p style="margin:0;font-size:14px;color:#94A3B8;">
                Service requested:
                <strong style="color:#A78BFA;">${d.safeService}</strong>
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#13131A;padding:0 40px 32px;">

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #1E1E2E;margin:0 0 28px;">

              <!-- Contact details card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="background:#1A1A24;border:1px solid #1E1E2E;border-radius:8px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px 4px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <!-- Name -->
                      <tr>
                        <td style="padding-bottom:16px;">
                          <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:2px;color:#64748B;text-transform:uppercase;">Name</p>
                          <p style="margin:0;font-size:15px;font-family:'Space Grotesk',system-ui,sans-serif;color:#F1F5F9;">${d.safeName}</p>
                        </td>
                      </tr>
                      <!-- Email -->
                      <tr>
                        <td style="padding-bottom:16px;border-top:1px solid #1E1E2E;padding-top:16px;">
                          <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:2px;color:#64748B;text-transform:uppercase;">Email</p>
                          <p style="margin:0;font-size:15px;">
                            <a href="mailto:${d.safeEmail}" style="color:#8B5CF6;text-decoration:none;font-family:'Space Grotesk',system-ui,sans-serif;">${d.safeEmail}</a>
                          </p>
                        </td>
                      </tr>
                      <!-- Company -->
                      <tr>
                        <td style="padding-bottom:16px;border-top:1px solid #1E1E2E;padding-top:16px;">
                          <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:2px;color:#64748B;text-transform:uppercase;">Company</p>
                          <p style="margin:0;font-size:15px;font-family:'Space Grotesk',system-ui,sans-serif;color:${d.safeCompany !== '—' ? '#F1F5F9' : '#475569'};${d.safeCompany === '—' ? 'font-style:italic;' : ''}">${d.safeCompany !== '—' ? d.safeCompany : 'Not filled'}</p>
                        </td>
                      </tr>
                      <!-- Service -->
                      <tr>
                        <td style="padding-bottom:20px;border-top:1px solid #1E1E2E;padding-top:16px;">
                          <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:2px;color:#64748B;text-transform:uppercase;">Service</p>
                          <p style="margin:0;font-size:15px;font-family:'Space Grotesk',system-ui,sans-serif;color:#F1F5F9;">${d.safeService}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <p style="margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:2px;color:#64748B;text-transform:uppercase;">Message</p>
              <div style="background:#1A1A24;border:1px solid #1E1E2E;border-left:3px solid #8B5CF6;border-radius:0 8px 8px 0;padding:20px 24px;margin-bottom:32px;">
                <p style="margin:0 0 10px;font-size:11px;font-weight:600;letter-spacing:1.5px;color:#475569;text-transform:uppercase;font-family:'Space Grotesk',system-ui,sans-serif;">From ${d.safeName}</p>
                <p style="margin:0;font-size:14px;color:#94A3B8;line-height:1.8;">${d.safeMessage}</p>
              </div>

              <!-- Reply CTA — brand gradient matches site's btn-primary -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td align="center" style="border-radius:8px;background:#8B5CF6;background:linear-gradient(135deg,#8B5CF6,#10B981);">
                    <a href="mailto:${d.safeEmail}?subject=Re%3A%20Your%20enquiry%20%E2%80%94%20${encodeURIComponent(d.rawService)}&body=Hi%20${encodeURIComponent(d.rawName)}%2C%0A%0A"
                       style="display:inline-block;padding:14px 32px;font-family:'Space Grotesk',system-ui,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.3px;border-radius:8px;">
                      Reply to ${d.safeName}
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#09090F;border-top:1px solid #1E1E2E;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#64748B;">
                Sent from the contact form at
                <a href="https://jvm-solutions.dev/contact" style="color:#64748B;text-decoration:none;">jvm-solutions.dev</a>
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

export function internalNotificationText(d: InternalNotificationData): string {
  return [
    'NEW ENQUIRY — JVM SOLUTIONS',
    '============================',
    '',
    `Name:    ${d.rawName}`,
    `Email:   ${d.rawEmail}`,
    `Company: ${d.rawCompany}`,
    `Service: ${d.rawService}`,
    '',
    'Message:',
    '--------',
    d.rawMessage,
    '',
    '============================',
    `Reply: mailto:${d.rawEmail}`,
  ].join('\n');
}
