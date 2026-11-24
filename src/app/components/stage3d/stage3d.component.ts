import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { ideaInitial } from '../../services/idea.service';
import { injectProductName } from '../../services/product-name';
import type { StageScene } from './stage-scene';
import { STAGE_FONTS, StageContent } from './stage-textures';

/** Every string the stage draws, in the order `toContent` reads them back */
const KEYS = [
  'paper.board.notes.who',
  'paper.board.notes.what',
  'paper.board.notes.limits',
  'paper.board.tags.nav',
  'paper.board.tags.search',
  'paper.board.tags.checklist',
  'paper.board.spec.label',
  'paper.board.spec.goals',
  'paper.board.spec.users',
  'paper.board.spec.constraints',
  'paper.board.spec.done',
  'paper.board.spec.price',
  'paper.board.spec.terms',
  'paper.board.app.home',
  'paper.board.app.inbox',
  'paper.board.app.team',
  'paper.board.app.settings',
  'paper.board.app.search',
  'paper.board.app.item1',
  'paper.board.app.item2',
  'paper.board.app.item3',
  'paper.board.app.item4',
  'paper.board.app.toast',
  'paper.board.staging.label',
  'paper.board.staging.link',
  'paper.board.staging.linkValue',
  'paper.board.staging.demo',
  'paper.board.staging.demoValue',
  'paper.board.staging.now',
  'paper.board.staging.nowValue',
  'paper.board.handover.label',
  'paper.board.handover.repo',
  'paper.board.handover.docs',
  'paper.board.handover.fixes',
  'paper.board.handover.critical',
] as const;

type Key = (typeof KEYS)[number];
type Strings = Readonly<Record<Key, string>>;

/** The scene starts loading once the stage is within this much of the viewport */
const NEAR = '100% 0px';

function isStrings(value: unknown): value is Strings {
  return typeof value === 'object' && value !== null && KEYS.every((key) => typeof (value as Record<string, unknown>)[key] === 'string');
}

function toContent(t: Strings, product: string): StageContent {
  return {
    product,
    initial: ideaInitial(product),
    notes: [t['paper.board.notes.who'], t['paper.board.notes.what'], t['paper.board.notes.limits']],
    tags: {
      nav: t['paper.board.tags.nav'],
      search: t['paper.board.tags.search'],
      checklist: t['paper.board.tags.checklist'],
    },
    spec: {
      label: t['paper.board.spec.label'],
      items: [
        t['paper.board.spec.goals'],
        t['paper.board.spec.users'],
        t['paper.board.spec.constraints'],
        t['paper.board.spec.done'],
      ],
      price: t['paper.board.spec.price'],
      terms: t['paper.board.spec.terms'],
    },
    app: {
      nav: [
        t['paper.board.app.home'],
        t['paper.board.app.inbox'],
        t['paper.board.app.team'],
        t['paper.board.app.settings'],
      ],
      search: t['paper.board.app.search'],
      items: [
        t['paper.board.app.item1'],
        t['paper.board.app.item2'],
        t['paper.board.app.item3'],
        t['paper.board.app.item4'],
      ],
      toast: t['paper.board.app.toast'],
    },
    staging: {
      label: t['paper.board.staging.label'],
      rows: [
        [t['paper.board.staging.link'], t['paper.board.staging.linkValue']],
        [t['paper.board.staging.demo'], t['paper.board.staging.demoValue']],
        [t['paper.board.staging.now'], t['paper.board.staging.nowValue']],
      ],
    },
    handover: {
      label: t['paper.board.handover.label'],
      items: [
        t['paper.board.handover.repo'],
        t['paper.board.handover.docs'],
        t['paper.board.handover.fixes'],
        t['paper.board.handover.critical'],
      ],
    },
  };
}

/** Fetches the faces the drawings use, with the text they will set, so the right subsets come */
async function loadFonts(content: StageContent): Promise<void> {
  const sample = [content.product, ...content.notes, ...content.spec.items, ...content.app.items].join(' ');
  await Promise.all(STAGE_FONTS.map((font) => document.fonts.load(font, `A ${sample}`).catch(() => undefined)));
}

/**
 * The 3D stage beside the paper section's steps: a sheet of paper with the visitor's app
 * sketched on it, the spec, and the laptop the sketch ends up on. Purely illustrative
 * (aria-hidden); the steps beside it are the content. three.js and the scene arrive in a lazy
 * chunk once the stage nears the viewport; until then, and where WebGL is missing, a paper
 * sheet drawn in CSS holds the place.
 */
@Component({
  selector: 'jvm-stage3d',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', '[class.is-ready]': 'ready()' },
  templateUrl: './stage3d.component.html',
  styleUrl: './stage3d.component.scss',
})
export class Stage3dComponent {
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  private readonly product = injectProductName();
  private readonly strings = toSignal(inject(TranslateService).stream([...KEYS]), { initialValue: null });
  private readonly content = computed(() => {
    const strings: unknown = this.strings();
    const product = this.product();
    return isStrings(strings) && product ? toContent(strings, product) : null;
  });

  /** The scene has drawn its first frame: the placeholder sheet steps aside */
  protected readonly ready = signal(false);
  /** The stage is near the viewport: time to fetch the scene */
  private readonly near = signal(false);

  private scene: StageScene | null = null;
  private progress = 0;
  private starting = false;
  private destroyed = false;

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const element = this.host.nativeElement;
      const nearby = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            this.near.set(true);
            nearby.disconnect();
          }
        },
        { rootMargin: NEAR },
      );
      nearby.observe(element);
      const sized = new ResizeObserver(() => this.scene?.resize(element.clientWidth, element.clientHeight));
      sized.observe(element);
      destroyRef.onDestroy(() => {
        nearby.disconnect();
        sized.disconnect();
      });
    });

    // Starts the scene once it is near and its words are known; later, redraws it for new words
    effect(() => {
      const content = this.content();
      if (!content || !this.near()) return;
      untracked(() => {
        if (this.scene) void this.update(content);
        else void this.start(content);
      });
    });

    destroyRef.onDestroy(() => {
      this.destroyed = true;
      this.scene?.dispose();
      this.scene = null;
    });
  }

  /** Scroll progress through the story, 0–1. Cheap to call every frame. */
  setProgress(progress: number): void {
    this.progress = progress;
    this.scene?.setProgress(progress);
  }

  private async start(content: StageContent): Promise<void> {
    if (this.starting) return;
    this.starting = true;
    try {
      const [{ StageScene, canRender }] = await Promise.all([import('./stage-scene'), loadFonts(content)]);
      if (this.destroyed || !canRender()) return;
      const element = this.host.nativeElement;
      // The words may have changed while the code was on its way
      const scene = new StageScene(this.canvas().nativeElement, this.content() ?? content);
      scene.resize(element.clientWidth, element.clientHeight);
      scene.setProgress(this.progress);
      this.scene = scene;
      this.ready.set(true);
    } catch {
      // No WebGL context, or the chunk failed to load: the placeholder sheet stays
      this.scene = null;
    }
  }

  private async update(content: StageContent): Promise<void> {
    await loadFonts(content);
    if (!this.destroyed && this.content() === content) this.scene?.setContent(content);
  }
}
