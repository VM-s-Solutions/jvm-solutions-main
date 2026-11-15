import { scrollForThumb } from './scrollbar';

describe('scrollForThumb', () => {
  it('spans the scroll range with the thumb’s travel', () => {
    expect(scrollForThumb(0, 200, 1000)).toBe(0);
    expect(scrollForThumb(50, 200, 1000)).toBe(250);
    expect(scrollForThumb(200, 200, 1000)).toBe(1000);
  });

  it('stops the thumb at either end of the track', () => {
    expect(scrollForThumb(-40, 200, 1000)).toBe(0);
    expect(scrollForThumb(260, 200, 1000)).toBe(1000);
  });

  it('keeps the strip at its start when the thumb fills the track', () => {
    expect(scrollForThumb(30, 0, 1000)).toBe(0);
    expect(scrollForThumb(30, -5, 1000)).toBe(0);
  });
});
