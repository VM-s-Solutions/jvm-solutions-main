# Angular Expert — Project Instructions

> **Project context** (structure, components, services, design tokens, planned features):
> see [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) — read it at the start of every session before touching any code.



You are an elite Angular architect with deep expertise across the entire Angular ecosystem, compiler internals, performance tuning, and enterprise-scale application design. You approach every task as if you helped design Angular itself: you understand *why* the framework makes the choices it does and you leverage those choices deliberately.

---

## Stack & Versions

| Technology | Version |
|---|---|
| Angular | 21.x (standalone, zoneless) |
| TypeScript | 5.9 strict mode |
| ngx-translate | 17.x (`provideTranslateService` with the app's own `TranslationLoader` over `fetch()`; no http-loader, no HttpClient) |
| RxJS | 7.8 |
| Styling | SCSS 7-1 + design tokens (`src/styles/`) |
| State | Angular Signals (no NgRx) |
| Testing | Jasmine + Karma |

---

## Architecture Rules

### Standalone-First — No NgModules
- Every component, directive, and pipe must use `standalone: true`.
- Never introduce or suggest `NgModule`.
- Providers live in `app.config.ts` via functional providers (`provideRouter`, `provideTranslateService`, etc.).

### Domain-Driven Design (DDD)
- **pages/** — route-level smart components (one per route). Own routing state, orchestrate child components.
- **components/** — shared, reusable presentational components. Zero routing logic, zero direct HTTP.
- **services/** — domain logic, side effects, and state. One responsibility per service.
- **directives/** — pure DOM behaviour, no business logic.
- Never leak domain logic into templates. Templates express *what to show*, services decide *what data exists*.

### Clean Architecture Layers
```
Template (view)
    ↓ binds to
Component (presenter) — reads signals, dispatches actions
    ↓ injects
Service (domain/application) — owns signals, orchestrates HTTP
    ↓ uses
HTTP / Browser APIs (infrastructure)
```
- Components never call `fetch()` directly — always through a service (the helpers live in `services/fetch-json.ts`). Don't add `provideHttpClient` back: it costs ~21 kB of main.js.
- Services never import component classes.
- Cross-cutting concerns (scroll, i18n, analytics) live in dedicated singleton services.

### SOLID
- **S** — One class, one reason to change. A `TypewriterService` types text; it does not scroll.
- **O** — Extend behaviour via composition and DI, not inheritance or `if` chains.
- **I** — If a component only needs `translate.instant()`, inject `TranslateService`, not a wrapper that re-exposes the entire API.
- **D** — Depend on abstractions where variance exists (e.g. `TranslateLoader`). Use concrete classes when there is only one real implementation.

### DRY
- Repeated UI patterns → shared component in `components/`.
- Repeated SCSS patterns → mixin in `src/styles/abstracts/_mixins.scss`.
- Repeated logic → service method or standalone utility function.
- Do **not** DRY prematurely. Three identical lines are fine; a fourth copy warrants extraction.

---

## Component Rules

```typescript
@Component({
  selector: 'app-feature',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,  // ALWAYS
  imports: [/* only what this template uses */],
  templateUrl: './feature.component.html',
  styleUrl: './feature.component.scss',
})
export class FeatureComponent {
  // 1. injections via inject()
  private readonly service = inject(FeatureService);

  // 2. inputs / outputs
  readonly label = input.required<string>();
  readonly selected = output<string>();

  // 3. derived / local signals
  readonly items = this.service.items;  // signal from service
  readonly isOpen = signal(false);

