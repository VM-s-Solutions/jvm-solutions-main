# Project Context — JVM Yore

Website of a three-person software studio (Janis, Vít, Michael) in Prague: web apps, .NET backends, native mobile
apps and AI agents. The October 2026 redesign is built around one idea: the visitor names their product in a live chat
with the founders, and the whole site then talks about it ("Ask the people who'll build Bloom."). Light, flat, clean
surfaces with glass only on the bars (November 2026 restyle), colours by the 60-30-10 rule (white, ink neutrals, brand orange),
calm type (nothing above 60px), one dark band for contrast, smooth but restrained motion.

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
runs on the compositor. The snapshot pseudos paint nothing of their own (no edge shadow): Safari shows a snapshot as a
plain image layer only then, and with a shadow it repainted the incoming page on every frame. The top bar and the tab bar skip the default
view-transition crossfade (`base/_animations.scss`). `PageTransitionService.whenSettled()` resolves once the slide under
way is over (at once on a direct landing or a skipped slide); heavy work a new page starts waits for it — the contact
form's Turnstile loads only then. While a slide runs, browsers hit-test its snapshots as `<html>` (no `pointer-events`
setting changes that), so `PageTransitionService` hands a click there to the top bar's or tab bar's link or button
under it (`clickThrough`): a tab clicked mid-slide opens its page at once, and its slide takes over. Clicks on the page
itself go nowhere until the slide is over (it isn't where it's drawn yet). The bars' links are `draggable="false"`, so
a click that wobbles stays a click instead of Safari picking the link up.

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
PaperComponent       ← "Put [name] on paper." + a pinned 3D stage (Stage3dComponent, three.js): a paper sketch, the printed
                       spec, then the sketch lifts onto a laptop's display and becomes the app; a quiet stepper beside it
TradesComponent      ← services carousel with four live demo screens (demo-lang, demo-code, demo-lock, demo-prompt);
                       the bar under it is its scrollbar (drag the thumb, press the track; pointer only)
TeamTrioComponent    ← tap a face, read a first-person line
CostComponent        ← ink band: no price list, the price is agreed per scope; a card for the free first consultation
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
| `consultation.ts` | `CONSULTATION_PARAMS` for every "Book a consultation" link (the contact form opens on Consultation) |
| `ScrollService` | Smooth scroll to an id below the top bar (waits for deferred sections); `scrollTo(id, focusId)` also moves focus; `topBarHeight()` is cached and kept current by a ResizeObserver, so scroll handlers read no layout |
| `KeyboardService` | `tabbed` signal: on from the first Tab press; deferred sections render then |
| `dates.ts` | Pure helpers: reply-by time (24h, past weekends) and the lock-screen date (one cached `Intl.DateTimeFormat` per language and format) |
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
scope, so the pricing page, the price dial and the plans were removed. The site quotes no price at all: the first
consultation is free, and later consulting is billed at an hourly rate agreed in advance (terms and refunds say so).
Don't bring back published prices, rates or plans without the owners.

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
- Keys containing `<b>` are bound with `[innerHTML]`.

---

## Design System Quick Reference

Tokens live in `src/styles/abstracts/_variables.scss`; colours are also CSS custom properties (`base/_root.scss`).

