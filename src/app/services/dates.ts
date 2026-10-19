import { Lang, localeOf } from './lang.service';

/** Keeps a day number with its month ("20. října" with a no-break space), so a date never breaks across lines. */
function bindDay(text: string): string {
  return text.replace(/(\d\.?) /g, '$1\u00A0');
}

/**
 * When a message written now gets its reply: 24 hours later, moved past the weekend,
 * because we reply within 24 hours on business days.
 */
export function replyByDate(now: Date): Date {
  const date = new Date(now);
  date.setDate(date.getDate() + 1); // calendar day, so a DST switch keeps the wall-clock time
  const day = date.getDay();
  if (day === 6) date.setDate(date.getDate() + 2);
  else if (day === 0) date.setDate(date.getDate() + 1);
  return date;
}

/**
 * Date and time parts for "you'll hear back by {{date}} at {{time}}". English names the
 * weekday; Czech, Slovak and Ukrainian use day + month in the genitive ("20. října"),
 * which reads right after "do" / "до" where a weekday would need its own case.
 */
export function replyByParts(date: Date, lang: Lang): { date: string; time: string } {
  const locale = localeOf(lang);
  const dateOptions: Intl.DateTimeFormatOptions =
    lang === 'en' ? { weekday: 'long', day: 'numeric', month: 'long' } : { day: 'numeric', month: 'long' };
  return {
    date: bindDay(new Intl.DateTimeFormat(locale, dateOptions).format(date)),
    time: new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', hour12: false }).format(date),
  };
}

/** Today as a phone lock screen shows it: "Monday 19 October". */
export function lockScreenDate(date: Date, lang: Lang): string {
  return bindDay(new Intl.DateTimeFormat(localeOf(lang), { weekday: 'long', day: 'numeric', month: 'long' }).format(date));
}

/** Whole euros in the language's own format: €17,900 in English, 17 900 € in Czech and Ukrainian. */
export function formatEuros(amount: number, lang: Lang): string {
  return new Intl.NumberFormat(localeOf(lang), {
    style: 'currency',
    currency: 'EUR',
    // Ukrainian would otherwise print "EUR"
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}
