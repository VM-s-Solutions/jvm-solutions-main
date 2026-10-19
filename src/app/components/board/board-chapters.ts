const STAGES = [0, 1, 2, 3] as const;

/** The board's four chapters: 0 sketch, 1 write, 2 show, 3 hand over. */
export type BoardStage = (typeof STAGES)[number];

export const CHAPTER_COUNT = STAGES.length;

/** A colour as its red, green and blue channels, 0–255. */
export type Rgb = readonly [number, number, number];

/** The colour token behind each chapter's background: paper, ink, soft paper, ink. */
export const CHAPTER_COLORS = ['--bg', '--night', '--soft', '--night'] as const;

/** Below this weighted lightness (0–255) a background needs light text. */
const DARK_BELOW = 128;
/**
 * Between these, the background is a mid grey part-way through a hand-off: the dimmed step
 * copy (62% of the text colour) stays under 4.5:1 whichever way the text has flipped.
 */
const MURKY_ABOVE = 68;
const MURKY_BELOW = 197;

export interface ChapterTone {
  /** The track's background, as a CSS colour */
  readonly color: string;
  /** That background is dark enough to need light text */
  readonly dark: boolean;
  /** That background is too mid-grey for the dimmed step copy to read */
  readonly murky: boolean;
}

function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t));
}

function smoothstep(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

/** The channels of a computed CSS colour ("rgb(11, 12, 14)" or "rgb(11 12 14)"); null if it isn't one. */
export function parseRgb(css: string): Rgb | null {
  const channels = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/.exec(css);
  return channels ? [Number(channels[1]), Number(channels[2]), Number(channels[3])] : null;
}

/** How far the visitor has scrolled through the pinned track: 0 at its top, 1 at its end. */
export function trackProgress(top: number, height: number, viewport: number): number {
  const run = height - viewport;
  return run > 0 ? clamp01(-top / run) : 0;
}

/** The chapter on show at a scroll progress. */
export function chapterAt(progress: number): BoardStage {
  const index = Math.floor(clamp01(progress) * CHAPTER_COUNT);
  return STAGES[Math.min(CHAPTER_COUNT - 1, index)];
}

/**
 * The track's background at a scroll progress, given each chapter's colour (CHAPTER_COLORS,
 * resolved). Each colour holds through the middle of its chapter and blends into the next
 * across the middle 40% of the hand-off.
 */
export function chapterTone(progress: number, tones: readonly Rgb[]): ChapterTone {
  const x = Math.min(CHAPTER_COUNT - 1, Math.max(0, progress * CHAPTER_COUNT - 0.5));
  const i = Math.min(CHAPTER_COUNT - 2, Math.floor(x));
  const t = smoothstep((x - i - 0.3) / 0.4);
  const from = tones[i];
  const to = tones[i + 1];
  const [r, g, b] = [0, 1, 2].map((k) => Math.round(from[k] + (to[k] - from[k]) * t));
  const lightness = r * 0.2126 + g * 0.7152 + b * 0.0722;
  return {
    color: `rgb(${r}, ${g}, ${b})`,
    dark: lightness < DARK_BELOW,
    murky: lightness > MURKY_ABOVE && lightness < MURKY_BELOW,
  };
}
