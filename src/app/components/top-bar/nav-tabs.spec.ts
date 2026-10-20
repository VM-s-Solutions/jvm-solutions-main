import { NAV_TABS, TAB_BAR, activeTabIndex } from './nav-tabs';

describe('activeTabIndex', () => {
  it('finds the tab of the page that is showing', () => {
    expect(activeTabIndex('/')).toBe(0);
    expect(activeTabIndex('/faq')).toBe(NAV_TABS.findIndex((t) => t.path === '/faq'));
  });

  it('ignores query strings and fragments', () => {
    expect(activeTabIndex('/about?ref=x#team')).toBe(NAV_TABS.findIndex((t) => t.path === '/about'));
    expect(activeTabIndex('')).toBe(0);
  });

  it('has no active tab on pages outside the top bar', () => {
    expect(activeTabIndex('/privacy')).toBe(-1);
    expect(activeTabIndex('/contact')).toBe(-1);
    expect(activeTabIndex('/pricing')).toBe(-1);
  });

  it('lets the phone tab bar mark the contact page', () => {
    expect(activeTabIndex('/contact', TAB_BAR)).toBe(TAB_BAR.length - 1);
    expect(activeTabIndex('/contact?about=consultation', TAB_BAR)).toBe(TAB_BAR.length - 1);
  });

  it('gives the phone tab bar the five tabs its grid has room for', () => {
    expect(TAB_BAR.length).toBe(5);
  });
});
