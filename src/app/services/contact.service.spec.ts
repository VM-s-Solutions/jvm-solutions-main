import { CONSULTATION_PARAMS, TOPIC_PARAM } from './consultation';
import { serviceValueFor } from './contact.service';

describe('serviceValueFor', () => {
  it('picks the topic a link asks for', () => {
    expect(serviceValueFor('consultation')).toBe('Consultation');
    expect(serviceValueFor('backend')).toBe('Backend Systems');
  });

  it('ignores a topic the form does not offer', () => {
    expect(serviceValueFor('pricing')).toBe('');
    expect(serviceValueFor('')).toBe('');
    expect(serviceValueFor(null)).toBe('');
  });

  it('opens "Book a consultation" links on Consultation', () => {
    expect(serviceValueFor(CONSULTATION_PARAMS[TOPIC_PARAM])).toBe('Consultation');
  });
});
