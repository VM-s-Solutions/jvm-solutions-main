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
  lang: string;
}

// Design tokens (mirrors src/styles/_variables.scss)
// $bg-primary: #09090F | $bg-surface: #13131A | $bg-elevated: #1A1A24
// $border-color: #1E1E2E | $border-light: #2A2A3E
// $purple: #8B5CF6 | $purple-light: #A78BFA | $green: #10B981
// $text-primary: #F1F5F9 | $text-secondary: #94A3B8 | $text-muted: #64748B
// $gradient-brand: linear-gradient(135deg, #8B5CF6, #10B981)

const I18N = {
  en: {
    subject: "We've received your message \u2014 JVM Solutions",
    title: "We've received your message",
    greeting: (name: string) => `Hi <strong style='color:#A78BFA;'>${name}</strong>, thanks for reaching out.`,
    greetingPlain: (name: string) => `Hi ${name},`,
    intro: `We'll review your enquiry and get back to you within&nbsp;<strong style='color:#F1F5F9;'>24 hours</strong>.`,
    sectionNext: 'What happens next',
    step1title: 'Our team reviews your enquiry',
    step1desc: 'We read every message carefully before responding.',
    step2title: 'We reply within 24 hours',
    step2desc: 'On business days \u2014 usually much faster.',
    step3title: 'We schedule a discovery call',
    step3desc: 'To define scope, timeline, and next steps together.',
    sectionSubmission: 'Your submission',
    sectionSubmissionPlain: '--- YOUR SUBMISSION ---',
    labelService: 'Service',
    labelCompany: 'Company',
    notFilled: 'Not filled',
    sectionMessage: 'Your message',
    from: (name: string) => `From ${name}`,
    footerAuto: 'This is an automated confirmation. Please do not reply to this email.',
    footerUrgent: 'For urgent matters reach us at',
    thanks: "Thank you for reaching out to JVM Solutions. We've received your enquiry and will get back to you within 24 hours.",
    whatsNext: 'What happens next:',
    plain1: '1. Our team reviews your enquiry',
    plain2: '2. We reply within 24 hours (business days)',
    plain3: '3. We schedule a discovery call to define scope and next steps',
    automated: 'This is an automated confirmation. Please do not reply to this email.',
    urgent: 'For urgent matters contact us at hello@jvm-solutions.dev',
  },
  cs: {
    subject: 'P\u0159ijali jsme va\u0161i zpr\u00e1vu \u2014 JVM Solutions',
    title: 'P\u0159ijali jsme va\u0161i zpr\u00e1vu',
    greeting: (name: string) => `Dobr\u00fd den, <strong style='color:#A78BFA;'>${name}</strong>, d\u011bkujeme za kontakt.`,
    greetingPlain: (name: string) => `Dobr\u00fd den, ${name},`,
    intro: `Va\u0161i zpr\u00e1vu prostudujeme a ozveme se v\u00e1m do&nbsp;<strong style='color:#F1F5F9;'>24 hodin</strong>.`,
    sectionNext: 'Co se stane d\u00e1le',
    step1title: 'N\u00e1\u0161 t\u00fdm prostuduje v\u00e1\u0161 dotaz',
    step1desc: 'Ka\u017edou zpr\u00e1vu pe\u010dliv\u011b \u010dteme, ne\u017e odpov\u00edme.',
    step2title: 'Odpov\u00edme do 24 hodin',
    step2desc: 'V pracovn\u00ed dny \u2014 obvykle mnohem rychleji.',
    step3title: 'Domluv\u00edme \u00favodn\u00ed hovor',
    step3desc: 'Spole\u010dn\u011b definujeme rozsah, harmonogram a dal\u0161\u00ed kroky.',
    sectionSubmission: 'Va\u0161e odesl\u00e1n\u00ed',
    sectionSubmissionPlain: '--- VA\u0160E ODESL\u00c1N\u00cd ---',
    labelService: 'Slu\u017eba',
    labelCompany: 'Spole\u010dnost',
    notFilled: 'Nevypln\u011bno',
    sectionMessage: 'Va\u0161e zpr\u00e1va',
    from: (name: string) => `Od ${name}`,
    footerAuto: 'Toto je automatick\u00e9 potvrzen\u00ed. Na tento e-mail pros\u00edm neodpov\u00eddejte.',
    footerUrgent: 'V nal\u00e9hav\u00fdch p\u0159\u00edpadech n\u00e1s kontaktujte na',
    thanks: 'D\u011bkujeme, \u017ee jste n\u00e1s kontaktovali. Va\u0161i zpr\u00e1vu prostudujeme a ozveme se v\u00e1m do 24 hodin.',
    whatsNext: 'Co se stane d\u00e1le:',
    plain1: '1. N\u00e1\u0161 t\u00fdm prostuduje v\u00e1\u0161 dotaz',
    plain2: '2. Odpov\u00edme do 24 hodin (pracovn\u00ed dny)',
    plain3: '3. Domluv\u00edme \u00favodn\u00ed hovor k definici rozsahu a dal\u0161\u00edch krok\u016f',
    automated: 'Toto je automatick\u00e9 potvrzen\u00ed. Na tento e-mail pros\u00edm neodpov\u00eddejte.',
    urgent: 'V nal\u00e9hav\u00fdch p\u0159\u00edpadech n\u00e1s kontaktujte na hello@jvm-solutions.dev',
  },
  sk: {
    subject: 'Va\u0161a spr\u00e1va bola prijat\u00e1 \u2014 JVM Solutions',
    title: 'Va\u0161a spr\u00e1va bola prijat\u00e1',
    greeting: (name: string) => `Dobr\u00fd de\u0148, <strong style='color:#A78BFA;'>${name}</strong>, \u010fakujeme za kontakt.`,
    greetingPlain: (name: string) => `Dobr\u00fd de\u0148, ${name},`,
    intro: `Va\u0161u spr\u00e1vu preskum\u00e1me a ozveme sa v\u00e1m do&nbsp;<strong style='color:#F1F5F9;'>24 hod\u00edn</strong>.`,
    sectionNext: '\u010co sa stane \u010falej',
    step1title: 'N\u00e1\u0161 t\u00edm preskum\u00e1 va\u0161u po\u017eiadavku',
    step1desc: 'Ka\u017ed\u00fa spr\u00e1vu starostlivo \u010d\u00eddame pred odpove\u010fou.',
    step2title: 'Odpovieme do 24 hod\u00edn',
    step2desc: 'Pracovn\u00e9 dni \u2014 zvy\u010dajne ove\u013ea r\u00fdchlej\u0161ie.',
    step3title: 'Dohodneme \u00favodn\u00fd hovor',
    step3desc: 'Spolo\u010dne definujeme rozsah, harmonogram a \u010fal\u0161ie kroky.',
    sectionSubmission: 'Va\u0161e odoslanie',
    sectionSubmissionPlain: '--- VA\u0160E ODOSLANIE ---',
    labelService: 'Slu\u017eba',
    labelCompany: 'Spolo\u010dnos\u0165',
    notFilled: 'Nevypln\u00e9n\u00e9',
    sectionMessage: 'Va\u0161a spr\u00e1va',
    from: (name: string) => `Od ${name}`,
    footerAuto: 'Toto je automatick\u00e9 potvrden\u00e9. Na tento e-mail pros\u00edm neodpovedajte.',
    footerUrgent: 'V naliehav\u00fdch pr\u00edpadoch n\u00e1s kontaktujte na',
    thanks: '\u010fakujeme, \u017ee ste n\u00e1s kontaktovali. Va\u0161u spr\u00e1vu preskum\u00e1me a ozveme sa v\u00e1m do 24 hod\u00edn.',
    whatsNext: '\u010co sa stane \u010falej:',
    plain1: '1. N\u00e1\u0161 t\u00edm preskum\u00e1 va\u0161u po\u017eiadavku',
    plain2: '2. Odpovieme do 24 hod\u00edn (pracovn\u00e9 dni)',
    plain3: '3. Dohodneme \u00favodn\u00fd hovor k defin\u00edcii rozsahu a \u010fal\u0161\u00edch krokov',
    automated: 'Toto je automatick\u00e9 potvrden\u00e9. Na tento e-mail pros\u00edm neodpovedajte.',
    urgent: 'V naliehav\u00fdch pr\u00edpadoch n\u00e1s kontaktujte na hello@jvm-solutions.dev',
  },
  uk: {
    subject: '\u0412\u0430\u0448\u0435 \u043f\u043e\u0432\u0456\u0434\u043e\u043c\u043b\u0435\u043d\u043d\u044f \u043e\u0442\u0440\u0438\u043c\u0430\u043d\u043e \u2014 JVM Solutions',
    title: '\u0412\u0430\u0448\u0435 \u043f\u043e\u0432\u0456\u0434\u043e\u043c\u043b\u0435\u043d\u043d\u044f \u043e\u0442\u0440\u0438\u043c\u0430\u043d\u043e',
    greeting: (name: string) => `\u041f\u0440\u0438\u0432\u0456\u0442, <strong style='color:#A78BFA;'>${name}</strong>, \u0434\u044f\u043a\u0443\u0454\u043c\u043e \u0437\u0430 \u0437\u0432\u0435\u0440\u043d\u0435\u043d\u043d\u044f.`,
    greetingPlain: (name: string) => `\u041f\u0440\u0438\u0432\u0456\u0442, ${name},`,
    intro: `\u041c\u0438 \u0440\u043e\u0437\u0433\u043b\u044f\u043d\u0435\u043c\u043e \u0432\u0430\u0448 \u0437\u0430\u043f\u0438\u0442 \u0456 \u0437\u0432'\u044f\u0436\u0435\u043c\u043e\u0441\u044f \u0437 \u0432\u0430\u043c\u0438 \u043f\u0440\u043e\u0442\u044f\u0433\u043e\u043c&nbsp;<strong style='color:#F1F5F9;'>24 \u0433\u043e\u0434\u0438\u043d</strong>.`,
    sectionNext: '\u0429\u043e \u0431\u0443\u0434\u0435 \u0434\u0430\u043b\u0456',
    step1title: '\u041d\u0430\u0448\u0430 \u043a\u043e\u043c\u0430\u043d\u0434\u0430 \u0440\u043e\u0437\u0433\u043b\u044f\u0434\u0430\u0454 \u0432\u0430\u0448 \u0437\u0430\u043f\u0438\u0442',
    step1desc: '\u041c\u0438 \u0443\u0432\u0430\u0436\u043d\u043e \u0447\u0438\u0442\u0430\u0454\u043c\u043e \u043a\u043e\u0436\u043d\u0435 \u043f\u043e\u0432\u0456\u0434\u043e\u043c\u043b\u0435\u043d\u043d\u044f \u043f\u0435\u0440\u0435\u0434 \u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u0434\u044e.',
    step2title: '\u0412\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u0430\u0454\u043c\u043e \u043f\u0440\u043e\u0442\u044f\u0433\u043e\u043c 24 \u0433\u043e\u0434\u0438\u043d',
    step2desc: '\u0423 \u0440\u043e\u0431\u043e\u0447\u0456 \u0434\u043d\u0456 \u2014 \u0437\u0430\u0437\u0432\u0438\u0447\u0430\u0439 \u043d\u0430\u0431\u0430\u0433\u0430\u0442\u043e \u0448\u0432\u0438\u0434\u0448\u0435.',
    step3title: '\u041f\u0440\u0438\u0437\u043d\u0430\u0447\u0430\u0454\u043c\u043e \u043e\u0437\u043d\u0430\u0439\u043e\u043c\u0447\u0438\u0439 \u0434\u0437\u0432\u0456\u043d\u043e\u043a',
    step3desc: '\u0429\u043e\u0431 \u0440\u0430\u0437\u043e\u043c \u0432\u0438\u0437\u043d\u0430\u0447\u0438\u0442\u0438 \u043e\u0431\u0441\u044f\u0433, \u0442\u0435\u0440\u043c\u0456\u043d\u0438 \u0442\u0430 \u043d\u0430\u0441\u0442\u0443\u043f\u043d\u0456 \u043a\u0440\u043e\u043a\u0438.',
    sectionSubmission: '\u0412\u0430\u0448\u0430 \u0437\u0430\u044f\u0432\u043a\u0430',
    sectionSubmissionPlain: '--- \u0412\u0410\u0428\u0410 \u0417\u0410\u042f\u0412\u041a\u0410 ---',
    labelService: '\u041f\u043e\u0441\u043b\u0443\u0433\u0430',
    labelCompany: '\u041a\u043e\u043c\u043f\u0430\u043d\u0456\u044f',
    notFilled: '\u041d\u0435 \u0432\u043a\u0430\u0437\u0430\u043d\u043e',
    sectionMessage: '\u0412\u0430\u0448\u0435 \u043f\u043e\u0432\u0456\u0434\u043e\u043c\u043b\u0435\u043d\u043d\u044f',
    from: (name: string) => `\u0412\u0456\u0434 ${name}`,
    footerAuto: '\u0426\u0435 \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u043d\u0435 \u043f\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0436\u0435\u043d\u043d\u044f. \u0411\u0443\u0434\u044c \u043b\u0430\u0441\u043a\u0430, \u043d\u0435 \u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u0430\u0439\u0442\u0435 \u043d\u0430 \u0446\u0435\u0439 \u043b\u0438\u0441\u0442.',
    footerUrgent: '\u0417 \u0442\u0435\u0440\u043c\u0456\u043d\u043e\u0432\u0438\u0445 \u043f\u0438\u0442\u0430\u043d\u044c \u0437\u0432\u0435\u0440\u0442\u0430\u0439\u0442\u0435\u0441\u044c \u0434\u043e \u043d\u0430\u0441 \u043d\u0430',
    thanks: "\u0414\u044f\u043a\u0443\u0454\u043c\u043e, \u0449\u043e \u0437\u0432'\u044f\u0437\u0430\u043b\u0438\u0441\u044f \u0437 JVM Solutions. \u041c\u0438 \u0440\u043e\u0437\u0433\u043b\u044f\u043d\u0435\u043c\u043e \u0432\u0430\u0448 \u0437\u0430\u043f\u0438\u0442 \u0456 \u0437\u0432'\u044f\u0436\u0435\u043c\u043e\u0441\u044f \u0437 \u0432\u0430\u043c\u0438 \u043f\u0440\u043e\u0442\u044f\u0433\u043e\u043c 24 \u0433\u043e\u0434\u0438\u043d.",
    whatsNext: '\u0429\u043e \u0431\u0443\u0434\u0435 \u0434\u0430\u043b\u0456:',
    plain1: '1. \u041d\u0430\u0448\u0430 \u043a\u043e\u043c\u0430\u043d\u0434\u0430 \u0440\u043e\u0437\u0433\u043b\u044f\u0434\u0430\u0454 \u0432\u0430\u0448 \u0437\u0430\u043f\u0438\u0442',
    plain2: '2. \u0412\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u0430\u0454\u043c\u043e \u043f\u0440\u043e\u0442\u044f\u0433\u043e\u043c 24 \u0433\u043e\u0434\u0438\u043d (\u0440\u043e\u0431\u043e\u0447\u0456 \u0434\u043d\u0456)',
    plain3: '3. \u041f\u0440\u0438\u0437\u043d\u0430\u0447\u0430\u0454\u043c\u043e \u043e\u0437\u043d\u0430\u0439\u043e\u043c\u0447\u0438\u0439 \u0434\u0437\u0432\u0456\u043d\u043e\u043a \u0434\u043b\u044f \u0432\u0438\u0437\u043d\u0430\u0447\u0435\u043d\u043d\u044f \u043e\u0431\u0441\u044f\u0433\u0443 \u0442\u0430 \u043d\u0430\u0441\u0442\u0443\u043f\u043d\u0438\u0445 \u043a\u0440\u043e\u043a\u0456\u0432',
    automated: '\u0426\u0435 \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u043d\u0435 \u043f\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0436\u0435\u043d\u043d\u044f. \u0411\u0443\u0434\u044c \u043b\u0430\u0441\u043a\u0430, \u043d\u0435 \u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u0430\u0439\u0442\u0435 \u043d\u0430 \u0446\u0435\u0439 \u043b\u0438\u0441\u0442.',
    urgent: '\u0417 \u0442\u0435\u0440\u043c\u0456\u043d\u043e\u0432\u0438\u0445 \u043f\u0438\u0442\u0430\u043d\u044c \u0437\u0432\u0435\u0440\u0442\u0430\u0439\u0442\u0435\u0441\u044c \u0434\u043e \u043d\u0430\u0441 \u043d\u0430 hello@jvm-solutions.dev',
  },
};

