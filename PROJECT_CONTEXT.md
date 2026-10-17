# Project Context — JVM Solutions

Software agency website for a 3-person team (Janis, Vít, Michael) based in Czech Republic. Sells frontend, backend, mobile, and AI automation services. Dark-theme, portfolio-style site.

---

## Pages & Routes

| Route | Component | Lazy |
|---|---|---|
| `/` | `HomeComponent` | no — eager on purpose (landing page, keeps the hero/LCP off a lazy-chunk round trip) |
| `/contact` | `ContactComponent` | yes |
| `/about` | `AboutComponent` | yes |
| `/faq` | `FaqPageComponent` | yes |
| `/pricing` | `PricingComponent` | yes |
| `/privacy` | `PrivacyComponent` | yes |
| `/terms` | `TermsComponent` | yes |
| `/refunds` | `RefundsComponent` | yes |
| `**` | redirect → `/` | — |

The three legal pages share `LegalDocumentComponent` (`components/legal-document/`): each page only lists its
sections via `legalSection(doc, id, shape)`, and the i18n keys follow `<doc>.<id>.title / .p1… / .li1…`.

---

## Home Page Composition

`HomeComponent` is a shell that composes these components top-to-bottom:

```
HeroComponent          ← typewriter effect, CTA buttons
ServicesComponent      ← 4 service cards (frontend/backend/mobile/AI)
HowItWorksComponent    ← 4-step process
ContactCtaComponent    ← final CTA banner
FooterComponent        ← outside <main>; links to the legal pages
```

`NavbarComponent` and the skip link live in `AppComponent`. Section fragment ID for scroll-nav: `#services`.

Testimonials, stats, portfolio and the `/work/:id` case studies were removed in the October 2026
compliance pass (fake quotes, unverifiable numbers, client logos without consent). Only bring them
back with real, verifiable content and the client's permission.

---

## Services

| Service | Responsibility |
|---|---|
| `ScrollService` | Schedules and executes smooth scroll-to-fragment; used for cross-page hash navigation |
| `TypewriterService` | Cycles strings with typing/deleting animation; used only in `HeroComponent` |
| `ContactService` | Stub HTTP POST — replace `of(undefined)` with real `HttpClient` call when API is ready |

---

## Components — Key Details

**NavbarComponent**
- Signals: `scrolled`, `menuOpen`
- Language switcher persists to `localStorage`; supported langs: `en`, `cs`, `sk`, `uk`
- `scrollToSection()` handles both same-page and cross-page fragment navigation via `ScrollService`
- Uses constructor injection (legacy — new components should use `inject()`)

**HeroComponent**
- Signals: `typedText`
- Restarts typewriter on `onLangChange` (manual `Subscription` — candidate for `toSignal` / `takeUntilDestroyed`)

**ContactComponent**
- `ReactiveFormsModule` + `FormBuilder`
- `status` signal: `'idle' | 'submitting' | 'success' | 'error'`
- `ContactService.send()` posts to `/api/contact` (Turnstile check + Resend emails)
- No consent checkbox on purpose: replying to an enquiry is GDPR art. 6(1)(b), so the form shows a
  plain privacy notice instead — don't reintroduce a required "I consent" checkbox

**AppComponent**
- Uses constructor injection + `implements OnInit` (legacy — keep as-is unless refactoring)
- Route animation: fade + 8px translateY on enter

---

## i18n

- 4 locales: `public/i18n/en.json`, `cs.json`, `sk.json`, `uk.json`
- Key namespaces: `nav`, `hero`, `services`, `process`, `pricing`, `faq`, `cta`, `footer`, `contact`, `about`,
  `privacy`, `terms`, `refunds`, `legal` (shared legal-page labels), `a11y` (screen-reader labels)

---

## Design System Quick Reference

**Colors**
```
$bg-primary:    #09090F   (page background)
$bg-surface:    #13131A   (cards)
$bg-elevated:   #1A1A24   (raised elements)
$purple:        #8B5CF6   (primary accent)
$green:         #10B981   (secondary accent)
$gradient-brand: 135deg purple → green
```

**Key Mixins** (`src/styles/_mixins.scss`)
```
@include card            → surface card with purple hover glow
@include glass           → frosted glass panel
@include btn-primary     → gradient CTA button
@include btn-outline     → ghost button
@include section-padding → responsive section wrapper
@include container       → max-width 1200px centered
@include section-label   → uppercase pill label above headings
@include orb($color)     → blurred radial glow background element
@include sm/md/lg/xl     → mobile-first breakpoints
```

**Scroll-reveal**: apply `appScrollReveal` directive to any element for intersection-observer animation. Classes `.reveal`, `.reveal-left`, `.reveal-scale` are defined in `_animations.scss`.

---

## Known Tech Debt

- `HomeComponent` missing `ChangeDetectionStrategy.OnPush` and `standalone: true` in decorator options
- `AppComponent` and `NavbarComponent` use constructor injection instead of `inject()`
- `HeroComponent` uses a manual `Subscription` — candidate for `takeUntilDestroyed()`
- `ContactService.send()` has a `console.log` that must be removed before go-live

---

## Planned Features (conversion / sales)

These have been scoped but not yet built:

1. **Process section** — "How We Work" 4-step flow, to be added to `HomeComponent` between Services and Stats
2. **Pricing / Engagement Models page** — new route `/pricing`, new `PricingComponent`
3. **Case study detail pages** — new route `/work/:id`, new `CaseStudyComponent`; data driven from a `ProjectsService`
4. **FAQ section** — collapsible accordion, to be added to `HomeComponent` before `ContactCtaComponent`
5. **Real testimonials** — replace hardcoded data with verified quotes + photo assets
6. **Availability signal** — dynamic slot counter in hero badge and footer

---

## Asset Locations

| Type | Path |
|---|---|
| Translation files | `public/i18n/*.json` |
| Global styles | `src/styles/` |
| Component styles | co-located `.component.scss` |
| Public images | `public/` (none added yet) |
