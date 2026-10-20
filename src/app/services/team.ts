/** The three of us, as every part of the site shows us. Names are never translated. */
export type PersonId = 'j' | 'v' | 'm';

export interface Person {
  id: PersonId;
  /** First name, as the chat shows it */
  first: string;
  full: string;
  /** Square face, 120px: sharp up to 40 CSS px at 3x (the chat head, chat rows, the "To" lines) */
  avatar: string;
  /** The same face at 320px, for the team section's large faces */
  face: string;
  /** Portrait for the about page; the JPEG is the fallback for browsers without AVIF */
  photo: string;
  /** The portrait as AVIF at the widths the about page picks from (its <source srcset>) */
  photoSet: string;
  /** Focal point of the portrait, so the crop keeps the face */
  focus: string;
  linkedin: string;
}

export const TEAM: Readonly<Record<PersonId, Person>> = {
  j: {
    id: 'j',
    first: 'Janis',
    full: 'Janis Joanu',
    avatar: 'images/team/janis-avatar-120.webp',
    face: 'images/team/janis-avatar-320.webp',
    photo: 'images/team/janis.jpg',
    photoSet: 'images/team/janis-480.avif 480w, images/team/janis-640.avif 640w, images/team/janis-800.avif 800w',
    focus: '50% 24%',
    linkedin: 'https://www.linkedin.com/in/janis-joanu/',
  },
  v: {
    id: 'v',
    first: 'Vít',
    full: 'Vít Chvoj',
    avatar: 'images/team/vit-avatar-120.webp',
    face: 'images/team/vit-avatar-320.webp',
    photo: 'images/team/vit.jpg',
    // The original is 700px wide, so that is the largest
    photoSet: 'images/team/vit-480.avif 480w, images/team/vit-640.avif 640w, images/team/vit-700.avif 700w',
    focus: '50% 30%',
    linkedin: 'https://www.linkedin.com/in/vitchvoj/',
  },
  m: {
    id: 'm',
    first: 'Michael',
    full: 'Michael Chaban',
    avatar: 'images/team/michael-avatar-120.webp',
    face: 'images/team/michael-avatar-320.webp',
    photo: 'images/team/michael.jpg',
    photoSet: 'images/team/michael-480.avif 480w, images/team/michael-640.avif 640w, images/team/michael-800.avif 800w',
    focus: '50% 40%',
    linkedin: 'https://www.linkedin.com/in/michael-chaban/',
  },
};

export const TEAM_ORDER: readonly PersonId[] = ['j', 'v', 'm'];