export function confirmationSubject(lang: string): string {
  return (I18N[lang as keyof typeof I18N] ?? I18N.en).subject;
}

export function confirmationHtml(d: ConfirmationData): string {
  const t = I18N[d.lang as keyof typeof I18N] ?? I18N.en;
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
                ${t.title}
              </h1>
              <p style="margin:0;font-size:15px;color:#94A3B8;line-height:1.6;">
                ${t.greeting(d.safeName)}<br>
                ${t.intro}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#13131A;padding:0 40px 32px;">

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #1E1E2E;margin:0 0 32px;">

              <!-- What happens next -->
              <p style="margin:0 0 20px;font-size:11px;font-weight:600;letter-spacing:2px;color:#64748B;text-transform:uppercase;">${t.sectionNext}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="padding:0 0 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="46" style="width:46px;vertical-align:top;padding-top:2px;">
                          <div style="width:32px;height:32px;background:rgba(139,92,246,0.12);border:1.5px solid rgba(139,92,246,0.35);border-radius:50%;text-align:center;line-height:32px;font-size:13px;font-weight:700;color:#8B5CF6;font-family:'Space Grotesk',system-ui,sans-serif;">1</div>
                        </td>
                        <td style="font-size:14px;color:#94A3B8;line-height:1.6;">
                          <strong style="color:#F1F5F9;font-family:'Space Grotesk',system-ui,sans-serif;">${t.step1title}</strong><br>
                          ${t.step1desc}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="46" style="width:46px;vertical-align:top;padding-top:2px;">
                          <div style="width:32px;height:32px;background:rgba(139,92,246,0.12);border:1.5px solid rgba(139,92,246,0.35);border-radius:50%;text-align:center;line-height:32px;font-size:13px;font-weight:700;color:#8B5CF6;font-family:'Space Grotesk',system-ui,sans-serif;">2</div>
                        </td>
                        <td style="font-size:14px;color:#94A3B8;line-height:1.6;">
                          <strong style="color:#F1F5F9;font-family:'Space Grotesk',system-ui,sans-serif;">${t.step2title}</strong><br>
                          ${t.step2desc}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="46" style="width:46px;vertical-align:top;padding-top:2px;">
                          <div style="width:32px;height:32px;background:rgba(139,92,246,0.12);border:1.5px solid rgba(139,92,246,0.35);border-radius:50%;text-align:center;line-height:32px;font-size:13px;font-weight:700;color:#8B5CF6;font-family:'Space Grotesk',system-ui,sans-serif;">3</div>
                        </td>
                        <td style="font-size:14px;color:#94A3B8;line-height:1.6;">
                          <strong style="color:#F1F5F9;font-family:'Space Grotesk',system-ui,sans-serif;">${t.step3title}</strong><br>
                          ${t.step3desc}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #1E1E2E;margin:0 0 32px;">

              <!-- Submitted specs -->
              <p style="margin:0 0 16px;font-size:11px;font-weight:600;letter-spacing:2px;color:#64748B;text-transform:uppercase;">${t.sectionSubmission}</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="background:#1A1A24;border:1px solid #1E1E2E;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="90" style="font-size:11px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:1.5px;padding-bottom:16px;vertical-align:top;padding-top:2px;">${t.labelService}</td>
                        <td style="font-size:14px;color:#F1F5F9;padding-bottom:16px;">${d.safeService}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 20px 0;border-top:1px solid #1E1E2E;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="90" style="font-size:11px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:1.5px;padding:16px 0;vertical-align:top;padding-top:18px;">Company</td>
                        <td style="font-size:14px;${d.safeCompany !== '—' ? 'color:#F1F5F9' : 'color:#475569;font-style:italic'};padding:16px 0;padding-top:18px;">${d.safeCompany !== '—' ? d.safeCompany : t.notFilled}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message recap -->
              <p style="margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:2px;color:#64748B;text-transform:uppercase;">${t.sectionMessage}</p>
              <div style="background:#1A1A24;border:1px solid #1E1E2E;border-left:3px solid #8B5CF6;border-radius:0 8px 8px 0;padding:20px 24px;">
                <p style="margin:0 0 10px;font-size:11px;font-weight:600;letter-spacing:1.5px;color:#475569;text-transform:uppercase;font-family:'Space Grotesk',system-ui,sans-serif;">${t.from(d.safeName)}</p>
                <p style="margin:0;font-size:14px;color:#94A3B8;line-height:1.8;">${d.safeMessage}</p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#09090F;border-top:1px solid #1E1E2E;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:#64748B;line-height:1.6;">
                ${t.footerAuto}<br>
                ${t.footerUrgent}
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
  const t = I18N[d.lang as keyof typeof I18N] ?? I18N.en;
  const companyLabel = `${t.labelCompany}: ${d.rawCompany !== '—' ? d.rawCompany : t.notFilled}`;
  return [
    t.greetingPlain(d.rawName),
    '',
    t.thanks,
    '',
    t.sectionSubmissionPlain,
    `${t.labelService}: ${d.rawService}`,
    companyLabel,
    '',
    `${t.sectionMessage}:`,
    d.rawMessage,
    '',
    '----------------------',
    '',
    t.whatsNext,
    t.plain1,
    t.plain2,
    t.plain3,
    '',
    t.automated,
    t.urgent,
    '',
    'JVM Solutions — https://jvm-solutions.dev',
  ].join('\n');
}
