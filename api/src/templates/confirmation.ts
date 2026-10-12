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

// Light palette — email clients render best on white, and the customer reads
// this in their own inbox, not on our dark site. Orange is the site's
// $accent-light (AA on white); the logo is a PNG because Gmail/Outlook drop SVG.
const SITE = 'https://jvm-yore.com';
const LOGO_URL = `${SITE}/images/email-logo.png`;
const INK = '#18181B';
const TEXT = '#3F3F46';
const MUTED = '#66666E';
const LINE = '#E4E4E7';
const ACCENT = '#C33E00';
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

const I18N = {
  en: {
    subject: "We've received your message \u2014 JVM Yore",
    title: "We've received your message",
    greeting: (name: string) => `Hi <strong style='color:${INK};font-weight:600;'>${name}</strong>, thanks for reaching out.`,
    greetingPlain: (name: string) => `Hi ${name},`,
    intro: `We'll review your enquiry and get back to you within&nbsp;<strong style='color:${INK};font-weight:600;'>24 hours</strong>.`,
    sectionNext: 'What happens next',
    step1title: 'Our team reviews your enquiry',
    step1desc: 'We read every message carefully before responding.',
    step2title: 'We reply within 24 hours',
    step2desc: 'On business days \u2014 usually much faster.',
    step3title: 'We schedule a discovery call',
    step3desc: 'To define scope, timeline, and next steps together.',
    sectionSubmissionPlain: '--- YOUR SUBMISSION ---',
    labelService: 'Service',
    labelCompany: 'Company',
    notFilled: 'Not filled',
    sectionMessage: 'Your message',
    footerAuto: 'This is an automated confirmation. Please do not reply to this email.',
    footerUrgent: 'For urgent matters reach us at',
    thanks: "Thank you for reaching out to JVM Yore. We've received your enquiry and will get back to you within 24 hours.",
    whatsNext: 'What happens next:',
    plain1: '1. Our team reviews your enquiry',
    plain2: '2. We reply within 24 hours (business days)',
    plain3: '3. We schedule a discovery call to define scope and next steps',
    automated: 'This is an automated confirmation. Please do not reply to this email.',
    urgent: 'For urgent matters contact us at hello@jvm-yore.com',
  },
  cs: {
    subject: 'P\u0159ijali jsme va\u0161i zpr\u00e1vu \u2014 JVM Yore',
    title: 'P\u0159ijali jsme va\u0161i zpr\u00e1vu',
    greeting: (name: string) => `Dobr\u00fd den, <strong style='color:${INK};font-weight:600;'>${name}</strong>, d\u011bkujeme za kontakt.`,
    greetingPlain: (name: string) => `Dobr\u00fd den, ${name},`,
    intro: `Va\u0161i zpr\u00e1vu prostudujeme a ozveme se v\u00e1m do&nbsp;<strong style='color:${INK};font-weight:600;'>24 hodin</strong>.`,
    sectionNext: 'Co se stane d\u00e1le',
    step1title: 'N\u00e1\u0161 t\u00fdm prostuduje v\u00e1\u0161 dotaz',
    step1desc: 'Ka\u017edou zpr\u00e1vu pe\u010dliv\u011b \u010dteme, ne\u017e odpov\u00edme.',
    step2title: 'Odpov\u00edme do 24 hodin',
    step2desc: 'V pracovn\u00ed dny \u2014 obvykle mnohem rychleji.',
    step3title: 'Domluv\u00edme \u00favodn\u00ed hovor',
    step3desc: 'Spole\u010dn\u011b definujeme rozsah, harmonogram a dal\u0161\u00ed kroky.',
    sectionSubmissionPlain: '--- VA\u0160E ODESL\u00c1N\u00cd ---',
    labelService: 'Slu\u017eba',
    labelCompany: 'Spole\u010dnost',
    notFilled: 'Nevypln\u011bno',
    sectionMessage: 'Va\u0161e zpr\u00e1va',
    footerAuto: 'Toto je automatick\u00e9 potvrzen\u00ed. Na tento e-mail pros\u00edm neodpov\u00eddejte.',
    footerUrgent: 'V nal\u00e9hav\u00fdch p\u0159\u00edpadech n\u00e1s kontaktujte na',
    thanks: 'D\u011bkujeme, \u017ee jste n\u00e1s kontaktovali. Va\u0161i zpr\u00e1vu prostudujeme a ozveme se v\u00e1m do 24 hodin.',
    whatsNext: 'Co se stane d\u00e1le:',
    plain1: '1. N\u00e1\u0161 t\u00fdm prostuduje v\u00e1\u0161 dotaz',
    plain2: '2. Odpov\u00edme do 24 hodin (pracovn\u00ed dny)',
    plain3: '3. Domluv\u00edme \u00favodn\u00ed hovor k definici rozsahu a dal\u0161\u00edch krok\u016f',
    automated: 'Toto je automatick\u00e9 potvrzen\u00ed. Na tento e-mail pros\u00edm neodpov\u00eddejte.',
    urgent: 'V nal\u00e9hav\u00fdch p\u0159\u00edpadech n\u00e1s kontaktujte na hello@jvm-yore.com',
  },
  sk: {
    subject: 'Va\u0161a spr\u00e1va bola prijat\u00e1 \u2014 JVM Yore',
    title: 'Va\u0161a spr\u00e1va bola prijat\u00e1',
    greeting: (name: string) => `Dobr\u00fd de\u0148, <strong style='color:${INK};font-weight:600;'>${name}</strong>, \u010fakujeme za kontakt.`,
    greetingPlain: (name: string) => `Dobr\u00fd de\u0148, ${name},`,
    intro: `Va\u0161u spr\u00e1vu preskum\u00e1me a ozveme sa v\u00e1m do&nbsp;<strong style='color:${INK};font-weight:600;'>24 hod\u00edn</strong>.`,
    sectionNext: '\u010co sa stane \u010falej',
    step1title: 'N\u00e1\u0161 t\u00edm preskum\u00e1 va\u0161u po\u017eiadavku',
    step1desc: 'Ka\u017ed\u00fa spr\u00e1vu starostlivo \u010d\u00eddame pred odpove\u010fou.',
    step2title: 'Odpovieme do 24 hod\u00edn',
    step2desc: 'Pracovn\u00e9 dni \u2014 zvy\u010dajne ove\u013ea r\u00fdchlej\u0161ie.',
    step3title: 'Dohodneme \u00favodn\u00fd hovor',
    step3desc: 'Spolo\u010dne definujeme rozsah, harmonogram a \u010fal\u0161ie kroky.',
    sectionSubmissionPlain: '--- VA\u0160E ODOSLANIE ---',
    labelService: 'Slu\u017eba',
    labelCompany: 'Spolo\u010dnos\u0165',
    notFilled: 'Nevypln\u00e9n\u00e9',
    sectionMessage: 'Va\u0161a spr\u00e1va',
    footerAuto: 'Toto je automatick\u00e9 potvrden\u00e9. Na tento e-mail pros\u00edm neodpovedajte.',
    footerUrgent: 'V naliehav\u00fdch pr\u00edpadoch n\u00e1s kontaktujte na',
    thanks: '\u010fakujeme, \u017ee ste n\u00e1s kontaktovali. Va\u0161u spr\u00e1vu preskum\u00e1me a ozveme sa v\u00e1m do 24 hod\u00edn.',
    whatsNext: '\u010co sa stane \u010falej:',
    plain1: '1. N\u00e1\u0161 t\u00edm preskum\u00e1 va\u0161u po\u017eiadavku',
    plain2: '2. Odpovieme do 24 hod\u00edn (pracovn\u00e9 dni)',
    plain3: '3. Dohodneme \u00favodn\u00fd hovor k defin\u00edcii rozsahu a \u010fal\u0161\u00edch krokov',
    automated: 'Toto je automatick\u00e9 potvrden\u00e9. Na tento e-mail pros\u00edm neodpovedajte.',
    urgent: 'V naliehav\u00fdch pr\u00edpadoch n\u00e1s kontaktujte na hello@jvm-yore.com',
  },
  uk: {
    subject: '\u0412\u0430\u0448\u0435 \u043f\u043e\u0432\u0456\u0434\u043e\u043c\u043b\u0435\u043d\u043d\u044f \u043e\u0442\u0440\u0438\u043c\u0430\u043d\u043e \u2014 JVM Yore',
    title: '\u0412\u0430\u0448\u0435 \u043f\u043e\u0432\u0456\u0434\u043e\u043c\u043b\u0435\u043d\u043d\u044f \u043e\u0442\u0440\u0438\u043c\u0430\u043d\u043e',
    greeting: (name: string) => `\u041f\u0440\u0438\u0432\u0456\u0442, <strong style='color:${INK};font-weight:600;'>${name}</strong>, \u0434\u044f\u043a\u0443\u0454\u043c\u043e \u0437\u0430 \u0437\u0432\u0435\u0440\u043d\u0435\u043d\u043d\u044f.`,
    greetingPlain: (name: string) => `\u041f\u0440\u0438\u0432\u0456\u0442, ${name},`,
    intro: `\u041c\u0438 \u0440\u043e\u0437\u0433\u043b\u044f\u043d\u0435\u043c\u043e \u0432\u0430\u0448 \u0437\u0430\u043f\u0438\u0442 \u0456 \u0437\u0432'\u044f\u0436\u0435\u043c\u043e\u0441\u044f \u0437 \u0432\u0430\u043c\u0438 \u043f\u0440\u043e\u0442\u044f\u0433\u043e\u043c&nbsp;<strong style='color:${INK};font-weight:600;'>24 \u0433\u043e\u0434\u0438\u043d</strong>.`,
    sectionNext: '\u0429\u043e \u0431\u0443\u0434\u0435 \u0434\u0430\u043b\u0456',
    step1title: '\u041d\u0430\u0448\u0430 \u043a\u043e\u043c\u0430\u043d\u0434\u0430 \u0440\u043e\u0437\u0433\u043b\u044f\u0434\u0430\u0454 \u0432\u0430\u0448 \u0437\u0430\u043f\u0438\u0442',
    step1desc: '\u041c\u0438 \u0443\u0432\u0430\u0436\u043d\u043e \u0447\u0438\u0442\u0430\u0454\u043c\u043e \u043a\u043e\u0436\u043d\u0435 \u043f\u043e\u0432\u0456\u0434\u043e\u043c\u043b\u0435\u043d\u043d\u044f \u043f\u0435\u0440\u0435\u0434 \u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u0434\u044e.',
    step2title: '\u0412\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u0430\u0454\u043c\u043e \u043f\u0440\u043e\u0442\u044f\u0433\u043e\u043c 24 \u0433\u043e\u0434\u0438\u043d',
    step2desc: '\u0423 \u0440\u043e\u0431\u043e\u0447\u0456 \u0434\u043d\u0456 \u2014 \u0437\u0430\u0437\u0432\u0438\u0447\u0430\u0439 \u043d\u0430\u0431\u0430\u0433\u0430\u0442\u043e \u0448\u0432\u0438\u0434\u0448\u0435.',
    step3title: '\u041f\u0440\u0438\u0437\u043d\u0430\u0447\u0430\u0454\u043c\u043e \u043e\u0437\u043d\u0430\u0439\u043e\u043c\u0447\u0438\u0439 \u0434\u0437\u0432\u0456\u043d\u043e\u043a',
    step3desc: '\u0429\u043e\u0431 \u0440\u0430\u0437\u043e\u043c \u0432\u0438\u0437\u043d\u0430\u0447\u0438\u0442\u0438 \u043e\u0431\u0441\u044f\u0433, \u0442\u0435\u0440\u043c\u0456\u043d\u0438 \u0442\u0430 \u043d\u0430\u0441\u0442\u0443\u043f\u043d\u0456 \u043a\u0440\u043e\u043a\u0438.',
    sectionSubmissionPlain: '--- \u0412\u0410\u0428\u0410 \u0417\u0410\u042f\u0412\u041a\u0410 ---',
    labelService: '\u041f\u043e\u0441\u043b\u0443\u0433\u0430',
    labelCompany: '\u041a\u043e\u043c\u043f\u0430\u043d\u0456\u044f',
    notFilled: '\u041d\u0435 \u0432\u043a\u0430\u0437\u0430\u043d\u043e',
    sectionMessage: '\u0412\u0430\u0448\u0435 \u043f\u043e\u0432\u0456\u0434\u043e\u043c\u043b\u0435\u043d\u043d\u044f',
    footerAuto: '\u0426\u0435 \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u043d\u0435 \u043f\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0436\u0435\u043d\u043d\u044f. \u0411\u0443\u0434\u044c \u043b\u0430\u0441\u043a\u0430, \u043d\u0435 \u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u0430\u0439\u0442\u0435 \u043d\u0430 \u0446\u0435\u0439 \u043b\u0438\u0441\u0442.',
    footerUrgent: '\u0417 \u0442\u0435\u0440\u043c\u0456\u043d\u043e\u0432\u0438\u0445 \u043f\u0438\u0442\u0430\u043d\u044c \u0437\u0432\u0435\u0440\u0442\u0430\u0439\u0442\u0435\u0441\u044c \u0434\u043e \u043d\u0430\u0441 \u043d\u0430',
    thanks: "\u0414\u044f\u043a\u0443\u0454\u043c\u043e, \u0449\u043e \u0437\u0432'\u044f\u0437\u0430\u043b\u0438\u0441\u044f \u0437 JVM Yore. \u041c\u0438 \u0440\u043e\u0437\u0433\u043b\u044f\u043d\u0435\u043c\u043e \u0432\u0430\u0448 \u0437\u0430\u043f\u0438\u0442 \u0456 \u0437\u0432'\u044f\u0436\u0435\u043c\u043e\u0441\u044f \u0437 \u0432\u0430\u043c\u0438 \u043f\u0440\u043e\u0442\u044f\u0433\u043e\u043c 24 \u0433\u043e\u0434\u0438\u043d.",
    whatsNext: '\u0429\u043e \u0431\u0443\u0434\u0435 \u0434\u0430\u043b\u0456:',
    plain1: '1. \u041d\u0430\u0448\u0430 \u043a\u043e\u043c\u0430\u043d\u0434\u0430 \u0440\u043e\u0437\u0433\u043b\u044f\u0434\u0430\u0454 \u0432\u0430\u0448 \u0437\u0430\u043f\u0438\u0442',
    plain2: '2. \u0412\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u0430\u0454\u043c\u043e \u043f\u0440\u043e\u0442\u044f\u0433\u043e\u043c 24 \u0433\u043e\u0434\u0438\u043d (\u0440\u043e\u0431\u043e\u0447\u0456 \u0434\u043d\u0456)',
    plain3: '3. \u041f\u0440\u0438\u0437\u043d\u0430\u0447\u0430\u0454\u043c\u043e \u043e\u0437\u043d\u0430\u0439\u043e\u043c\u0447\u0438\u0439 \u0434\u0437\u0432\u0456\u043d\u043e\u043a \u0434\u043b\u044f \u0432\u0438\u0437\u043d\u0430\u0447\u0435\u043d\u043d\u044f \u043e\u0431\u0441\u044f\u0433\u0443 \u0442\u0430 \u043d\u0430\u0441\u0442\u0443\u043f\u043d\u0438\u0445 \u043a\u0440\u043e\u043a\u0456\u0432',
    automated: '\u0426\u0435 \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u043d\u0435 \u043f\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0436\u0435\u043d\u043d\u044f. \u0411\u0443\u0434\u044c \u043b\u0430\u0441\u043a\u0430, \u043d\u0435 \u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u0430\u0439\u0442\u0435 \u043d\u0430 \u0446\u0435\u0439 \u043b\u0438\u0441\u0442.',
    urgent: '\u0417 \u0442\u0435\u0440\u043c\u0456\u043d\u043e\u0432\u0438\u0445 \u043f\u0438\u0442\u0430\u043d\u044c \u0437\u0432\u0435\u0440\u0442\u0430\u0439\u0442\u0435\u0441\u044c \u0434\u043e \u043d\u0430\u0441 \u043d\u0430 hello@jvm-yore.com',
  },
};

