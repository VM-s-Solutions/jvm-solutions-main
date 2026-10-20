import { Lang, localeOf } from './lang.service';

/** Keeps a day number with its month ("20. října" with a no-break space), so a date never breaks across lines. */
function bindDay(text: string): string {
  return text.replace(/(\d\.?) /g, '$1\u00A0');
}

/** The date formats in use; each is built once per language, as making one costs far more than using it */
type DateFormatName = 'weekdayDayMonth' | 'dayMonth' | 'time';

const DATE_OPTIONS: Readonly<Record<DateFormatName, Intl.DateTimeFormatOptions>> = {
  weekdayDayMonth: { weekday: 'long', day: 'numeric', month: 'long' },
  dayMonth: { day: 'numeric', month: 'long' },
  time: { hour: 'numeric', minute: '2-digit', hour12: false },
};

const DATE_FORMATS = new Map<string, Intl.DateTimeFormat>();

function dateFormat(lang: Lang, name: DateFormatName): Intl.DateTimeFormat {
  const key = `${lang}|${name}`;
  let format = DATE_FORMATS.get(key);
  if (!format) {
    format = new Intl.DateTimeFormat(localeOf(lang), DATE_OPTIONS[name]);
    DATE_FORMATS.set(key, format);
  }
  return format;
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
  return {
    date: bindDay(dateFormat(lang, lang === 'en' ? 'weekdayDayMonth' : 'dayMonth').format(date)),
    time: dateFormat(lang, 'time').format(date),
  };
}

/** Today as a phone lock screen shows it: "Monday 19 October". */
export function lockScreenDate(date: Date, lang: Lang): string {
  return bindDay(dateFormat(lang, 'weekdayDayMonth').format(date));
}
