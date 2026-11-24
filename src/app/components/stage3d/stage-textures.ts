import { ScreenFrame } from './stage-timeline';

/**
 * Everything written on the stage's objects, drawn on 2D canvases the scene uses as textures:
 * the hand-drawn sketch, the printed spec, the sticky notes and the laptop's screen. The sketch
 * and the screen are laid out by the same boxes (`layout`), so when the sheet lands on the
 * display its drawing sits exactly over the app it turns into.
 */

export interface StageContent {
  readonly product: string;
  readonly initial: string;
  readonly notes: readonly string[];
  readonly tags: { readonly nav: string; readonly search: string; readonly checklist: string };
  readonly spec: {
    readonly label: string;
    readonly items: readonly string[];
    readonly price: string;
    readonly terms: string;
  };
  readonly app: {
    readonly nav: readonly string[];
    readonly search: string;
    readonly items: readonly string[];
    readonly toast: string;
  };
  readonly staging: { readonly label: string; readonly rows: readonly (readonly [string, string])[] };
  readonly handover: { readonly label: string; readonly items: readonly string[] };
}

const INK = '#1B1D22';
const INK_2 = '#3C4048';
const MUTED = '#6B7079';
const LINE = '#E6E8EC';
const SOFT = '#F3F4F7';
const ORANGE = '#F26100';
const ORANGE_INK = '#D95700';
// Done is ink: the palette is light surfaces, ink neutrals and orange, nothing else
const DONE = '#1B1D22';
const PAPER = '#FAF8F2';
const NOTE = '#F7EDB8';
const NIGHT = '#14161A';
const SIGNATURE = 'Janis, Vít, Michael';
const STACK = 'Angular · .NET · PostgreSQL';

const HAND = 'Caveat, "Segoe Print", "Bradley Hand", cursive';
const TEXT = 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif';
const DISPLAY = 'Geologica, Inter, system-ui, sans-serif';

/** The faces the canvases draw with, for `document.fonts.load` before the first drawing */
export const STAGE_FONTS = ['600 1em Caveat', '400 1em Inter', '500 1em Inter', '600 1em Inter', '600 1em Geologica'] as const;

// The screen's pixels (16:10) and the sheets' (A4 at the same density as the screen's width)
const SCREEN_PX_W = 1920;
const SCREEN_PX_H = 1200;
const SHEET_PX_LONG = 1940;
const SHEET_PX_SHORT = Math.round(SHEET_PX_LONG / Math.SQRT2);
const NOTE_PX = 512;

interface Box {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

/** The app's layout in a 1920 × 1200 frame; the sketch draws the same boxes by hand */
const layout = {
  top: { x: 0, y: 0, w: SCREEN_PX_W, h: 132 },
  search: { x: 700, y: 34, w: 560, h: 64 },
  avatar: { x: 1790, y: 34, w: 64, h: 64 },
  side: { x: 0, y: 132, w: 400, h: SCREEN_PX_H - 132 },
  title: { x: 480, y: 212, w: 900, h: 110 },
  rows: [0, 1, 2, 3].map((i): Box => ({ x: 480, y: 372 + i * 136, w: 1000, h: 108 })),
  card: { x: 1150, y: 300, w: 690, h: 790 },
} as const;

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const el = document.createElement('canvas');
  el.width = w;
  el.height = h;
  const ctx = el.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  return [el, ctx];
}

