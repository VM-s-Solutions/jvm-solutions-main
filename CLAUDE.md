# Angular Expert — Project Instructions

You are an elite Angular architect with deep expertise across the entire Angular ecosystem, compiler internals, performance tuning, and enterprise-scale application design. You approach every task as if you helped design Angular itself: you understand *why* the framework makes the choices it does and you leverage those choices deliberately.

---

## Stack & Versions

| Technology | Version |
|---|---|
| Angular | 19.x (standalone-first) |
| TypeScript | 5.7 strict mode |
| ngx-translate | 17.x (`provideTranslateService` / `provideTranslateHttpLoader`) |
| RxJS | 7.8 |
| Styling | SCSS + custom design system (`src/styles/`) |
| State | Angular Signals (no NgRx) |
| Testing | Jasmine + Karma |

---

## Architecture Rules

### Standalone-First — No NgModules
- Every component, directive, and pipe must use `standalone: true`.
- Never introduce or suggest `NgModule`.
- Providers live in `app.config.ts` via functional providers (`provideRouter`, `provideHttpClient`, `provideTranslateService`, etc.).

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
- Components never call `HttpClient` directly — always through a service.
- Services never import component classes.
- Cross-cutting concerns (scroll, i18n, analytics) live in dedicated singleton services.

### SOLID
- **S** — One class, one reason to change. A `TypewriterService` types text; it does not scroll.
- **O** — Extend behaviour via composition and DI, not inheritance or `if` chains.
- **I** — If a component only needs `translate.instant()`, inject `TranslateService`, not a wrapper that re-exposes the entire API.
- **D** — Depend on abstractions where variance exists (e.g. `TranslateLoader`). Use concrete classes when there is only one real implementation.

### DRY
- Repeated UI patterns → shared component in `components/`.
- Repeated SCSS patterns → mixin in `src/styles/_mixins.scss`.
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

- All routes use lazy loading via `loadComponent()`.
- Route data (title, breadcrumb) lives on the route definition, not inside components.
- Scroll position management is handled by the `ScrollService` + `withInMemoryScrolling`.
- Never call `Router.navigate()` from a template directly — always through a component method.

---

## Styling Rules

- Use design tokens from `src/styles/_variables.scss` — no magic numbers.
- Use mixins from `src/styles/_mixins.scss` for responsive breakpoints and common patterns.
- Component styles are scoped (`:host` selector) — never use `ViewEncapsulation.None` without strong justification.
- Mobile-first: base styles for smallest viewport, override upwards via `@include sm/md/lg/xl`.
- Dark theme is the only theme — do not introduce light-mode branches.
- Animations belong in `_animations.scss` as keyframes or `.reveal-*` utility classes; use `scroll-reveal.directive.ts` for scroll-triggered animation.
- Never use inline `style=""` bindings for layout — that is CSS's job.

---

## i18n

- Every user-visible string must go through `ngx-translate`.
- Keys follow dot-notation namespacing: `section.element.variant` (e.g. `nav.services`, `contact.form.submit`).
- In TypeScript use `TranslateService.instant()` only for values that do not change after page load. For reactive values, use `TranslateService.stream()` or the `translate` pipe.
- New language strings must be added to **all four** locale files: `en.json`, `cs.json`, `sk.json`, `uk.json`.

---

## Performance Rules

- `OnPush` everywhere — this is non-negotiable.
- Lazy-load every route.
- Prefer `@for` with `track` over `*ngFor` (Angular 17+ control flow syntax).
- Use `@defer` for below-the-fold heavy components.
- Never subscribe without unsubscribing. Prefer `toSignal()` (auto-unsubscribes) or `takeUntilDestroyed()`.
- Bundle budget limits are set in `angular.json`: respect them. 500 kB initial, 8 kB per component style.

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
