import type { ContactServiceId } from './contact.service';

/** Consulting with one of us, in whole euros an hour: the only price the site quotes. Everything else is agreed per scope. */
export const HOURLY_RATE = 100;

/** The query param the contact page reads to pick a topic: /contact?about=<a CONTACT_SERVICES id>. */
export const TOPIC_PARAM = 'about';

/** For every "Book a consultation" link: the contact form opens with Consultation picked. */
export const CONSULTATION_PARAMS = { [TOPIC_PARAM]: 'consultation' satisfies ContactServiceId } as const;
