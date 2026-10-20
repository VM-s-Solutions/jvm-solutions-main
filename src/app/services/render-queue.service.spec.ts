import { PendingTasks } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RenderQueueService } from './render-queue.service';

describe('RenderQueueService', () => {
  const deadline: IdleDeadline = { didTimeout: false, timeRemaining: () => 50 };
  let now: number;
  let nextId: number;
  let idle: Map<number, () => void>;
  let frames: Map<number, () => void>;

  /** Runs every callback waiting in `queue` (the ones they ask for wait for the next round) */
  function flush(queue: Map<number, () => void>): void {
    const due = [...queue.values()];
    queue.clear();
    due.forEach((run) => run());
  }

  const idlePeriod = (): void => flush(idle);
  const frame = (): void => flush(frames);

  /** Lets `ms` pass: the clock the queue reads and its timers */
  function pass(ms: number): void {
    now += ms;
    jasmine.clock().tick(ms);
  }

  /** One idle period, then the frame after it */
  function turn(): void {
    idlePeriod();
    frame();
  }

  beforeEach(() => {
    now = 1000;
    nextId = 0;
    idle = new Map();
    frames = new Map();
    jasmine.clock().install();
    spyOn(performance, 'now').and.callFake(() => now);
    spyOn(window, 'requestIdleCallback').and.callFake((run: IdleRequestCallback) => {
      const id = ++nextId;
      idle.set(id, () => run(deadline));
      return id;
    });
    spyOn(window, 'cancelIdleCallback').and.callFake((id: number) => {
      idle.delete(id);
    });
    spyOn(window, 'requestAnimationFrame').and.callFake((run: FrameRequestCallback) => {
      const id = ++nextId;
      frames.set(id, () => run(now));
      return id;
    });
    spyOn(window, 'cancelAnimationFrame').and.callFake((id: number) => {
      frames.delete(id);
    });
    TestBed.configureTestingModule({});
  });

  afterEach(() => jasmine.clock().uninstall());

  it('runs one job per idle period, and the next only after the frame that shows it', () => {
    const queue = TestBed.inject(RenderQueueService);
    const ran: string[] = [];
    queue.add(() => ran.push('paper'));
    queue.add(() => ran.push('trades'));

    idlePeriod();
    expect(ran).toEqual(['paper']);

    idlePeriod();
    expect(ran).toEqual(['paper']);

    frame();
    idlePeriod();
    expect(ran).toEqual(['paper', 'trades']);
  });

  it('lets a lower order go first, whenever it was queued', () => {
    const queue = TestBed.inject(RenderQueueService);
    const ran: string[] = [];
    queue.add(() => ran.push('footer'), 1);
    queue.add(() => ran.push('paper'));
    queue.add(() => ran.push('trades'));

    turn();
    turn();
    turn();

    expect(ran).toEqual(['paper', 'trades', 'footer']);
  });

  it('waits out a hold', () => {
    const queue = TestBed.inject(RenderQueueService);
    const run = jasmine.createSpy('run');
    queue.hold(1800);
    queue.add(run);

    pass(1799);
    idlePeriod();
    expect(run).not.toHaveBeenCalled();

    pass(1);
    idlePeriod();
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('waits for the visitor to pause scrolling', () => {
    const queue = TestBed.inject(RenderQueueService);
    const run = jasmine.createSpy('run');
    queue.add(run);

    window.dispatchEvent(new Event('scroll'));
    idlePeriod();
    expect(run).not.toHaveBeenCalled();

    pass(2000);
    idlePeriod();
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('waits while code is still loading, which would render whenever it lands', () => {
    const queue = TestBed.inject(RenderQueueService);
    const loaded = TestBed.inject(PendingTasks).add();
    const run = jasmine.createSpy('run');
    queue.add(run);

    pass(1000);
    idlePeriod();
    expect(run).not.toHaveBeenCalled();

    loaded();
    pass(1000);
    idlePeriod();
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('still runs a job for a visitor who never pauses', () => {
    const queue = TestBed.inject(RenderQueueService);
    const run = jasmine.createSpy('run');
    queue.add(run);

    for (let i = 0; i < 300 && run.calls.count() === 0; i++) {
      pass(100);
      window.dispatchEvent(new Event('scroll'));
      idlePeriod();
    }

    expect(run).toHaveBeenCalledTimes(1);
  });

  it('drops a job that is called off', () => {
    const queue = TestBed.inject(RenderQueueService);
    const run = jasmine.createSpy('run');
    const callOff = queue.add(run);

    callOff();
    turn();
    pass(10000);
    turn();

    expect(run).not.toHaveBeenCalled();
  });

  it('starts only once the window has loaded', () => {
    spyOnProperty(document, 'readyState', 'get').and.returnValue('loading');
    const queue = TestBed.inject(RenderQueueService);
    const run = jasmine.createSpy('run');
    queue.add(run);

    idlePeriod();
    expect(run).not.toHaveBeenCalled();

    window.dispatchEvent(new Event('load'));
    idlePeriod();
    expect(run).toHaveBeenCalledTimes(1);
  });
});
