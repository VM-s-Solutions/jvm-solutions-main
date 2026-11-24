/**
 * The paper-to-laptop scene as a pure function of the scroll progress: every pose on stage
 * (sheets, notes, laptop, lid, camera, what the screen shows) follows from one number, so
 * scrubbing back plays it in reverse. No three.js in here; the scene applies these numbers.
 * Units are decimetres: an A4 sheet is 2.1 × 2.97, the laptop 3.12 wide. Y is up, the desk is y = 0.
 */

export type Vec3 = readonly [number, number, number];

const STAGES = [0, 1, 2, 3] as const;

/** The four chapters: 0 sketch, 1 write, 2 show, 3 hand over. */
export type PaperStage = (typeof STAGES)[number];

export const STAGE_COUNT = STAGES.length;

// ─── The objects' measures (the scene builds them to these) ───────────────────
export const SHEET_LONG = 2.97;
export const SHEET_SHORT = 2.1;
export const NOTE_SIZE = 0.86;

export const LAPTOP_W = 3.12;
export const LAPTOP_D = 2.2;
export const BASE_T = 0.11;
export const LID_T = 0.045;
/** The hinge line, in the laptop's own space: behind the base's centre, on its top face */
export const HINGE_Z = -1.06;
/** The display: 16:10, centred on the lid this far up from the hinge */
export const SCREEN_W = 2.94;
export const SCREEN_H = SCREEN_W / 1.6;
export const SCREEN_Y = 1.13;
/** How far the display's glass sits in front of the lid's inner face */
const SCREEN_Z = 0.006;

// ─── Poses at rest ────────────────────────────────────────────────────────────
const SKETCH_DESK: Vec3 = [-0.35, 0.012, 0.35];
const SKETCH_YAW = -0.1;
const SPEC_DESK: Vec3 = [1.05, 0.045, 0.2];
const SPEC_YAW = 0.14;
const SPEC_FROM: Vec3 = [13, 0.03, 2];
const SPEC_FROM_YAW = 0.55;
const SPEC_AWAY: Vec3 = [14, 0.03, -0.6];
const LAPTOP_REST_Z = -0.25;
const LAPTOP_FROM_Z = -9;
const LID_CLOSED = 0.02;
const LID_OPEN = 1.88; // 108° from the deck

const CAM_DESK: Vec3 = [0.3, 9.7, 5];
const CAM_DESK_TARGET: Vec3 = [0.3, 0, 0.3];
const CAM_SHOW: Vec3 = [2.4, 3.5, 8.3];
const CAM_SHOW_TARGET: Vec3 = [0, 0.9, -0.5];
const CAM_FRONT: Vec3 = [0.41, 2.19, 9.4];
const CAM_FRONT_TARGET: Vec3 = [0, 0.9, -0.6];

/** Where each sticky note rests beside the sketch, and how it is turned */
export const NOTE_RESTS: readonly { readonly pos: Vec3; readonly yaw: number }[] = [
  { pos: [1.76, 0.02, -0.62], yaw: 0.09 },
  { pos: [2.02, 0.02, 0.4], yaw: -0.07 },
  { pos: [1.66, 0.02, 1.36], yaw: 0.05 },
];

export interface SheetPose {
  readonly pos: Vec3;
  /** Rotation about X: −π/2 lies face up on the desk, towards 0 it stands */
  readonly pitch: number;
  /** Rotation about Y, applied after the pitch */
  readonly yaw: number;
  /** Width and height scale, so the sketch's drawing ends up exactly the display's size */
  readonly scale: readonly [number, number];
  /** How far the sheet bows mid-flight, 0–1 */
  readonly bend: number;
  /** How much of its resting curl is left, 1 on the desk, 0 pressed on the display */
  readonly curl: number;
  readonly opacity: number;
}

