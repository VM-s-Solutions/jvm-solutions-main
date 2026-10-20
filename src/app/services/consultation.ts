import type { ContactServiceId } from './contact.service';

/** The query param the contact page reads to pick a topic: /contact?about=<a CONTACT_SERVICES id>. */
export const TOPIC_PARAM = 'about';

/** For every "Book a consultation" link: the contact form opens with Consultation picked. */
export const CONSULTATION_PARAMS = { [TOPIC_PARAM]: 'consultation' satisfies ContactServiceId } as const;