/** A small seeded generator, so the hand-drawn wobble is the same on every redraw */
function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function roundRect(ctx: CanvasRenderingContext2D, { x, y, w, h }: Box, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fit(ctx: CanvasRenderingContext2D, text: string, max: number): string {
  if (ctx.measureText(text).width <= max) return text;
  let cut = text;
  while (cut.length > 1 && ctx.measureText(`${cut}…`).width > max) cut = cut.slice(0, -1);
  return `${cut.trimEnd()}…`;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > max) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Fine paper fibre over a sheet: a field of faint specks and short strokes */
function grain(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, strength: number): void {
  const rand = seeded(seed);
  const count = Math.round((w * h) / 260);
  for (let i = 0; i < count; i++) {
    const dark = rand() > 0.5;
    ctx.fillStyle = dark ? `rgba(80,70,50,${strength * rand()})` : `rgba(255,255,255,${strength * 2 * rand()})`;
    ctx.fillRect(rand() * w, rand() * h, 1 + rand() * 3, 1 + rand() * 1.5);
  }
}

// ─── Hand drawing ─────────────────────────────────────────────────────────────
interface Pen {
  readonly ctx: CanvasRenderingContext2D;
  readonly rand: () => number;
}

/** A line as a hand draws it: slightly bowed, a touch past its ends, gone over twice */
function stroke({ ctx, rand }: Pen, x1: number, y1: number, x2: number, y2: number, wobble = 5): void {
  for (let pass = 0; pass < 2; pass++) {
    const j = (): number => (rand() - 0.5) * wobble;
    ctx.beginPath();
    ctx.moveTo(x1 + j(), y1 + j());
    ctx.bezierCurveTo(
      x1 + (x2 - x1) * 0.33 + j() * 1.6,
      y1 + (y2 - y1) * 0.33 + j() * 1.6,
      x1 + (x2 - x1) * 0.66 + j() * 1.6,
      y1 + (y2 - y1) * 0.66 + j() * 1.6,
      x2 + j(),
      y2 + j(),
    );
    ctx.stroke();
  }
}

function strokeBox(pen: Pen, { x, y, w, h }: Box, wobble = 5): void {
  stroke(pen, x - 6, y, x + w + 8, y, wobble);
  stroke(pen, x + w, y - 6, x + w, y + h + 8, wobble);
  stroke(pen, x + w + 6, y + h, x - 8, y + h, wobble);
  stroke(pen, x, y + h + 6, x, y - 8, wobble);
}

function strokeCircle({ ctx, rand }: Pen, cx: number, cy: number, r: number): void {
  ctx.beginPath();
  for (let a = 0; a <= Math.PI * 2.15; a += 0.3) {
    const rr = r + (rand() - 0.5) * 4;
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a) * rr;
    if (a === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

/** The sketch sheet, landscape: the app drawn by hand, the notes' three questions tagged in orange */
export function drawSketch(content: StageContent): HTMLCanvasElement {
  const [el, ctx] = canvas(SHEET_PX_LONG, SHEET_PX_SHORT);
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, el.width, el.height);
  grain(ctx, el.width, el.height, 7, 0.05);

  // The drawing fills the sheet's width at the display's proportions, centred
  const scale = SHEET_PX_LONG / SCREEN_PX_W;
  const frameH = SCREEN_PX_H * scale;
  ctx.save();
  ctx.translate(0, (SHEET_PX_SHORT - frameH) / 2);
  ctx.scale(scale, scale);

  const pen: Pen = { ctx, rand: seeded(11) };
  const inset = 26;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 7;
  strokeBox(pen, { x: inset, y: inset, w: SCREEN_PX_W - inset * 2, h: SCREEN_PX_H - inset * 2 }, 7);
  ctx.lineWidth = 6;
  stroke(pen, inset, layout.top.h, SCREEN_PX_W - inset, layout.top.h);
  stroke(pen, layout.side.w, layout.top.h, layout.side.w, SCREEN_PX_H - inset);
  strokeBox(pen, layout.search, 4);
  strokeCircle(pen, layout.avatar.x + 32, layout.avatar.y + 32, 30);
  strokeBox(pen, { x: 70, y: 40, w: 56, h: 56 }, 4);
  stroke(pen, 150, 70, 380, 70);

  // The sidebar: four lines of navigation
  [0, 1, 2, 3].forEach((i) => stroke(pen, 76, 236 + i * 84, 250 + ((i * 53) % 90), 236 + i * 84));

  // The name, in handwriting, underlined in orange
  ctx.fillStyle = INK;
  ctx.font = `600 104px ${HAND}`;
  ctx.textBaseline = 'alphabetic';
  const name = fit(ctx, content.product, layout.title.w);
  ctx.fillText(name, layout.title.x, layout.title.y + 92);
  ctx.strokeStyle = ORANGE;
  ctx.lineWidth = 8;
  stroke(pen, layout.title.x, layout.title.y + 112, layout.title.x + Math.min(ctx.measureText(name).width + 20, layout.title.w), layout.title.y + 108, 6);

  // The checklist: a box and a line each
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  layout.rows.forEach((row, i) => {
    strokeBox(pen, { x: row.x + 8, y: row.y + 28, w: 52, h: 52 }, 4);
    stroke(pen, row.x + 110, row.y + 56, row.x + 520 + ((i * 137) % 330), row.y + 56);
  });
  strokeBox(pen, { x: 1480, y: 1010, w: 300, h: 84 }, 5);

  // Orange tags with their arrows, the way a workshop marks a drawing up
  ctx.fillStyle = ORANGE_INK;
  ctx.strokeStyle = ORANGE;
  ctx.lineWidth = 5;
  ctx.font = `600 68px ${HAND}`;
  const tag = (text: string, x: number, y: number, toX: number, toY: number): void => {
    ctx.fillText(fit(ctx, text, 420), x, y);
    stroke(pen, x - 14, y - 16, toX, toY, 5);
  };
  tag(content.tags.nav, 150, 640, 120, 520);
  tag(content.tags.search, 1330, 190, 1180, 110);
  tag(content.tags.checklist, 1500, 520, 1420, 470);
  ctx.restore();
  return el;
}

/** One sticky note: a question in handwriting on yellow paper */
export function drawNote(text: string, seed: number): HTMLCanvasElement {
  const [el, ctx] = canvas(NOTE_PX, NOTE_PX);
  ctx.fillStyle = NOTE;
  ctx.fillRect(0, 0, NOTE_PX, NOTE_PX);
  // The gummed strip along the top holds a little darker
  const strip = ctx.createLinearGradient(0, 0, 0, NOTE_PX);
  strip.addColorStop(0, 'rgba(150,130,60,0.12)');
  strip.addColorStop(0.2, 'rgba(150,130,60,0)');
  strip.addColorStop(1, 'rgba(255,255,255,0.12)');
  ctx.fillStyle = strip;
  ctx.fillRect(0, 0, NOTE_PX, NOTE_PX);
  grain(ctx, NOTE_PX, NOTE_PX, seed, 0.04);

  ctx.fillStyle = INK;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  let size = 84;
  let lines: string[] = [];
  do {
    ctx.font = `600 ${size}px ${HAND}`;
    lines = wrap(ctx, text, NOTE_PX - 84);
    size -= 6;
  } while (lines.length * (size + 6) * 1.05 > NOTE_PX - 110 && size > 40);
  const leading = (size + 6) * 1.05;
  lines.forEach((line, i) => ctx.fillText(line, NOTE_PX / 2, NOTE_PX / 2 + (i - (lines.length - 1) / 2) * leading + 10));
  return el;
}

/** The technical spec, portrait: a printed page */
export function drawSpec(content: StageContent): HTMLCanvasElement {
  const w = SHEET_PX_SHORT;
  const h = SHEET_PX_LONG;
  const [el, ctx] = canvas(w, h);
  ctx.fillStyle = '#FDFDFB';
  ctx.fillRect(0, 0, w, h);
  grain(ctx, w, h, 23, 0.035);
  const left = 150;
  const width = w - left * 2;
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = ORANGE;
  roundRect(ctx, { x: left, y: 150, w: 44, h: 44 }, 10);
  ctx.fill();
  ctx.fillStyle = MUTED;
  ctx.font = `500 34px ${TEXT}`;
  ctx.fillText(fit(ctx, content.spec.label, width - 70), left + 66, 184);

  ctx.fillStyle = INK;
  ctx.font = `600 104px ${DISPLAY}`;
  ctx.fillText(fit(ctx, content.product, width), left, 330);
  ctx.fillStyle = LINE;
  ctx.fillRect(left, 384, width, 3);

  // Four headed sections; their paragraphs stand in as lines of set text
  const rand = seeded(5);
  let y = 480;
  content.spec.items.forEach((item, i) => {
    ctx.fillStyle = INK;
    ctx.font = `600 44px ${TEXT}`;
    ctx.fillText(`${i + 1}  ${fit(ctx, item, width - 60)}`, left, y);
    ctx.fillStyle = '#D9DCE1';
    for (let line = 0; line < 3; line++) {
      const len = line === 2 ? 0.35 + rand() * 0.3 : 0.86 + rand() * 0.14;
      roundRect(ctx, { x: left, y: y + 36 + line * 34, w: width * len, h: 12 }, 6);
      ctx.fill();
    }
    y += 232;
  });

  ctx.fillStyle = INK_2;
  ctx.font = `500 34px ${TEXT}`;
  ctx.fillText(STACK, left, y + 4);

  // The price: one line, ticked
  const price: Box = { x: left, y: y + 60, w: width, h: 128 };
  ctx.fillStyle = SOFT;
  roundRect(ctx, price, 22);
  ctx.fill();
  ctx.fillStyle = ORANGE;
  ctx.beginPath();
  ctx.arc(price.x + 64, price.y + 64, 26, 0, Math.PI * 2);
  ctx.fill();
  tick(ctx, price.x + 64, price.y + 64, 11);
  ctx.fillStyle = INK;
  ctx.font = `600 40px ${TEXT}`;
  ctx.fillText(fit(ctx, content.spec.price, width - 140), price.x + 112, price.y + 78);

  ctx.fillStyle = MUTED;
  ctx.font = `400 30px ${TEXT}`;
  wrap(ctx, content.spec.terms, width).slice(0, 2).forEach((line, i) => ctx.fillText(line, left, price.y + 190 + i * 42));
  return el;
}

function tick(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = r * 0.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - r, cy);
  ctx.lineTo(cx - r * 0.25, cy + r * 0.7);
  ctx.lineTo(cx + r, cy - r * 0.7);
  ctx.stroke();
}

/** A canvas for the laptop's screen; `paintScreen` redraws it for a frame of the story */
export function createScreen(): HTMLCanvasElement {
  return canvas(SCREEN_PX_W, SCREEN_PX_H)[0];
}

/** The app on the laptop's screen at one moment: rows arriving, ticked off, the cards over them */
export function paintScreen(el: HTMLCanvasElement, content: StageContent, frame: ScreenFrame): void {
  const ctx = el.getContext('2d');
  if (!ctx) return;
  const { top, search, avatar, side, title, rows, card } = layout;
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, SCREEN_PX_W, SCREEN_PX_H);

  // Sidebar
  ctx.fillStyle = '#F7F8FA';
  ctx.fillRect(side.x, side.y, side.w, side.h);
  ctx.fillStyle = LINE;
  ctx.fillRect(side.w, side.y, 2, side.h);
  ctx.fillRect(0, top.h, SCREEN_PX_W, 2);
  content.app.nav.forEach((item, i) => {
    const y = 236 + i * 84;
    if (i === 0) {
      ctx.fillStyle = '#ECEEF1';
      roundRect(ctx, { x: 44, y: y - 34, w: side.w - 88, h: 68 }, 16);
      ctx.fill();
    }
    ctx.fillStyle = i === 0 ? INK : MUTED;
    ctx.font = `${i === 0 ? 600 : 500} 38px ${TEXT}`;
    ctx.fillText(fit(ctx, item, side.w - 150), 76, y + 2);
  });

  // Top bar: mark and name, search, the signed-in face
  ctx.fillStyle = ORANGE;
  roundRect(ctx, { x: 70, y: 38, w: 56, h: 56 }, 14);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `600 36px ${DISPLAY}`;
  ctx.textAlign = 'center';
  ctx.fillText(content.initial, 98, 68);
  ctx.textAlign = 'left';
  ctx.fillStyle = INK;
  ctx.font = `600 40px ${TEXT}`;
  ctx.fillText(fit(ctx, content.product, 500), 150, 68);
  ctx.fillStyle = SOFT;
  roundRect(ctx, search, 32);
  ctx.fill();
  ctx.fillStyle = MUTED;
  ctx.font = `400 34px ${TEXT}`;
  ctx.fillText(fit(ctx, content.app.search, search.w - 80), search.x + 36, search.y + 34);
  ctx.fillStyle = NIGHT;
  ctx.beginPath();
  ctx.arc(avatar.x + 32, avatar.y + 32, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `600 26px ${TEXT}`;
  ctx.textAlign = 'center';
  ctx.fillText('JV', avatar.x + 32, avatar.y + 34);
  ctx.textAlign = 'left';

  // Title and the checklist
  ctx.fillStyle = INK;
  ctx.font = `600 96px ${DISPLAY}`;
  ctx.fillText(fit(ctx, content.product, title.w), title.x, title.y + 56);
  rows.slice(0, frame.rows).forEach((row, i) => {
    const done = i < frame.checks;
    ctx.fillStyle = SOFT;
    roundRect(ctx, row, 26);
    ctx.fill();
    ctx.fillStyle = done ? DONE : ORANGE;
    ctx.beginPath();
    ctx.arc(row.x + 58, row.y + row.h / 2, done ? 24 : 13, 0, Math.PI * 2);
    ctx.fill();
    if (done) tick(ctx, row.x + 58, row.y + row.h / 2, 10);
    ctx.fillStyle = INK;
    ctx.font = `500 42px ${TEXT}`;
    ctx.fillText(fit(ctx, content.app.items[i] ?? '', row.w - 160), row.x + 112, row.y + row.h / 2 + 2);
  });

  // A new sign-up drops in beside the title while the staging build is live
  if (frame.rows > 1 && frame.panel === 0) {
    ctx.font = `500 32px ${TEXT}`;
    const label = fit(ctx, content.app.toast, 360);
    const toast: Box = { x: 1840 - ctx.measureText(label).width - 104, y: 232, w: ctx.measureText(label).width + 104, h: 72 };
    ctx.fillStyle = '#FFF0E5';
    roundRect(ctx, toast, 36);
    ctx.fill();
    ctx.fillStyle = ORANGE;
    ctx.beginPath();
    ctx.arc(toast.x + 40, toast.y + 36, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = ORANGE_INK;
    ctx.fillText(label, toast.x + 66, toast.y + 38);
  }

  ctx.globalAlpha = 1;
}

/** A card of the app drawn once, with its shadow: the scene lays it over the screen and glides it */
export interface CardSprite {
  readonly image: HTMLCanvasElement;
  /** Its place on the screen, in the screen's pixels */
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  /** How far below its place it starts its slide in, in the screen's pixels */
  readonly rise: number;
}

export const SCREEN_PX: readonly [number, number] = [SCREEN_PX_W, SCREEN_PX_H];

/** Room around a card for its shadow, in screen pixels */
const SPRITE_MARGIN = 150;
const STAGING_BOX: Box = { x: 1190, y: 760, w: 650, h: 360 };

/** The staging card and the handover panel, for the words on show */
export function drawCards(content: StageContent): { staging: CardSprite; handover: CardSprite } {
  return {
    staging: sprite(STAGING_BOX, 60, (ctx) => paintStaging(ctx, content, STAGING_BOX)),
    handover: sprite(layout.card, 70, (ctx) => paintHandover(ctx, content, layout.card)),
  };
}

/** Draws a card into a canvas of its own: the card and its shadow, cut off at the screen's edges */
function sprite(box: Box, rise: number, paint: (ctx: CanvasRenderingContext2D) => void): CardSprite {
  const x = Math.max(0, box.x - SPRITE_MARGIN);
  const y = Math.max(0, box.y - SPRITE_MARGIN);
  const w = Math.min(SCREEN_PX_W, box.x + box.w + SPRITE_MARGIN) - x;
  const h = Math.min(SCREEN_PX_H, box.y + box.h + SPRITE_MARGIN) - y;
  const [image, ctx] = canvas(w, h);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.translate(-x, -y);
  paint(ctx);
  return { image, x, y, w, h, rise };
}

function lift(ctx: CanvasRenderingContext2D, box: Box, radius: number, fill: string): void {
  ctx.save();
  ctx.shadowColor = 'rgba(11,12,14,0.22)';
  ctx.shadowBlur = 90;
  ctx.shadowOffsetY = 36;
  ctx.fillStyle = fill;
  roundRect(ctx, box, radius);
  ctx.fill();
  ctx.restore();
}

/** The staging card: dark, bottom right, while the weekly demos run */
function paintStaging(ctx: CanvasRenderingContext2D, content: StageContent, box: Box): void {
  lift(ctx, box, 34, NIGHT);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `600 44px ${TEXT}`;
  ctx.fillText(fit(ctx, content.product, box.w - 96), box.x + 48, box.y + 70);
  ctx.fillStyle = '#A3A8B0';
  ctx.font = `400 30px ${TEXT}`;
  ctx.fillText(fit(ctx, content.staging.label, box.w - 96), box.x + 48, box.y + 122);
  content.staging.rows.forEach(([term, value], i) => {
    const y = box.y + 196 + i * 56;
    ctx.fillStyle = '#A3A8B0';
    ctx.font = `400 30px ${TEXT}`;
    ctx.fillText(fit(ctx, term, 170), box.x + 48, y);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `500 30px ${TEXT}`;
    ctx.fillText(fit(ctx, value, box.w - 300), box.x + 240, y);
  });
}

/** The handover panel: what the client gets, signed by the three of us */
function paintHandover(ctx: CanvasRenderingContext2D, content: StageContent, box: Box): void {
  lift(ctx, box, 40, '#FFFFFF');
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 2;
  roundRect(ctx, box, 40);
  ctx.stroke();
  const left = box.x + 56;
  const width = box.w - 112;
  ctx.fillStyle = INK;
  ctx.font = `600 54px ${DISPLAY}`;
  ctx.fillText(fit(ctx, content.product, width), left, box.y + 88);
  ctx.fillStyle = MUTED;
  ctx.font = `400 32px ${TEXT}`;
  ctx.fillText(fit(ctx, content.handover.label, width), left, box.y + 144);
  let y = box.y + 238;
  content.handover.items.forEach((item) => {
    ctx.fillStyle = DONE;
    ctx.beginPath();
    ctx.arc(left + 22, y, 22, 0, Math.PI * 2);
    ctx.fill();
    tick(ctx, left + 22, y, 9);
    ctx.fillStyle = INK_2;
    ctx.font = `500 33px ${TEXT}`;
    const lines = wrap(ctx, item, width - 70).slice(0, 2);
    lines.forEach((line, i) => ctx.fillText(line, left + 66, y + i * 42 + (lines.length > 1 ? -4 : 2)));
    y += lines.length > 1 ? 122 : 96;
  });
  ctx.fillStyle = ORANGE_INK;
  ctx.font = `600 70px ${HAND}`;
  ctx.fillText(SIGNATURE, left, box.y + box.h - 76);
}

/** Paper's tooth as a grey height map, tiled over a sheet as its bump */
export function drawGrain(size = 256): HTMLCanvasElement {
  const [el, ctx] = canvas(size, size);
  const image = ctx.createImageData(size, size);
  const rand = seeded(3);
  for (let i = 0; i < image.data.length; i += 4) {
    const v = 118 + Math.round(rand() * 40);
    image.data[i] = image.data[i + 1] = image.data[i + 2] = v;
    image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  return el;
}

/**
 * A soft dark rounded rectangle on a clear ground: the contact shadow under a sheet or the
 * laptop. Drawn through the canvas shadow (no `filter`, which Safari's canvas lacks).
 */
export function drawShadow(aspect: number, softness = 0.16, size = 256): HTMLCanvasElement {
  const w = size;
  const h = Math.max(32, Math.round(size / aspect));
  const [el, ctx] = canvas(w, h);
  const pad = Math.min(w, h) * (softness * 2 + 0.02);
  ctx.shadowColor = 'rgba(0,0,0,1)';
  ctx.shadowBlur = Math.min(w, h) * softness;
  // The shape itself is drawn off-canvas; only its shadow lands in view
  ctx.shadowOffsetX = w * 2;
  ctx.fillStyle = '#000';
  roundRect(ctx, { x: pad - w * 2, y: pad, w: w - pad * 2, h: h - pad * 2 }, Math.min(w, h) * 0.06);
  ctx.fill();
  return el;
}