export function confirmationSubject(lang: string): string {
  return (I18N[lang as keyof typeof I18N] ?? I18N.en).subject;
}

export function confirmationHtml(d: ConfirmationData): string {
  const t = I18N[d.lang as keyof typeof I18N] ?? I18N.en;
  const hasCompany = d.safeCompany !== '—';
  const steps = [
    [t.step1title, t.step1desc],
    [t.step2title, t.step2desc],
    [t.step3title, t.step3desc],
  ].map(([title, desc], i) => `
                <tr>
                  <td width="36" style="width:36px;vertical-align:top;padding:0 0 16px;">
                    <div style="width:24px;height:24px;border-radius:12px;background:#FFF1E8;color:${ACCENT};font-size:12px;font-weight:600;line-height:24px;text-align:center;">${i + 1}</div>
                  </td>
                  <td style="vertical-align:top;padding:2px 0 16px;font-size:14px;line-height:1.5;color:${MUTED};">
                    <span style="color:${INK};font-weight:600;">${title}</span><br>${desc}
                  </td>
                </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="${d.lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>${t.subject}</title>
  <style>
    :root { color-scheme: light only; }
    @media (max-width: 520px) { .pad { padding-left: 24px !important; padding-right: 24px !important; } }
  </style>
</head>
<body style="margin:0;padding:0;background:#F4F4F5;font-family:${FONT};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${t.thanks}</div>
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
          </tr>
          <tr>
            <td class="pad" style="padding:28px 40px 0;">
              <h1 style="margin:0 0 12px;font-size:24px;line-height:1.3;font-weight:700;letter-spacing:-0.2px;color:${INK};">${t.title}</h1>
              <p style="margin:0;font-size:15px;line-height:1.6;color:${TEXT};">
                ${t.greeting(d.safeName)}<br>
                ${t.intro}
              </p>
            </td>
          </tr>
          <tr>
            <td class="pad" style="padding:32px 40px 0;">
              <p style="margin:0 0 16px;font-size:13px;font-weight:600;color:${INK};">${t.sectionNext}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${steps}
              </table>
            </td>
          </tr>
          <tr>
            <td class="pad" style="padding:16px 40px 40px;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:${INK};">${t.sectionMessage}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="background:#FAFAFA;border:1px solid ${LINE};border-radius:8px;">
                <tr>
                  <td style="padding:16px 20px 0;font-size:14px;line-height:1.5;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="110" style="width:110px;padding:0 12px 8px 0;vertical-align:top;color:${MUTED};">${t.labelService}</td>
                        <td style="padding:0 0 8px;vertical-align:top;color:${INK};">${d.safeService}</td>
                      </tr>
                      <tr>
                        <td width="110" style="width:110px;padding:0 12px 16px 0;vertical-align:top;color:${MUTED};">${t.labelCompany}</td>
                        <td style="padding:0 0 16px;vertical-align:top;color:${hasCompany ? INK : MUTED};">${hasCompany ? d.safeCompany : t.notFilled}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;border-top:1px solid ${LINE};font-size:14px;line-height:1.7;color:${TEXT};">${d.safeMessage}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
          <tr>
            <td class="pad" style="padding:24px 40px 0;font-size:12px;line-height:1.6;color:${MUTED};text-align:center;">
              ${t.footerAuto}<br>
              ${t.footerUrgent} <a href="mailto:hello@jvm-yore.com" style="color:${ACCENT};text-decoration:none;">hello@jvm-yore.com</a>
              <br><br>
              &copy; ${new Date().getFullYear()} JVM Yore &middot; <a href="${SITE}" style="color:${MUTED};text-decoration:underline;">jvm-yore.com</a>
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
    'JVM Yore — https://jvm-yore.com',
  ].join('\n');
}
