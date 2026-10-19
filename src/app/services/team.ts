/** The three of us, as every part of the site shows us. Names are never translated. */
export type PersonId = 'j' | 'v' | 'm';

export interface Person {
  id: PersonId;
  /** First name, as the chat shows it */
  first: string;
  full: string;
  /** Square head-and-shoulders crop for avatars */
  avatar: string;
  /** Portrait for the about page */
  photo: string;
  /** Focal point of the portrait, so the crop keeps the face */
  focus: string;
  linkedin: string;
}

export const TEAM: Readonly<Record<PersonId, Person>> = {
  j: {
    id: 'j',
    first: 'Janis',
    full: 'Janis Joanu',
    avatar: 'images/team/janis-avatar.jpg',
    photo: 'images/team/janis.jpg',
    focus: '50% 24%',
    linkedin: 'https://www.linkedin.com/in/janis-joanu/',
  },
  v: {
    id: 'v',
    first: 'Vít',
    full: 'Vít Chvoj',
    avatar: 'images/team/vit-avatar.jpg',
    photo: 'images/team/vit.jpg',
    focus: '50% 30%',
    linkedin: 'https://www.linkedin.com/in/vitchvoj/',
  },
  m: {
    id: 'm',
    first: 'Michael',
    full: 'Michael Chaban',
    avatar: 'images/team/michael-avatar.jpg',
    photo: 'images/team/michael.jpg',
    focus: '50% 40%',
    linkedin: 'https://www.linkedin.com/in/michael-chaban/',
  },
};

export const TEAM_ORDER: readonly PersonId[] = ['j', 'v', 'm'];
