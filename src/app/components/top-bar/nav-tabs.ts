import { IconName } from '../icon/icon.component';

export interface NavTab {
  path: string;
  labelKey: string;
  /** Label under the icon in the phone tab bar, when it differs */
  shortKey?: string;
  icon: IconName;
}

/** The pages in the top bar, in reading order — also the order page pushes follow (services/page-transition.ts). */
export const NAV_TABS: readonly NavTab[] = [
  { path: '/', labelKey: 'nav.home', icon: 'home' },
  { path: '/services', labelKey: 'nav.services', icon: 'grid' },
  { path: '/about', labelKey: 'nav.about', icon: 'people' },
  { path: '/faq', labelKey: 'nav.faq', icon: 'help' },
];

/** The phone tab bar: the same pages, then the contact page (five, as its grid is laid out). */
export const TAB_BAR: readonly NavTab[] = [
  ...NAV_TABS,
  { path: '/contact', labelKey: 'nav.message', shortKey: 'nav.messageShort', icon: 'chat' },
];

/** Index of the tab whose page is showing, or -1 (contact, legal pages). */
export function activeTabIndex(url: string, tabs: readonly NavTab[] = NAV_TABS): number {
  const path = url.split(/[?#]/)[0] || '/';
  return tabs.findIndex((t) => t.path === path);
}
