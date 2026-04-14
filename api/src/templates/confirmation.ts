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

export function confirmationHtml(d: ConfirmationData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>We received your message — JVM Solutions</title>
</head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:system-ui,-apple-system,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e1e3a 0%,#2a1a4e 100%);border-radius:12px 12px 0 0;padding:40px 40px 32px;text-align:center;">
              <!-- Logo wordmark -->
              <p style="margin:0 0 24px;font-size:20px;font-weight:800;letter-spacing:1px;color:#ffffff;">
                JVM <span style="color:#8B5CF6;">Solutions</span>
              </p>
              <!-- Checkmark icon -->
              <div style="display:inline-block;width:56px;height:56px;background:rgba(139,92,246,0.15);border:2px solid #8B5CF6;border-radius:50%;text-align:center;line-height:52px;font-size:26px;margin-bottom:20px;">
                &#10003;
              </div>
              <h1 style="margin:0 0 10px;font-size:26px;font-weight:700;color:#ffffff;line-height:1.3;">
                We've received your message
              </h1>
              <p style="margin:0;font-size:15px;color:#a0a0c0;line-height:1.6;">
                Hi <strong style="color:#c4b5fd;">${d.safeName}</strong>, thanks for reaching out.<br>
                We'll review your enquiry and get back to you within&nbsp;<strong style="color:#ffffff;">24–48 hours</strong>.
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#16162a;padding:32px 40px;">

              <!-- What happens next -->
              <p style="margin:0 0 20px;font-size:11px;font-weight:600;letter-spacing:1.5px;color:#6b6b8a;text-transform:uppercase;">What happens next</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="padding:0 0 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:32px;height:32px;background:rgba(139,92,246,0.12);border-radius:50%;text-align:center;font-size:13px;font-weight:700;color:#8B5CF6;vertical-align:middle;" align="center">1</td>
                        <td style="padding-left:14px;font-size:14px;color:#c8c8e0;line-height:1.5;">
                          <strong style="color:#e2e2f0;">Our team reviews your enquiry</strong><br>
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
                        <td style="width:32px;height:32px;background:rgba(139,92,246,0.12);border-radius:50%;text-align:center;font-size:13px;font-weight:700;color:#8B5CF6;vertical-align:middle;" align="center">2</td>
                        <td style="padding-left:14px;font-size:14px;color:#c8c8e0;line-height:1.5;">
                          <strong style="color:#e2e2f0;">We reply within 24–48 hours</strong><br>
                          On business days. Usually much faster.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:32px;height:32px;background:rgba(139,92,246,0.12);border-radius:50%;text-align:center;font-size:13px;font-weight:700;color:#8B5CF6;vertical-align:middle;" align="center">3</td>
                        <td style="padding-left:14px;font-size:14px;color:#c8c8e0;line-height:1.5;">
                          <strong style="color:#e2e2f0;">We schedule a discovery call</strong><br>
                          To define scope, timeline, and next steps together.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #2a2a4a;margin:0 0 28px;">

              <!-- Submitted specs -->
              <p style="margin:0 0 20px;font-size:11px;font-weight:600;letter-spacing:1.5px;color:#6b6b8a;text-transform:uppercase;">Your submission</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:0 0 12px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="110" style="font-size:12px;font-weight:600;color:#6b6b8a;text-transform:uppercase;letter-spacing:1px;padding-top:1px;">Service</td>
                        <td style="font-size:14px;color:#e2e2f0;">${d.safeService}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ${d.safeCompany !== '—' ? `<tr>
                  <td style="padding:0 0 12px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="110" style="font-size:12px;font-weight:600;color:#6b6b8a;text-transform:uppercase;letter-spacing:1px;padding-top:1px;">Company</td>
                        <td style="font-size:14px;color:#e2e2f0;">${d.safeCompany}</td>
                      </tr>
                    </table>
                  </td>
                </tr>` : ''}
              </table>

              <!-- Message recap -->
              <p style="margin:0 0 10px;font-size:12px;font-weight:600;color:#6b6b8a;text-transform:uppercase;letter-spacing:1px;">Your message</p>
              <div style="background:#1e1e38;border-left:3px solid #8B5CF6;border-radius:0 8px 8px 0;padding:20px 24px;font-size:14px;color:#c8c8e0;line-height:1.7;">
                ${d.safeMessage}
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0f0f1a;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;border-top:1px solid #1e1e38;">
              <p style="margin:0 0 8px;font-size:13px;color:#4a4a6a;">
                This is an automated confirmation. Please do not reply to this email.<br>
                If you have an urgent matter, reach us at
                <a href="mailto:hello@jvm-solutions.com" style="color:#8B5CF6;text-decoration:none;">hello@jvm-solutions.com</a>
              </p>
              <p style="margin:12px 0 0;font-size:12px;color:#3a3a5a;">
                &copy; ${new Date().getFullYear()} JVM Solutions &bull;
                <a href="https://jvm-solutions.com" style="color:#6b6b8a;text-decoration:none;">jvm-solutions.com</a>
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
    "Thank you for reaching out to JVM Solutions. We've received your enquiry and will get back to you within 24 hours.",
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
    '2. We reply within 24 hours (business days)',
    '3. We schedule a discovery call to define scope and next steps',
    '',
    'This is an automated confirmation. Please do not reply to this email.',
    'For urgent matters contact us at hello@jvm-solutions.com',
    '',
    'JVM Solutions — https://jvm-solutions.com',
  ].filter(line => line !== undefined).join('\n');
}
