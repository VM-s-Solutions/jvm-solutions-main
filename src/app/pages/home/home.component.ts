import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AskedComponent } from '../../components/asked/asked.component';
import { ComposeComponent } from '../../components/compose/compose.component';
import { CostComponent } from '../../components/cost/cost.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { PaperComponent } from '../../components/paper/paper.component';
import { TeamTrioComponent } from '../../components/team-trio/team-trio.component';
import { TradesComponent } from '../../components/trades/trades.component';
import { IdeaService } from '../../services/idea.service';
import { KeyboardService } from '../../services/keyboard.service';
import { RenderQueueService } from '../../services/render-queue.service';

/** The deferred sections below the hero: one @defer block each in the template */
const SECTIONS = 6;

/**
 * The hero's entrance, counted from the page's creation: its lead, buttons and chat rise for
 * 1.1s after delays of up to 0.45s, the headline's words a stagger apart, and a move from
 * another page slides in alongside (0.6s). Nothing below renders before it's over.
 */
const ENTRANCE_MS = 1800;

/** The faces only the deferred sections use: the board's handwriting, the board's and demos' code */
const LATE_FONTS = ['600 1em Caveat', '500 1em "JetBrains Mono"'] as const;

/** Text set in those faces, so the subsets the language needs (latin-ext, cyrillic) come too */
const LATE_FONT_TEXT = [
  'paper.board.notes.who',
  'paper.board.notes.what',
  'paper.board.notes.limits',
  'paper.board.tags.nav',
  'paper.board.tags.search',
  'paper.board.tags.checklist',
  'trades.prompt.label',
] as const;

/**
 * Fetches the late faces before their sections render: a browser fetches a face only once
 * text uses it, so the board's notes would first draw in a fallback and re-wrap when Caveat
 * lands. A Latin letter keeps the latin subset in (the signature and the code use it in every
 * language). Best effort: before fonts.css applies nothing matches, and the faces load on use.
 */
function warmFonts(text: string): void {
  const sample = `A ${text}`;
  for (const font of LATE_FONTS) void document.fonts?.load(font, sample).catch(() => undefined);
}

/**
 * The landing page: the chat hero, then the idea goes on paper, the four trades, the
 * three of us, what it costs, two common questions and the composer. Everything below the
 * hero renders one section per idle moment once the hero has made its entrance, a screen
 * before the visitor reaches it, or at the first Tab.
 */
@Component({
  selector: 'jvm-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeroComponent,
    PaperComponent,
    TradesComponent,
    TeamTrioComponent,
    CostComponent,
    AskedComponent,
    ComposeComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected readonly tabbed = inject(KeyboardService).tabbed;
  /** How many of the deferred sections the render queue has let in, top down */
  protected readonly ready = signal(0);

  constructor() {
    const queue = inject(RenderQueueService);
    const translate = inject(TranslateService);
    const idea = inject(IdeaService);
    const text = (key: string): string => {
      const value: unknown = translate.instant(key);
      return typeof value === 'string' ? value : '';
    };

    queue.hold(ENTRANCE_MS);
    const callOffs = [
      // The first idle moment fetches the late faces, so they're in by the time their sections render
      queue.add(() => warmFonts([...LATE_FONT_TEXT.map(text), idea.name()].join(' '))),
      // Then one section per idle moment, top down
      ...Array.from({ length: SECTIONS }, () => queue.add(() => this.ready.update((n) => n + 1))),
    ];
    inject(DestroyRef).onDestroy(() => callOffs.forEach((callOff) => callOff()));
  }
}
