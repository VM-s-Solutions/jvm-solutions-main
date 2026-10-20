# Project Context — JVM Yore

Website of a three-person software studio (Janis, Vít, Michael) in Prague: web apps, .NET backends, native mobile
apps and AI agents. The October 2026 redesign is built around one idea: the visitor names their product in a live chat
with the founders, and the whole site then talks about it ("Ask the people who'll build Bloom."). Light, iOS-like
surfaces, brand orange on actions, dark chapters for contrast, smooth but restrained motion.

---

## Pages & Routes

| Route | Component | Lazy |
|---|---|---|
| `/` | `HomeComponent` | no — eager on purpose (landing page, keeps the hero/LCP off a lazy-chunk round trip) |
| `/services` | `ServicesComponent` | yes |
| `/about` | `AboutComponent` | yes |
| `/faq` | `FaqPageComponent` | yes |
| `/contact` | `ContactComponent` — `?about=<CONTACT_SERVICES id>` picks the form's topic (`?about=consultation`) | yes |
| `/privacy`, `/terms`, `/refunds` | `PrivacyComponent`, `TermsComponent`, `RefundsComponent` (resolver `legalStrings` loads their strings first) | yes |
| `/pricing` | redirect → `/` (retired; server.js and staticwebapp.config.json answer 301) | — |
| `**` | redirect → `/` | — |