/** What the laptop's screen shows. Rows and checks are whole numbers: the screen is redrawn only when one changes */
export interface ScreenFrame {
  /** Checklist rows on show, 0–4 */
  readonly rows: number;
  /** Rows ticked off, 0–4 */
  readonly checks: number;
  /** The staging card, 0 hidden – 1 fully in. Glides: the scene moves a card of its own, nothing is redrawn */
  readonly staging: number;
  /** The handover panel, 0 hidden – 1 fully in, gliding the same way */
  readonly panel: number;
}

export interface StagePose {
  readonly camera: Vec3;
  readonly target: Vec3;
  readonly sketch: SheetPose;
  readonly spec: { readonly pos: Vec3; readonly yaw: number };
  /** The notes' drift off the desk, 0 at rest, 1 gone */
  readonly notesOut: number;
  readonly laptopZ: number;
  /** The lid's opening angle from the deck, in radians */
  readonly lid: number;
  readonly screen: ScreenFrame;
}

export function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t));
}

export function smoothstep(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

/** A softer ease for long moves: slow out of rest, slow into rest */
function smootherstep(t: number): number {
  const x = clamp01(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
}

/** Progress through the window [from, to] of the scroll, eased */
export function span(p: number, from: number, to: number): number {
  return smootherstep((p - from) / (to - from));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerp3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

/** How far the visitor has scrolled through the pinned track: 0 at its top, 1 at its end. */
export function trackProgress(top: number, height: number, viewport: number): number {
  const run = height - viewport;
  return run > 0 ? clamp01(-top / run) : 0;
}

/** The chapter on show at a scroll progress. */
export function stageAt(progress: number): PaperStage {
  const index = Math.floor(clamp01(progress) * STAGE_COUNT);
  return STAGES[Math.min(STAGE_COUNT - 1, index)];
}

/**
 * Where on the timeline each chapter's picture is complete: the sketch with its notes, the spec
 * landed, the app live on the display, the handover signed. The story plays from one to the next
 * instead of following the scroll, so it never stops half-way through a move.
 */
export const STAGE_RESTS: readonly number[] = [0.1, 0.38, 0.79, 1];

/** The chapter whose rest the playback is nearest to: what the step list shows. */
export function stageNear(progress: number): PaperStage {
  let nearest: PaperStage = 0;
  for (const stage of STAGES) {
    if (Math.abs(STAGE_RESTS[stage] - progress) < Math.abs(STAGE_RESTS[nearest] - progress)) nearest = stage;
  }
  return nearest;
}

/** How much of the story is told at a point of the timeline: a quarter per chapter's rest, for the progress line. */
export function storyShare(progress: number): number {
  const p = clamp01(progress);
  let from = 0;
  for (const stage of STAGES) {
    const to = STAGE_RESTS[stage];
    if (p <= to) return (stage + (to > from ? (p - from) / (to - from) : 1)) / STAGE_COUNT;
    from = to;
  }
  return 1;
}

/** Top speed of the playback, in timeline per second: the longest move (spec → live app) takes about 2 s */
const PLAY_SPEED = 0.28;
/** How quickly the playback gets up to speed, in timeline per second squared */
const PLAY_ACCEL = 0.9;
/** Nearing its rest the playback slows in proportion to what is left (per second) */
const PLAY_SETTLE = 3.5;
/** Closer than this, and slower than this, it has arrived */
const PLAY_DONE = 0.0005;

export interface Playback {
  readonly at: number;
  readonly speed: number;
}

/**
 * One frame of playback towards `target`: it gathers speed, never exceeds PLAY_SPEED however far
 * the scroll has jumped, and eases into its rest. Returns the target itself once it has arrived.
 */
export function play(from: Playback, target: number, seconds: number): Playback {
  const gap = target - from.at;
  const wanted = Math.sign(gap) * Math.min(PLAY_SPEED, Math.abs(gap) * PLAY_SETTLE);
  const change = Math.sign(wanted - from.speed) * Math.min(Math.abs(wanted - from.speed), PLAY_ACCEL * seconds);
  // Braking is never delayed: only speeding up is limited, so the playback can't overshoot its rest
  const speed = Math.abs(wanted) < Math.abs(from.speed) && Math.sign(wanted) === Math.sign(from.speed) ? wanted : from.speed + change;
  const at = from.at + speed * seconds;
  const arrived = Math.abs(target - at) < PLAY_DONE || Math.sign(target - at) !== Math.sign(gap);
  return arrived ? { at: target, speed: 0 } : { at, speed };
}

/** The centre of the display in the world, for a laptop at `laptopZ` with its lid at `lid` */
export function screenCentre(laptopZ: number, lid: number): Vec3 {
  const pitch = Math.PI / 2 - lid;
  const cos = Math.cos(pitch);
  const sin = Math.sin(pitch);
  // The lid's (0, SCREEN_Y, SCREEN_Z) turned about X by the pitch, from the hinge
  return [0, BASE_T + SCREEN_Y * cos - SCREEN_Z * sin, laptopZ + HINGE_Z + SCREEN_Y * sin + SCREEN_Z * cos];
}

function steps(t: number, count: number): number {
  return Math.min(count, Math.floor(clamp01(t) * (count + 1)));
}

function screenFrame(p: number): ScreenFrame {
  const panel = span(p, 0.84, 0.94);
  return {
    rows: steps((p - 0.66) / 0.13, 4),
    checks: steps((p - 0.8) / 0.1, 4),
    // In once the app is live, out again as the handover panel takes its place
    staging: span(p, 0.69, 0.75) * (1 - span(p, 0.83, 0.89)),
    panel,
  };
}

/** Every pose on stage at a scroll progress of 0–1. */
export function poseAt(progress: number): StagePose {
  const p = clamp01(progress);

  const laptopZ = lerp(LAPTOP_FROM_Z, LAPTOP_REST_Z, span(p, 0.4, 0.57));
  const lid = lerp(LID_CLOSED, LID_OPEN, span(p, 0.45, 0.62));

  const specIn = span(p, 0.2, 0.36);
  const specOut = span(p, 0.44, 0.58);
  /** How much of the spec's weight is on the sketch: 0 before it lands and after it has left */
  const covered = smoothstep((specIn - 0.55) / 0.35) * (1 - smoothstep(specOut / 0.4));

  // The sketch leaves the desk, stands up and lands on the display
  const fly = span(p, 0.5, 0.66);
  const land = screenCentre(laptopZ, lid);
  const lift = Math.sin(fly * Math.PI) * 0.9;
  const flat = lerp3(SKETCH_DESK, land, fly);
  const sketch: SheetPose = {
    pos: [flat[0], flat[1] + lift, flat[2] + 0.012 * fly],
    pitch: lerp(-Math.PI / 2, Math.PI / 2 - lid, fly),
    yaw: SKETCH_YAW * (1 - fly),
    scale: [lerp(1, SCREEN_W / SHEET_LONG, fly), lerp(1, SCREEN_W / SHEET_LONG, fly)],
    bend: Math.sin(fly * Math.PI),
    // Under the spec the sketch lies flat, or its curled corner would poke through the sheet on top
    curl: (1 - fly) * (1 - covered),
    opacity: 1 - smoothstep((p - 0.655) / 0.055),
  };

  const specPos = specOut > 0 ? lerp3(SPEC_DESK, SPEC_AWAY, specOut) : lerp3(SPEC_FROM, SPEC_DESK, specIn);
  const specYaw = lerp(lerp(SPEC_FROM_YAW, SPEC_YAW, specIn), -0.3, specOut);

  const toShow = span(p, 0.4, 0.66);
  const toFront = span(p, 0.72, 1);
  const camera = lerp3(lerp3(CAM_DESK, CAM_SHOW, toShow), CAM_FRONT, toFront);
  const target = lerp3(lerp3(CAM_DESK_TARGET, CAM_SHOW_TARGET, toShow), CAM_FRONT_TARGET, toFront);

  return {
    camera,
    target,
    sketch,
    spec: { pos: specPos, yaw: specYaw },
    notesOut: span(p, 0.19, 0.34),
    laptopZ,
    lid,
    screen: screenFrame(p),
  };
}
