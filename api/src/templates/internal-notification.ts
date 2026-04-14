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

export function internalNotificationHtml(d: InternalNotificationData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>New enquiry — JVM Solutions</title>
</head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:system-ui,-apple-system,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e1e3a 0%,#2a1a4e 100%);border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:2px;color:#8B5CF6;text-transform:uppercase;">JVM Solutions</p>
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;line-height:1.3;">New Website Enquiry</h1>
              <p style="margin:12px 0 0;font-size:14px;color:#a0a0c0;">Service requested: <strong style="color:#c4b5fd;">${d.safeService}</strong></p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#16162a;padding:32px 40px;">

              <!-- Contact details -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:0 0 16px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:1.5px;color:#6b6b8a;text-transform:uppercase;">Name</p>
                    <p style="margin:0;font-size:16px;color:#e2e2f0;">${d.safeName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 16px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:1.5px;color:#6b6b8a;text-transform:uppercase;">Email</p>
                    <p style="margin:0;font-size:16px;"><a href="mailto:${d.safeEmail}" style="color:#8B5CF6;text-decoration:none;">${d.safeEmail}</a></p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 16px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:1.5px;color:#6b6b8a;text-transform:uppercase;">Company</p>
                    <p style="margin:0;font-size:16px;color:#e2e2f0;">${d.safeCompany}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 0;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:1.5px;color:#6b6b8a;text-transform:uppercase;">Service</p>
                    <p style="margin:0;font-size:16px;color:#e2e2f0;">${d.safeService}</p>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #2a2a4a;margin:0 0 28px;">

              <!-- Message -->
              <p style="margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:1.5px;color:#6b6b8a;text-transform:uppercase;">Message</p>
              <div style="background:#1e1e38;border-left:3px solid #8B5CF6;border-radius:0 8px 8px 0;padding:20px 24px;font-size:15px;color:#c8c8e0;line-height:1.7;">
                ${d.safeMessage}
              </div>

              <!-- Reply CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px auto 0;">
                <tr>
                  <td align="center">
                    <a href="mailto:${d.safeEmail}?subject=Re: Your enquiry — ${d.safeService}&body=Hi ${d.rawName},"
                       style="display:inline-block;background:linear-gradient(135deg,#7C3AED,#8B5CF6);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;letter-spacing:0.3px;">
                      Reply to ${d.safeName}
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0f0f1a;border-radius:0 0 12px 12px;padding:20px 40px;text-align:center;border-top:1px solid #1e1e38;">
              <p style="margin:0;font-size:12px;color:#4a4a6a;">This message was sent from the contact form at <strong style="color:#6b6b8a;">jvm-solutions.com</strong></p>
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
  ].join('\n');
}