```
60-30-10: 60% white and light surfaces, 30% ink neutrals (text, greys, dark surfaces), 10% brand orange. No other hue
(functional exceptions only: error red, the "done" green). The rule is written out at the top of
`_variables.scss`.
--bg #FFFFFF   --soft #F5F6F8   --soft-2 #ECEEF1   --ink #0B0C0E   --ink-2 #3C4048   --muted #656A72   --line #E6E8EC
--ground #F7F8FA
--orange #F26100 (accents: logo, icons, rings, markers)   --orange-text #B84700 (orange text)
--orange-fill #CC4A00 (fills that carry text: buttons, the visitor's bubble; white text 4.6:1)
--orange-fill-2 #B84700 (their hover)   --on-orange #FFFFFF (text and icons on the fills)
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

## Surfaces

Flat, in the manner of apple.com (the owner asked for that): depth comes from the change of surface (white, the soft
`--soft` #F5F5F7, the dark band), never from gradients, borders on cards or shadows on cards and buttons. No colour washes.

| Tool | Use |
|---|---|
| `pane` (mixin) | a tile on the page's white: the soft fill and nothing else (service documents, home service cards, the contact facts) |
| `glass($fill, $blur, $shadow)` | only what floats over content: the phone tab bar, the language menu |
| `frosted($bg)` | the top bar's sheet once the page scrolls |

Sections are white; only one dark band per page (cost on home, how we work on about, the takeover card on services)
and the footer change the ground. Content sits on soft tiles: big tiles
(chat, composer, service documents, portraits, register, the contact window, the consultation card) take `$radius-xl`,
cards inside a row (home service cards, ways of working, contact facts) `$radius-lg`. On a soft tile, chips, pills,
bubbles and fields are white. Text links (`.link`) are orange on light surfaces and take the text colour on the dark band.

The hero's chat is itself one flat soft tile (no window frame, no shadow; our bubbles are white on it). The footer is full width on the soft ground, the wordmark first.

Every page keeps its own device, and stays clean around it (the owner asked for atypical everywhere, never a standard
layout): home is a chat, FAQ one conversation (questions in the visitor's bubble, answered by one of us, with the "ask
us" box staying in view beside it), contact a message window (with neutral window dots), services four documents with
contents that follow the reader, each beside its live demo screen (the home page's `demo-*` components) and its own
link to the contact form (`?about=`), about three soft tiles (a square photo, name, role and a line in their own words as a chat bubble), four
ways-of-working cards, and the register as one tile of facts. Services and
about end on `ComposeComponent`; the services head carries the consultation button.

Type is calm on purpose: hero 40 → 60px, page h1 38 → 56px, section h2 28 → 40px. One size per level: every section
heading is `$fs-h2`, the composer's and "Put … on paper." included. Sections keep one rhythm (`$section-y`, 64 → 96px).
Buttons are 46px (40px small).

Hovers and presses are plain and quick: a colour change in `$duration-fast` (0.25 s), nothing grows or blooms; only a
button's arrow moves. The mock screens on tiles are flat as well (a hairline, no drop). On the home page the three faces
keep one size and full colour, and a ring marks who is speaking (grey under the pointer, orange when chosen). The idea
slot in "Put … on paper." is a blank on an orange rule, which closes into a ring on the orange tint when focused. On
phones, footer links and the language buttons are 44px tap targets.
Radii: 8 / 12 / 16 / 20 / 28.

## The 3D stage (home, "Put … on paper.")

`components/stage3d/`: `stage3d.component` (canvas host, CSS paper placeholder, texts from i18n and the product name),
`stage-scene.ts` (the only file that imports three; loaded by dynamic import when the section nears the viewport),
`stage-textures.ts` (the sketch, spec, notes and app screen drawn on 2D canvases with the site's fonts),
`stage-timeline.ts` (pure pose maths, unit-tested). Every pose is a function of one timeline number. The scroll only picks the chapter (a quarter of the track each);
`PaperComponent` then plays the timeline to that chapter's rest (`STAGE_RESTS`, `play()`) at a capped pace, so a stopped
scroll never leaves a move half done and a fast scroll can't rush it; scrolling back plays it in reverse. A wheel
or a swipe moves the story one chapter at a time: while a step plays, wheel and touch scrolling is swallowed
(`hold` in `PaperComponent`), and it is freed at the first pause in the gesture after the step has played, or after
1.8 s at the latest, so one fling moves one step and nobody is trapped. Keys, links and the scrollbar are never held.
No CSS scroll snapping (it made a touchpad fight the page). The track is 320vh, about half a screen of scroll per step.
The scene warms its shaders and textures when it is built (`warm()`): left to their first frame in view they stalled
the story as the laptop came in.
The scene renders only while the playback moves. three.js sits in its own lazy chunk
(~590 kB raw, ~150 kB gzip) and must never reach the initial bundle. A short viewport or reduced motion pins nothing:
the steps are listed and one still frame shows the finished laptop. Shadows are baked contact cards, not shadow maps. The laptop's screen is a canvas texture repainted only when a row
arrives or is ticked; its two cards (staging, handover) are planes of their own over the screen, drawn once per content,
so they glide without any redraw. The screen texture has no mipmaps, so an update is one upload.
The scene keeps the 60-30-10 rule too: neutral paper and aluminium, orange strokes and dots, ink ticks.

## Asset Locations

| Type | Path |
|---|---|
| Translation files | `public/i18n/*.json` + `src/app/i18n/*.ts`; legal pages: `public/i18n/legal/*.json` + `src/app/i18n/legal/*.ts` |
| Global styles | `src/styles/` (7-1) |
| Fonts + licences | `src/fonts/` (loaded after first paint by `index.html`; the home page warms Caveat and JetBrains Mono in the render queue's first idle step), cut from Google's files by `scripts/subset-fonts.py` (fontTools + brotli; `--check` verifies the repo matches); `public/licenses/fonts.txt` |
| Team photos | `public/images/team/`: `<name>.jpg` portraits (fallback) + `<name>-480/640/800.avif` (vit: 480/640/700) for the about page's srcset; `<name>-avatar-120.webp` small faces (chat head, chat rows, To lines), `<name>-avatar-320.webp` team section. public/ is served immutable for a year: a changed image needs a new file name |
| Social image | `public/og-image.png`, source `scripts/og-image-template.html` |