Route changes slide like iOS screens (`withViewTransitions` + `services/page-transition.ts` sets `html[data-dir]`
from the page order for as long as the slide runs; skipped under reduced motion). The incoming page makes its entrance
inside the slide: while `html[data-dir]` is set, reveals and split headings run quicker (`$slide-entrance-*` tokens), so
the last move lands before the slide ends. Safari restarts whatever still runs in the slide's snapshot when the slide
ends, which played the entrance twice there; `resyncAnimations()` catches anything that still overruns. The slide
keyframes move only transform and opacity, so the slide
runs on the compositor (the incoming page's edge shadow is static); the top bar and the tab bar skip the default
view-transition crossfade (`base/_animations.scss`). `PageTransitionService.whenSettled()` resolves once the slide under
way is over (at once on a direct landing or a skipped slide); heavy work a new page starts waits for it — the contact
form's Turnstile loads only then.

The three legal pages share `LegalDocumentComponent`: each page lists its sections via `legalSection(doc, id, shape)`;
keys follow `<doc>.<id>.title / .p1… / .li1…`.

---

## App shell

`AppComponent` renders the skip link, `TopBarComponent` (logo, page tabs with a sliding thumb, `LangMenuComponent`,
"Message us"), `TabBarComponent` (floating bottom tab bar on phones, < 901px), `<main id="main">` with the router
outlet, and the deferred `FooterComponent`. Pages render only their sections — no `<main>`, no footer.
After every navigation except the first, focus moves to `<main>` (unless the URL has a #fragment), so keyboard and
screen reader users start at the new page's content.
The top bar frosts once the page scrolls and turns dark over dark surfaces (`DarkSurfaceDirective` +
`NavToneService`).

## Home page composition

`HomeComponent` composes, top to bottom. Everything below the hero is deferred and let in through
`RenderQueueService`, one section per idle period. The queue opens once the window has loaded and the hero has made
its entrance (`HomeComponent` holds it for 1.8 s). Each step then waits for the app to be stable (no section code still
loading), for a 0.7 s pause in the visitor's input (wheel, touch, click, key, page scroll) and for
`requestIdleCallback` (2 s timeout; a 200 ms timer on Safari); the next one waits for the frame that shows it. The
first step warms Caveat and JetBrains Mono (`document.fonts.load`). Blocks are
`@defer (on viewport({ rootMargin: '0px 0px 100% 0px' }); when ready() > N || tabbed(); prefetch on idle)`, so a
section renders one screen ahead of the visitor; the paper section uses plain `on viewport` (its placeholder already
starts within a screen of the fold). The first Tab renders them all (`KeyboardService`), so keyboard users never tab
past a placeholder, and screen reader users get every section within a few seconds without scrolling. The footer in
`AppComponent` queues after the page's sections (order 1), and other pages' code is preloaded after that (order 2,
`AfterLoadPreloadingStrategy`). Don't go back to `on idle` or fixed timers: rendering every section at once cost
~600 ms of blocking time on a throttled phone, and the timers landed renders mid-chat and mid-scroll.

```
HeroComponent        ← headline (swaps in the idea's name) + ChatComponent (live chat, asks for the idea's name)
PaperComponent       ← "Put [name] on paper." + pinned board: sketch → spec → staging → handover on light/dark chapters
TradesComponent      ← services carousel with four live demo screens (demo-lang, demo-code, demo-lock, demo-prompt)
TeamTrioComponent    ← tap a face, read a first-person line
CostComponent        ← ink band: no price list, the price is agreed per scope; a card with consulting at HOURLY_RATE
AskedComponent       ← two questions as a chat thread
ComposeComponent     ← composer that carries a draft to /contact
```

Anchor for "See how we'd build it": `#how` (wraps the deferred paper section, so it can be scrolled to early).

---

## State & services

| Service | Responsibility |
|---|---|
| `IdeaService` | The visitor's idea name (signal), cleaned (`cleanIdea`, ≤ 24 chars) and kept in `localStorage['idea']` |
| `ChatFlowService` | The hero conversation (messages as translation keys + params, chips, timers); lives at root so it never replays |
| `LangService` | Active language as a signal; switching persists to `localStorage['lang']`, first merges the open page's translation parts into the target language, and the language asked for last wins |
| `TranslationLoader` | ngx-translate's loader: the English core inline and synchronous; other languages and wanted parts via fetch |
| `TranslationPartsService` | Merges a translation part (`legal`) into a language ngx-translate holds; used by the legal route resolver and `LangService` |
| `fetch-json.ts` | `getJson` (a bare GET that reuses index.html's preloads) and `postJson` (an abortable POST). There is no HttpClient |
| `RenderQueueService` | Hands heavy rendering (the home sections, the footer, route preloads) out one piece per idle period: after load and any `hold(ms)`, with the app stable, in a pause in the visitor's input; `add(run, order)` returns a call-off |
| `PageTransitionService` | `whenSettled()`: resolves when the current page slide is over (at once when none runs); `onPageTransition` records each slide |
| `NavToneService` | Which registered dark surface is under the top bar |
| `ContactDraftService` | Carries the home composer's text to the contact form once |
| `ContactService` | POST `/api/contact` via `postJson` (Turnstile token + Resend e-mails); optional `project` = the idea's name. `CONTACT_SERVICES` ids double as `?about=` topics (`serviceValueFor`) |
| `consultation.ts` | `HOURLY_RATE` (€100, the only price the site quotes) and `CONSULTATION_PARAMS` for every "Book a consultation" link |
| `ScrollService` | Smooth scroll to an id below the top bar (waits for deferred sections); `scrollTo(id, focusId)` also moves focus; `topBarHeight()` is cached and kept current by a ResizeObserver, so scroll handlers read no layout |
| `KeyboardService` | `tabbed` signal: on from the first Tab press; deferred sections render then |
| `dates.ts` | Pure helpers: reply-by time (24h, past weekends), lock-screen date, euro formatting per language (one cached `Intl.NumberFormat` each) |
| `team.ts` | The three of us: names, avatars (120px) and faces (320px), portraits (JPEG + AVIF srcset), LinkedIn |
| `motion.ts` | `prefersReducedMotion()`, read at the moment of use, so a mid-visit change is respected |
| `clock.ts` | `injectNow()`: a minute clock signal (also ticks on focus / tab return) for reply-by times |
| `product-name.ts` | `injectProductName()`: the idea's name, or the translated "Your product" |

Contact form: no consent checkbox on purpose — replying to an enquiry is GDPR art. 6(1)(b), so the form shows a plain
privacy notice instead. Don't reintroduce a required "I consent" checkbox. The privacy policy lists exactly what is
kept in localStorage (`lang`, `idea`, `fontsCached`) — update it if that changes.

The contact form uses native inputs and signals, not `@angular/forms` (the forms module was ~34 kB raw / ~7 kB br of a
chunk every visitor preloads). The fields' values live in one `values` signal, fed by `(input)`/`(change)`, and nothing
writes a field while the visitor types. The `<form>` has `novalidate` and its `(submit)` calls `preventDefault()`;
`maxlength` is bound as `[maxLength]`. The draft, the `?about=` topic and the Subject are written as the fields' current
values, never their defaults, so the native `form.reset()` clears them. Don't bring back ReactiveFormsModule/FormsModule.

Testimonials, stats, portfolio and case studies were removed in the October 2026 compliance pass. Only bring them back
with real, verifiable content and the client's permission. The mock screens on the home page are drawn for the
visitor's idea and say so ("None of them come from client work").

No price list, on purpose (October 2026): projects, the whole team and Support & LTS are priced by agreement for the
scope, so the pricing page, the price dial and the plans were removed. The site quotes one price, consulting at
`HOURLY_RATE`. Don't bring back published prices or plans without the owners.

---

## Shared building blocks

| Block | Use |
|---|---|
| `RevealDirective` | `jvmReveal` / `jvmReveal="up"` / `[revealDelay]` — fade/lift in on first view; hidden from the element's creation (host class); one shared IntersectionObserver for every reveal and split heading (`whenRevealed()`) |
| `SplitTextComponent` | `<h2 [jvmSplit]="text">` — words rise from masks; on text change only the changed words swap: they drop out (0.32 s), then the new ones rise straight away in `$duration-rise` (0.85 s) |
| `SwapTextComponent` | `<jvm-swap-text [text]>` — the old text blurs out (0.25 s), then the new one blurs in; the first value shows without a fade |
| `MessageComponent` | `<jvm-message from="me|j|v|m">` — one chat row (chat, asked, FAQ, contact) |
| `IconComponent`, `LogoComponent` | line icons; the lockup or the ribbon mark (`variant="mark"`) |
| `DarkSurfaceDirective` | `[jvmDarkSurface]` — the top bar turns dark over it |

---

## i18n

- 4 locales: `public/i18n/en.json`, `cs.json`, `sk.json`, `uk.json`, each mirrored in `src/app/i18n/<lang>.ts`
  (`en.ts` is bundled for the first paint; keep all four mirrors JSON-identical to their public files).
- The legal pages' namespaces (`privacy`, `terms`, `refunds`) are a separate part: `public/i18n/legal/<lang>.json`,
  mirrored in `src/app/i18n/legal/<lang>.ts` and never bundled. The `legalStrings` resolver (`app.routes.ts`, via
  `TranslationPartsService.load('legal')`) merges it into the language on screen before a legal page renders; from then
  on every language loaded brings it along (`TranslationLoader`), and `LangService` merges it into the target language
  before switching, so a switch on a legal page swaps every string at once. `index.html` preloads it when a legal URL is
  the landing page. `i18n/i18n.spec.ts` checks key parity across languages and that the legal namespaces stay in the
  legal part.
- Namespaces (core): `a11y`, `nav`, `idea`, `hero`, `chat`, `paper`, `trades`, `service`, `team`, `cost`, `faq`,
  `compose`, `services`, `about`, `contact`, `footer`, `samples`, `legal`. Legal part: `privacy`, `terms`, `refunds`.
- Sentences that mention the idea come in pairs: `key` and `keyNamed` with `{{name}}`. Slavic copy is written around
  the name (classifier nouns, nominative positions) because a typed name can't be declined — never splice names in.
- `samples.*` is the four-language demo text on the web-app card: identical in every locale, not translated.
- Keys containing `<b>` are bound with `[innerHTML]`; prices come from `formatEuros()` as `{{price}}`.

---

## Design System Quick Reference

Tokens live in `src/styles/abstracts/_variables.scss`; colours are also CSS custom properties (`base/_root.scss`).

```
--bg #FFFFFF   --soft #F3F4F6   --soft-2 #ECEDF0   --ink #0B0C0E   --ink-2 #3C4048   --muted #656A72   --line #E7E8EB
--orange #F26100 (fills carry ink text, 6:1)   --orange-2 #FF8E1E (hover)   --orange-text #B84700 (orange text)
--night #0B0C0E  --night-2 #16181C  --night-ink #F2F3F5  --night-muted #A3A8B0   --note #FFF2B8   --them #EEEFF2
Fonts: Geologica (display), Inter (text), JetBrains Mono (code), Caveat (handwriting) — self-hosted, OFL; cut to the
weights in use (Geologica 500–700, Inter 400–600, JetBrains Mono 400–500, static Caveat 600)
Motion: --ease cubic-bezier(.22,1,.36,1), --ios cubic-bezier(.32,.72,0,1), --spring cubic-bezier(.34,1.4,.64,1);
$duration-rise 0.85s for heading word swaps
Breakpoints (min-width): sm 641px, md 901px (desktop nav), lg 1101px, xl 1281px; `@include short` is max-height 480px
(a landscape phone or a page zoomed far in: nothing pinned)
```

Global classes: `.container .section .section--soft .section--ink .page-hero .sec-head .display .h2 .lead .btn
.btn--primary .btn--ghost .link .round .chips .hand`. Component styles start with `@use 'abstracts' as *;`.

---

## Asset Locations

| Type | Path |
|---|---|
| Translation files | `public/i18n/*.json` + `src/app/i18n/*.ts`; legal pages: `public/i18n/legal/*.json` + `src/app/i18n/legal/*.ts` |
| Global styles | `src/styles/` (7-1) |
| Fonts + licences | `src/fonts/` (loaded after first paint by `index.html`; the home page warms Caveat and JetBrains Mono in the render queue's first idle step), cut from Google's files by `scripts/subset-fonts.py` (fontTools + brotli; `--check` verifies the repo matches); `public/licenses/fonts.txt` |
| Team photos | `public/images/team/`: `<name>.jpg` portraits (fallback) + `<name>-480/640/800.avif` (vit: 480/640/700) for the about page's srcset; `<name>-avatar-120.webp` small faces (chat head, chat rows, To lines), `<name>-avatar-320.webp` team section. public/ is served immutable for a year: a changed image needs a new file name |
| Social image | `public/og-image.png`, source `scripts/og-image-template.html` |
