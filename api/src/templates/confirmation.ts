import { ACCENT, INK, LINE, MUTED, SITE, TEXT, emailLayout } from './theme';

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

const strong = (text: string) => `<strong style="color:${INK};font-weight:600;">${text}</strong>`;

const I18N = {
  en: {
    subject: "We've received your message \u2014 JVM Yore",
    title: "We've received your message",
    greeting: (name: string) => `Hi ${name},`,
    greetingPlain: (name: string) => `Hi ${name},`,
    intro: `Thanks for getting in touch. We'll get back to you within&nbsp;${strong('24 hours')}.`,
    sectionNext: 'What happens next',
    step1title: 'We read your message',
    step1desc: 'One of us goes through it personally.',
    step2title: 'We get back to you',
    step2desc: 'Within 24 hours on business days, usually sooner.',
    step3title: 'We set up a short call',
    step3desc: 'To talk through scope, timeline and next steps.',
    sectionSubmissionPlain: '--- SUMMARY ---',
    labelService: 'Service',
    labelCompany: 'Company',
    notFilled: 'Not provided',
    sectionMessage: 'Your message',
    footerAuto: "This is an automated message, please don't reply to it.",
    footerUrgent: 'In a hurry? Write to us at',
    thanks: "Thanks for getting in touch. We'll get back to you within 24 hours.",
    whatsNext: 'What happens next:',
    plain1: '1. We read your message',
    plain2: '2. We get back to you within 24 hours (business days)',
    plain3: '3. We set up a short call about scope, timeline and next steps',
    automated: "This is an automated message, please don't reply to it.",
    urgent: 'In a hurry? Write to us at hello@jvm-yore.com',
  },
  cs: {
    subject: 'P\u0159ijali jsme Va\u0161i zpr\u00e1vu \u2014 JVM Yore',
    title: 'P\u0159ijali jsme Va\u0161i zpr\u00e1vu',
    greeting: (name: string) => `Dobr\u00fd den, ${name},`,
    greetingPlain: (name: string) => `Dobr\u00fd den, ${name},`,
    intro: `d\u011bkujeme, \u017ee jste n\u00e1m napsali. Ozveme se V\u00e1m nejpozd\u011bji do&nbsp;${strong('24 hodin')}.`,
    sectionNext: 'Co bude d\u00e1l',
    step1title: 'Projdeme si Va\u0161i zpr\u00e1vu',
    step1desc: 'Ka\u017edou zpr\u00e1vu \u010dte osobn\u011b n\u011bkdo z n\u00e1s.',
    step2title: 'Ozveme se V\u00e1m',
    step2desc: 'V pracovn\u00ed dny do 24 hodin, obvykle d\u0159\u00edv.',
    step3title: 'Domluv\u00edme si kr\u00e1tk\u00fd hovor',
    step3desc: 'Probereme rozsah, term\u00edny a dal\u0161\u00ed postup.',
    sectionSubmissionPlain: '--- SHRNUT\u00cd ---',
    labelService: 'Slu\u017eba',
    labelCompany: 'Firma',
    notFilled: 'Neuvedeno',
    sectionMessage: 'Va\u0161e zpr\u00e1va',
    footerAuto: 'Tento e-mail je automatick\u00fd, neodpov\u00eddejte na n\u011bj pros\u00edm.',
    footerUrgent: 'Sp\u011bch\u00e1te? Napi\u0161te n\u00e1m na',
    thanks: 'D\u011bkujeme, \u017ee jste n\u00e1m napsali. Ozveme se V\u00e1m nejpozd\u011bji do 24 hodin.',
    whatsNext: 'Co bude d\u00e1l:',
    plain1: '1. Projdeme si Va\u0161i zpr\u00e1vu',
    plain2: '2. Ozveme se V\u00e1m do 24 hodin (v pracovn\u00ed dny)',
    plain3: '3. Domluv\u00edme si kr\u00e1tk\u00fd hovor o rozsahu, term\u00ednech a dal\u0161\u00edm postupu',
    automated: 'Tento e-mail je automatick\u00fd, neodpov\u00eddejte na n\u011bj pros\u00edm.',
    urgent: 'Sp\u011bch\u00e1te? Napi\u0161te n\u00e1m na hello@jvm-yore.com',
  },
  sk: {
    subject: 'Prijali sme Va\u0161u spr\u00e1vu \u2014 JVM Yore',
    title: 'Prijali sme Va\u0161u spr\u00e1vu',
    greeting: (name: string) => `Dobr\u00fd de\u0148, ${name},`,
    greetingPlain: (name: string) => `Dobr\u00fd de\u0148, ${name},`,
    intro: `\u010fakujeme, \u017ee ste n\u00e1m nap\u00edsali. Ozveme sa V\u00e1m najnesk\u00f4r do&nbsp;${strong('24 hod\u00edn')}.`,
    sectionNext: '\u010co bude \u010falej',
    step1title: 'Prejdeme si Va\u0161u spr\u00e1vu',
    step1desc: 'Ka\u017ed\u00fa spr\u00e1vu \u010d\u00edta osobne niekto z n\u00e1s.',
    step2title: 'Ozveme sa V\u00e1m',
    step2desc: 'V pracovn\u00e9 dni do 24 hod\u00edn, zvy\u010dajne sk\u00f4r.',
    step3title: 'Dohodneme si kr\u00e1tky hovor',
    step3desc: 'Preberieme rozsah, term\u00edny a \u010fal\u0161\u00ed postup.',
    sectionSubmissionPlain: '--- ZHRNUTIE ---',
    labelService: 'Slu\u017eba',
    labelCompany: 'Firma',
    notFilled: 'Neuveden\u00e9',
    sectionMessage: 'Va\u0161a spr\u00e1va',
    footerAuto: 'Tento e-mail je automatick\u00fd, pros\u00edm, neodpovedajte na\u0148.',
    footerUrgent: 'Pon\u00e1h\u013eate sa? Nap\u00ed\u0161te n\u00e1m na',
    thanks: '\u010eakujeme, \u017ee ste n\u00e1m nap\u00edsali. Ozveme sa V\u00e1m najnesk\u00f4r do 24 hod\u00edn.',
    whatsNext: '\u010co bude \u010falej:',
    plain1: '1. Prejdeme si Va\u0161u spr\u00e1vu',
    plain2: '2. Ozveme sa V\u00e1m do 24 hod\u00edn (v pracovn\u00e9 dni)',
    plain3: '3. Dohodneme si kr\u00e1tky hovor o rozsahu, term\u00ednoch a \u010fal\u0161om postupe',
    automated: 'Tento e-mail je automatick\u00fd, pros\u00edm, neodpovedajte na\u0148.',
    urgent: 'Pon\u00e1h\u013eate sa? Nap\u00ed\u0161te n\u00e1m na hello@jvm-yore.com',
  },
  uk: {
    subject: '\u041c\u0438 \u043e\u0442\u0440\u0438\u043c\u0430\u043b\u0438 \u0412\u0430\u0448\u0435 \u043f\u043e\u0432\u0456\u0434\u043e\u043c\u043b\u0435\u043d\u043d\u044f \u2014 JVM Yore',
    title: '\u041c\u0438 \u043e\u0442\u0440\u0438\u043c\u0430\u043b\u0438 \u0412\u0430\u0448\u0435 \u043f\u043e\u0432\u0456\u0434\u043e\u043c\u043b\u0435\u043d\u043d\u044f',
    greeting: (name: string) => `\u0414\u043e\u0431\u0440\u0438\u0439 \u0434\u0435\u043d\u044c, ${name},`,
    greetingPlain: (name: string) => `\u0414\u043e\u0431\u0440\u0438\u0439 \u0434\u0435\u043d\u044c, ${name},`,
    intro: `\u0414\u044f\u043a\u0443\u0454\u043c\u043e, \u0449\u043e \u043d\u0430\u043f\u0438\u0441\u0430\u043b\u0438 \u043d\u0430\u043c. \u041c\u0438 \u0432\u0456\u0434\u043f\u043e\u0432\u0456\u043c\u043e \u0412\u0430\u043c \u043f\u0440\u043e\u0442\u044f\u0433\u043e\u043c&nbsp;${strong('24 \u0433\u043e\u0434\u0438\u043d')}.`,
    sectionNext: '\u0429\u043e \u0434\u0430\u043b\u0456',
    step1title: '\u041c\u0438 \u043f\u0440\u043e\u0447\u0438\u0442\u0430\u0454\u043c\u043e \u0412\u0430\u0448\u0435 \u043f\u043e\u0432\u0456\u0434\u043e\u043c\u043b\u0435\u043d\u043d\u044f',
    step1desc: '\u041a\u043e\u0436\u043d\u0435 \u043f\u043e\u0432\u0456\u0434\u043e\u043c\u043b\u0435\u043d\u043d\u044f \u0445\u0442\u043e\u0441\u044c \u0456\u0437 \u043d\u0430\u0441 \u0447\u0438\u0442\u0430\u0454 \u043e\u0441\u043e\u0431\u0438\u0441\u0442\u043e.',
    step2title: '\u041c\u0438 \u0437 \u0412\u0430\u043c\u0438 \u0437\u0432\u2019\u044f\u0436\u0435\u043c\u043e\u0441\u044f',
    step2desc: '\u0423 \u0440\u043e\u0431\u043e\u0447\u0456 \u0434\u043d\u0456 \u043f\u0440\u043e\u0442\u044f\u0433\u043e\u043c 24 \u0433\u043e\u0434\u0438\u043d, \u0437\u0430\u0437\u0432\u0438\u0447\u0430\u0439 \u0448\u0432\u0438\u0434\u0448\u0435.',
    step3title: '\u0414\u043e\u043c\u043e\u0432\u0438\u043c\u043e\u0441\u044f \u043f\u0440\u043e \u043a\u043e\u0440\u043e\u0442\u043a\u0438\u0439 \u0434\u0437\u0432\u0456\u043d\u043e\u043a',
    step3desc: '\u041e\u0431\u0433\u043e\u0432\u043e\u0440\u0438\u043c\u043e \u043e\u0431\u0441\u044f\u0433, \u0442\u0435\u0440\u043c\u0456\u043d\u0438 \u0442\u0430 \u043f\u043e\u0434\u0430\u043b\u044c\u0448\u0456 \u043a\u0440\u043e\u043a\u0438.',
    sectionSubmissionPlain: '--- \u041f\u0406\u0414\u0421\u0423\u041c\u041e\u041a ---',
    labelService: '\u041f\u043e\u0441\u043b\u0443\u0433\u0430',
    labelCompany: '\u041a\u043e\u043c\u043f\u0430\u043d\u0456\u044f',
    notFilled: '\u041d\u0435 \u0432\u043a\u0430\u0437\u0430\u043d\u043e',
    sectionMessage: '\u0412\u0430\u0448\u0435 \u043f\u043e\u0432\u0456\u0434\u043e\u043c\u043b\u0435\u043d\u043d\u044f',
    footerAuto: '\u0426\u0435 \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u043d\u0438\u0439 \u043b\u0438\u0441\u0442, \u0431\u0443\u0434\u044c \u043b\u0430\u0441\u043a\u0430, \u043d\u0435 \u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u0430\u0439\u0442\u0435 \u043d\u0430 \u043d\u044c\u043e\u0433\u043e.',
    footerUrgent: '\u0422\u0435\u0440\u043c\u0456\u043d\u043e\u0432\u043e? \u041d\u0430\u043f\u0438\u0448\u0456\u0442\u044c \u043d\u0430\u043c \u043d\u0430',
    thanks: '\u0414\u044f\u043a\u0443\u0454\u043c\u043e, \u0449\u043e \u043d\u0430\u043f\u0438\u0441\u0430\u043b\u0438 \u043d\u0430\u043c. \u041c\u0438 \u0432\u0456\u0434\u043f\u043e\u0432\u0456\u043c\u043e \u0412\u0430\u043c \u043f\u0440\u043e\u0442\u044f\u0433\u043e\u043c 24 \u0433\u043e\u0434\u0438\u043d.',
    whatsNext: '\u0429\u043e \u0434\u0430\u043b\u0456:',
    plain1: '1. \u041c\u0438 \u043f\u0440\u043e\u0447\u0438\u0442\u0430\u0454\u043c\u043e \u0412\u0430\u0448\u0435 \u043f\u043e\u0432\u0456\u0434\u043e\u043c\u043b\u0435\u043d\u043d\u044f',
    plain2: '2. \u041c\u0438 \u0437\u0432\u2019\u044f\u0436\u0435\u043c\u043e\u0441\u044f \u0437 \u0412\u0430\u043c\u0438 \u043f\u0440\u043e\u0442\u044f\u0433\u043e\u043c 24 \u0433\u043e\u0434\u0438\u043d (\u0443 \u0440\u043e\u0431\u043e\u0447\u0456 \u0434\u043d\u0456)',
    plain3: '3. \u0414\u043e\u043c\u043e\u0432\u0438\u043c\u043e\u0441\u044f \u043f\u0440\u043e \u043a\u043e\u0440\u043e\u0442\u043a\u0438\u0439 \u0434\u0437\u0432\u0456\u043d\u043e\u043a \u0449\u043e\u0434\u043e \u043e\u0431\u0441\u044f\u0433\u0443, \u0442\u0435\u0440\u043c\u0456\u043d\u0456\u0432 \u0456 \u043f\u043e\u0434\u0430\u043b\u044c\u0448\u0438\u0445 \u043a\u0440\u043e\u043a\u0456\u0432',
    automated: '\u0426\u0435 \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u043d\u0438\u0439 \u043b\u0438\u0441\u0442, \u0431\u0443\u0434\u044c \u043b\u0430\u0441\u043a\u0430, \u043d\u0435 \u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u0430\u0439\u0442\u0435 \u043d\u0430 \u043d\u044c\u043e\u0433\u043e.',
    urgent: '\u0422\u0435\u0440\u043c\u0456\u043d\u043e\u0432\u043e? \u041d\u0430\u043f\u0438\u0448\u0456\u0442\u044c \u043d\u0430\u043c \u043d\u0430 hello@jvm-yore.com',
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

  const body = `
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
          </tr>`;

  return emailLayout({
    lang: d.lang,
    title: t.subject,
    preheader: t.thanks,
    body,
    footer: `${t.footerAuto}<br>
              ${t.footerUrgent} <a href="mailto:hello@jvm-yore.com" style="color:${ACCENT};text-decoration:none;">hello@jvm-yore.com</a>
              <br><br>
              &copy; ${new Date().getFullYear()} JVM Yore &middot; <a href="${SITE}" style="color:${MUTED};text-decoration:underline;">jvm-yore.com</a>`,
  });
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
