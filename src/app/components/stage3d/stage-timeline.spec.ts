import {
  BASE_T,
  Playback,
  SCREEN_W,
  SHEET_LONG,
  STAGE_RESTS,
  play,
  poseAt,
  screenCentre,
  stageAt,
  stageNear,
  storyShare,
  trackProgress,
} from './stage-timeline';

describe('stage timeline', () => {
  it('reads the scroll through the pinned track as 0–1', () => {
    expect(trackProgress(100, 4000, 1000)).toBe(0);
    expect(trackProgress(-1500, 4000, 1000)).toBe(0.5);
    expect(trackProgress(-9000, 4000, 1000)).toBe(1);
    expect(trackProgress(0, 800, 1000)).toBe(0);
  });

  it('splits the track into four chapters', () => {
    expect(stageAt(0)).toBe(0);
    expect(stageAt(0.26)).toBe(1);
    expect(stageAt(0.5)).toBe(2);
    expect(stageAt(0.76)).toBe(3);
    expect(stageAt(1)).toBe(3);
    expect(stageAt(-2)).toBe(0);
  });

  it('starts with the sketch flat on the desk and the laptop out of sight', () => {
    const pose = poseAt(0);
    expect(pose.sketch.pitch).toBeCloseTo(-Math.PI / 2);
    expect(pose.sketch.pos[1]).toBeLessThan(0.05);
    expect(pose.sketch.opacity).toBe(1);
    expect(pose.notesOut).toBe(0);
    expect(pose.laptopZ).toBeLessThan(-8);
    expect(pose.screen).toEqual({ rows: 0, checks: 0, staging: 0, panel: 0 });
  });

  it('lands the sketch exactly on the display, at the display’s size', () => {
    const pose = poseAt(0.66);
    const centre = screenCentre(pose.laptopZ, pose.lid);
    expect(pose.sketch.pos[0]).toBeCloseTo(centre[0]);
    expect(pose.sketch.pos[1]).toBeCloseTo(centre[1]);
    expect(pose.sketch.pos[2]).toBeCloseTo(centre[2] + 0.012);
    expect(pose.sketch.pitch).toBeCloseTo(Math.PI / 2 - pose.lid);
    expect(pose.sketch.scale[0] * SHEET_LONG).toBeCloseTo(SCREEN_W);
    expect(pose.sketch.bend).toBeCloseTo(0);
  });

  it('keeps the display above the deck once the lid is open', () => {
    const pose = poseAt(1);
    expect(screenCentre(pose.laptopZ, pose.lid)[1]).toBeGreaterThan(BASE_T + 1);
  });

  it('ends on the finished app with the handover panel in', () => {
    const pose = poseAt(1);
    expect(pose.sketch.opacity).toBe(0);
    expect(pose.screen).toEqual({ rows: 4, checks: 4, staging: 0, panel: 1 });
  });

  it('is the same going back as going forward', () => {
    expect(poseAt(0.57)).toEqual(poseAt(0.57));
    expect(poseAt(2)).toEqual(poseAt(1));
  });

  describe('playback', () => {
    const run = (from: number, target: number, seconds: number, step = 1 / 60): Playback => {
      let state: Playback = { at: from, speed: 0 };
      for (let t = 0; t < seconds; t += step) state = play(state, target, step);
      return state;
    };

    it('arrives at the rest and stops there', () => {
      expect(run(STAGE_RESTS[0], STAGE_RESTS[1], 6)).toEqual({ at: STAGE_RESTS[1], speed: 0 });
    });

    it('takes its time however far the scroll jumped', () => {
      const afterOneSecond = run(STAGE_RESTS[0], STAGE_RESTS[3], 1);
      expect(afterOneSecond.at).toBeLessThan(STAGE_RESTS[1]);
      expect(afterOneSecond.at).toBeGreaterThan(STAGE_RESTS[0]);
    });

    it('never passes its rest, whatever the frame length', () => {
      for (const step of [1 / 240, 1 / 60, 0.1]) {
        let state: Playback = { at: STAGE_RESTS[1], speed: 0 };
        for (let t = 0; t < 8; t += step) {
          state = play(state, STAGE_RESTS[2], step);
          expect(state.at).toBeLessThanOrEqual(STAGE_RESTS[2]);
        }
        expect(state.at).toBe(STAGE_RESTS[2]);
      }
    });

    it('plays backwards too', () => {
      expect(run(STAGE_RESTS[3], STAGE_RESTS[0], 10).at).toBe(STAGE_RESTS[0]);
    });

    it('names the chapter whose rest is nearest', () => {
      expect(STAGE_RESTS.map((rest) => stageNear(rest))).toEqual([0, 1, 2, 3]);
      expect(stageNear(0.5)).toBe(1);
      expect(stageNear(0.65)).toBe(2);
    });

    it('counts a quarter of the story per chapter', () => {
      expect(STAGE_RESTS.map((rest) => storyShare(rest))).toEqual([0.25, 0.5, 0.75, 1]);
      expect(storyShare(0)).toBe(0);
    });
  });
});
