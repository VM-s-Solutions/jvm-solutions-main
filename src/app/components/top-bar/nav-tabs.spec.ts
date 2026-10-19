import { NAV_TABS, TAB_BAR, activeTabIndex } from './nav-tabs';

describe('activeTabIndex', () => {
  it('finds the tab of the page that is showing', () => {
    expect(activeTabIndex('/')).toBe(0);
    expect(activeTabIndex('/pricing')).toBe(NAV_TABS.findIndex((t) => t.path === '/pricing'));
  });

  it('ignores query strings and fragments', () => {
    expect(activeTabIndex('/about?ref=x#team')).toBe(NAV_TABS.findIndex((t) => t.path === '/about'));
    expect(activeTabIndex('')).toBe(0);
  });

  it('has no active tab on pages outside the top bar', () => {
    expect(activeTabIndex('/privacy')).toBe(-1);
    expect(activeTabIndex('/contact')).toBe(-1);
  });

  it('lets the phone tab bar mark the contact page', () => {
    expect(activeTabIndex('/contact', TAB_BAR)).toBe(TAB_BAR.length - 1);
  });
});