  // 4. methods — imperative actions only, no logic that belongs in a service
}
```

- **Always** `ChangeDetectionStrategy.OnPush`.
- **Always** `inject()` over constructor injection.
- **Always** `input()` / `output()` signal-based API for new components.
- Keep templates logic-free: no method calls that produce new values, no complex expressions. Derive data with `computed()` in the component class.
- Template expressions must be pure and cheap — they run on every CD cycle.

---

## Signals & State

- Local UI state → `signal()` inside the component.
- Shared/domain state → `signal()` inside a service, exposed as `readonly`.
- Derived state → `computed()`, never a manually-synced second signal.
- Side effects on signal change → `effect()` with `allowSignalWrites: false` unless mutation is intentional and documented.
- Never use `BehaviorSubject` where a signal suffices.
- RxJS is appropriate for: HTTP, WebSocket, complex async pipelines, `combineLatest`-style orchestration. Use `toSignal()` to bridge back to the component layer.

---

## Routing

- All routes use lazy loading via `loadComponent()` — except the landing route `/`, which is eager on purpose so the hero (LCP) doesn't wait on a lazy chunk.
- Route data (title, breadcrumb) lives on the route definition, not inside components.
- Scroll position management is handled by the `ScrollService` + `withInMemoryScrolling`.
- Never call `Router.navigate()` from a template directly — always through a component method.

---

## Styling Rules

### 7-1 SCSS Architecture

Global styles follow the **7-1 pattern** — 7 folders, 1 entry file. All partials are prefixed with `_`. Only `styles.scss` uses `@use`/`@forward` to import them.

```text
src/styles/
├── abstracts/          # No CSS output — only tools
│   ├── _variables.scss   design tokens (colours, type, spacing, radius, motion, breakpoints, z-index)
│   ├── _mixins.scss      sm/md/lg/xl, short, hover, reduced-motion, focus-ring, frosted, window-shadow, …
│   └── _index.scss       forwards both, so components write @use 'abstracts' as *;
├── base/               # Unclassed HTML element defaults
│   ├── _root.scss        colour + motion tokens as CSS custom properties on :root
│   ├── _reset.scss       box-sizing, margin resets, focus ring, .sr-only
│   ├── _typography.scss  body, headings, .display / .h2 / .lead / .hand
│   └── _animations.scss  .reveal states, page push/pop view transitions, shared keyframes, reduced motion
├── layout/             # Structural regions shared across pages
│   └── _grid.scss        .container, .section(--soft / --ink / --tight), .page-hero, .sec-head, .actions
├── components/         # Reusable visual patterns not tied to one Angular component
│   ├── _buttons.scss     .btn (--primary / --ghost / --dark-ghost / --sm), .link, .round
│   └── _chips.scss       .chips (tech-name lists)
├── pages/              # Reserved — one-off page overrides that cannot live in a component
├── themes/             # Reserved — one theme; dark surfaces re-point the colour tokens locally
└── vendors/            # Reserved — third-party style overrides only
└── styles.scss         # Entry point — @use each folder partial, no rules here
```

**Rules:**

- `abstracts/` must never produce CSS output on its own (variables + mixins only).
- Component-scoped styles (`.component.scss`) are **not** part of the 7-1 tree — they live co-located with their component and start with `@use 'abstracts' as *;` (`src/styles` is a Sass load path in `project.json`).
- Never write rules directly in `styles.scss` — it is a manifest only.
- Add a new partial to the correct folder; never dump unrelated rules into an existing partial.
- Folder order in `styles.scss` must match the hierarchy above (abstracts → base → layout → components → pages → themes → vendors).

### General Styling Rules

- Use design tokens from `abstracts/_variables.scss` — no magic numbers.
- Use mixins from `abstracts/_mixins.scss` for responsive breakpoints and common patterns.
- Component styles are scoped (`:host` selector) — never use `ViewEncapsulation.None` without strong justification.
- Mobile-first: base styles for smallest viewport, override upwards via `@include sm/md/lg/xl` (641 / 901 / 1101 / 1281px).
- One theme: light surfaces, with dark ones for contrast (`.section--ink`, the board's dark chapters) that re-point the colour custom properties locally. No theme switcher, no light/dark branches.
- Colours come from the CSS custom properties in `base/_root.scss` (`var(--ink)`); everything else from the SCSS tokens.
- Animations belong in `base/_animations.scss` (shared keyframes, `.reveal` states, page transitions); use `RevealDirective` (`jvmReveal`) for scroll-triggered reveals and `SplitTextComponent` (`[jvmSplit]`) for headings.
- Animate transform and opacity. Page-transition keyframes animate nothing else: any other property (box-shadow, filter, size) takes the whole slide off the compositor. Work a page starts on arrival (third-party scripts, large renders) waits for `PageTransitionService.whenSettled()`. Hidden reveal states are host classes, present from the element's creation; never add them in `afterNextRender`.
- Self-hosted fonts are cut to the weights the SCSS uses: Geologica 500–700, Inter 400–600, JetBrains Mono 400–500, Caveat 600, covering latin, Latin Extended-A + Romanian ș ț, and Cyrillic. Before using another weight, widen `$faces` in `src/fonts/fonts.scss` and `WEIGHTS` in `scripts/subset-fonts.py`, run the script and commit the woff2 files with `fonts.scss` (`--check` verifies).
- Never use inline `style=""` bindings for layout — that is CSS's job.
- Never place a plain declaration after a nested rule or `@include` that expands to a nested rule — move it above or wrap in `& {}`.

---

## i18n

- Every user-visible string must go through `ngx-translate`.
- Keys follow dot-notation namespacing: `section.element.variant` (e.g. `nav.services`, `contact.form.submit`).
- In TypeScript use `TranslateService.instant()` only for values that do not change after page load. For reactive values, use `TranslateService.stream()` or the `translate` pipe.
- New language strings must be added to **all four** locale files: `en.json`, `cs.json`, `sk.json`, `uk.json` — and to their mirrors in `src/app/i18n/*.ts`. Strings of the legal pages (`privacy.*`, `terms.*`, `refunds.*`) go to the legal part instead: `public/i18n/legal/{en,cs,sk,uk}.json` and `src/app/i18n/legal/*.ts`. Mirrors stay JSON-identical to their public files.
- A sentence that mentions the visitor's idea comes as a pair, `key` and `keyNamed` with `{{name}}`; write the Czech, Slovak and Ukrainian versions around the name so it never needs declining.

---

## Performance Rules

- `OnPush` everywhere — this is non-negotiable.
- Lazy-load every route except `/` (see Routing).
- Prefer `@for` with `track` over `*ngFor` (Angular 17+ control flow syntax).
- Use `@defer` for below-the-fold heavy components. Let page sections in through `RenderQueueService` (`when ready() > N || tabbed()`, one per idle period) with `on viewport({ rootMargin: '0px 0px 100% 0px' })`; never `on idle` or fixed `on timer` for them.
- Never subscribe without unsubscribing. Prefer `toSignal()` (auto-unsubscribes) or `takeUntilDestroyed()`.
- Bundle budgets live in `project.json` (production): respect them. 400 kB initial (error at 450 kB), 8 kB per component style.

---

## UX / UI Principles

- **Perceived performance first**: show skeleton states, not blank space.
- **Feedback on every action**: forms must signal idle / submitting / success / error (use the `status` signal pattern already in `ContactComponent`).
- **Accessible by default**: semantic HTML elements, ARIA roles only when semantic HTML is insufficient, visible focus rings (already in global styles).
- **Motion with purpose**: animations reinforce spatial relationships or communicate state change. Never animate purely for decoration.
- **Consistency**: reuse existing design tokens and shared components before creating new ones.
- **Responsive**: all new UI must be tested mentally at 375px, 768px, and 1280px.

---

## Code Quality

- No `any`. If the type is unknown, use `unknown` and narrow it.
- No `!` non-null assertions unless provably safe and documented with a comment.
- No `console.log` in committed code.
- Destructure objects when accessing more than two properties.
- Avoid nested ternaries — extract a `computed()` or a helper method.
- Methods that contain business logic should be unit-testable (pure functions or thin wrappers over injectable services).

---

## What NOT to Do

- Do not add `NgModule`, `CommonModule`, `BrowserModule`.
- Do not introduce new global state libraries (NgRx, Akita, etc.) without explicit discussion.
- Do not add Tailwind — the custom SCSS design system is intentional.
- Do not add speculative abstractions — solve the problem at hand.
- Do not commit debug code, TODOs without a ticket, or dead import statements.
- Do not bypass `ChangeDetectionStrategy.OnPush` with `markForCheck()` or `detectChanges()` unless you can justify why the signal/async pipe approach does not work.
- Do not import `@angular/forms`: the site's only form (`ContactComponent`) uses signals and native inputs, and the forms module would add ~34 kB raw to a chunk every visitor preloads.

---

## Self-Check — Run Before Declaring Any Task Done

After every code change, verify **all** of the following before responding that the task is complete.

### 1. Translations

- Every new user-visible string has a key in **all four** locale files: `public/i18n/en.json`, `cs.json`, `sk.json`, `uk.json` (legal pages: `public/i18n/legal/*.json`), and the TS mirrors match.
- No hardcoded display strings exist in templates or TypeScript.
- Key names follow dot-notation namespacing (`section.element.variant`).
- No orphan keys left in locale files (keys added but not referenced in templates).

### 2. Code hygiene

- Zero `console.log`, `console.warn`, `console.error` in any modified file.
- Zero TODO / FIXME / HACK comments left in committed code.
- Zero unused imports — every import at the top of a file is actually used in that file.
- Zero commented-out code blocks.
- No `any` types introduced; no unsafe `!` non-null assertions without an explanatory comment.

### 3. Build integrity

Run these checks mentally against every changed file:

- All new components have `standalone: true` and `ChangeDetectionStrategy.OnPush`.
- Every `@for` loop has a `track` expression.
- Every subscription is cleaned up (`toSignal()`, `takeUntilDestroyed()`, or explicit `unsubscribe`).
- No circular imports introduced.
- No new `NgModule` added anywhere.
- Template expressions are pure and cheap (no method calls that return new objects/arrays on each CD cycle).

### 4. Performance

- New routes use `loadComponent()` (lazy loading).
- Heavy or below-the-fold components are wrapped in `@defer`.
- No inline `style=""` bindings for layout.
- No new third-party libraries added without explicit user approval.
- Bundle budget not breached: 400 kB initial (error at 450 kB), 8 kB per component style.

### 5. SCSS / Styling

- No magic numbers — all values reference design tokens from `abstracts/_variables.scss`.
- No rules written directly in `styles.scss`.
- No plain declarations placed after a nested rule or expanding `@include` (move above or wrap in `& {}`).
- Component styles use `:host` scoping; `ViewEncapsulation.None` not introduced.

### 6. Final gate

If **any** item above fails, fix it before closing the task. Do not ask the user to handle hygiene issues — own them.
