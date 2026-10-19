import { formatEuros, lockScreenDate, replyByDate, replyByParts } from './dates';

describe('replyByDate', () => {
  // 19 October 2026 is a Monday
  const at = (day: number) => new Date(2026, 9, day, 16, 45);

  it('answers a weekday message the next day at the same time', () => {
    const reply = replyByDate(at(19));
    expect(reply.getDate()).toBe(20);
    expect(reply.getHours()).toBe(16);
    expect(reply.getMinutes()).toBe(45);
  });

  it('moves a Friday message past the weekend to Monday', () => {
    expect(replyByDate(at(23)).getDate()).toBe(26);
  });

  it('answers Saturday and Sunday messages on Monday', () => {
    expect(replyByDate(at(24)).getDate()).toBe(26);
    expect(replyByDate(at(25)).getDate()).toBe(26);
  });
});

describe('replyByParts', () => {
  const tuesday = new Date(2026, 9, 20, 16, 45);

  it('names the weekday in English', () => {
    expect(replyByParts(tuesday, 'en')).toEqual({ date: 'Tuesday 20\u00A0October', time: '16:45' });
  });

  it('uses day and month only in Czech, so it reads after "do", and never breaks the date', () => {
    const parts = replyByParts(tuesday, 'cs');
    expect(parts.date).toBe('20.\u00A0října');
    expect(parts.time).toBe('16:45');
  });
});

describe('lockScreenDate', () => {
  it('reads like a phone lock screen', () => {
    expect(lockScreenDate(new Date(2026, 9, 19), 'en')).toBe('Monday 19\u00A0October');
  });
});

describe('formatEuros', () => {
  it('formats whole euros the way each language writes them', () => {
    expect(formatEuros(17900, 'en')).toBe('€17,900');
    expect(formatEuros(17900, 'cs').replace(/\s/g, ' ')).toBe('17 900 €');
  });

  it('prints the euro sign in Ukrainian too', () => {
    expect(formatEuros(390, 'uk')).toContain('€');
  });

  it('rounds to whole euros', () => {
    expect(formatEuros(389.6, 'en')).toBe('€390');
  });
});
