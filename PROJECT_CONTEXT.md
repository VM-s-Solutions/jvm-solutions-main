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
| `/pricing` | `PricingComponent` | yes |
| `/about` | `AboutComponent` | yes |
| `/faq` | `FaqPageComponent` | yes |
| `/contact` | `ContactComponent` | yes |
| `/privacy`, `/terms`, `/refunds` | `PrivacyComponent`, `TermsComponent`, `RefundsComponent` | yes |
| `**` | redirect → `/` | — |

Route changes slide like iOS screens (`withViewTransitions` + `services/page-transition.ts` sets `html[data-dir]`
from the page order; skipped under reduced motion). The three legal pages share `LegalDocumentComponent`: each page
lists its sections via `legalSection(doc, id, shape)`; keys follow `<doc>.<id>.title / .p1… / .li1…`.

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

`HomeComponent` composes, top to bottom. Everything below the hero is deferred:
`@defer (on viewport; on timer(5000ms…7000ms); when tabbed(); prefetch on idle)`. A section renders as it nears the
viewport; the first Tab renders them all (`KeyboardService`), so keyboard users never tab past a placeholder; otherwise
each has its own timer, 400ms apart, so screen reader users get the whole page too, after the load window and never
as one long task. The footer in `AppComponent` uses the same triggers. Don't go back to `on idle`: rendering every
section at once right after load cost ~600ms of blocking time on a throttled phone.

```
HeroComponent        ← headline (swaps in the idea's name) + ChatComponent (live chat, asks for the idea's name)
PaperComponent       ← "Put [name] on paper." + pinned board: sketch → spec → staging → handover on light/dark chapters
TradesComponent      ← services carousel with four live demo screens (demo-lang, demo-code, demo-lock, demo-prompt)
TeamTrioComponent    ← tap a face, read a first-person line
PriceBandComponent   ← ink band with PriceDialComponent (the slider)
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
| `LangService` | Active language as a signal; switching persists to `localStorage['lang']` |
| `NavToneService` | Which registered dark surface is under the top bar |
| `ContactDraftService` | Carries the home composer's text to the contact form once |
| `ContactService` | POST `/api/contact` (Turnstile token + Resend e-mails); optional `project` = the idea's name |
| `ScrollService` | Smooth scroll to an id below the top bar (waits for deferred sections); `scrollTo(id, focusId)` also moves focus |
| `KeyboardService` | `tabbed` signal: on from the first Tab press; deferred sections render then |
| `dates.ts` | Pure helpers: reply-by time (24h, past weekends), lock-screen date, euro formatting per language |
| `team.ts` | The three of us: names, avatars, portraits, LinkedIn |
| `motion.ts` | `prefersReducedMotion()`, read at the moment of use, so a mid-visit change is respected |
| `clock.ts` | `injectNow()`: a minute clock signal (also ticks on focus / tab return) for reply-by times |
| `product-name.ts` | `injectProductName()`: the idea's name, or the translated "Your product" |

Contact form: no consent checkbox on purpose — replying to an enquiry is GDPR art. 6(1)(b), so the form shows a plain
privacy notice instead. Don't reintroduce a required "I consent" checkbox. The privacy policy lists exactly what is
kept in localStorage (`lang`, `idea`, `fontsCached`) — update it if that changes.

Testimonials, stats, portfolio and case studies were removed in the October 2026 compliance pass. Only bring them back
with real, verifiable content and the client's permission. The mock screens on the home page are drawn for the
visitor's idea and say so ("None of them come from client work").

---

## Shared building blocks

| Block | Use |
|---|---|
| `RevealDirective` | `jvmReveal` / `jvmReveal="up"` / `[revealDelay]` — fade/lift in on first view |
| `SplitTextComponent` | `<h2 [jvmSplit]="text">` — words rise from masks; on text change only changed words swap |
| `SwapTextComponent` | `<jvm-swap-text [text]>` — soft crossfade when a value (the idea's name) changes |
| `MessageComponent` | `<jvm-message from="me|j|v|m">` — one chat row (chat, asked, FAQ, contact) |
| `PriceDialComponent` | `<jvm-price-dial variant="dark|light">` — home band and pricing page |
| `IconComponent`, `LogoComponent` | line icons; the lockup or the ribbon mark (`variant="mark"`) |
| `DarkSurfaceDirective` | `[jvmDarkSurface]` — the top bar turns dark over it |

---

## i18n

- 4 locales: `public/i18n/en.json`, `cs.json`, `sk.json`, `uk.json`, each mirrored in `src/app/i18n/<lang>.ts`
  (`en.ts` is bundled for the first paint; keep all four mirrors in sync).
- Namespaces: `a11y`, `nav`, `idea`, `hero`, `chat`, `paper`, `trades`, `service`, `team`, `price`, `faq`, `compose`,
  `services`, `pricing`, `about`, `contact`, `footer`, `samples`, `legal`, `privacy`, `terms`, `refunds`.
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
Fonts: Geologica (display), Inter (text), JetBrains Mono (code), Caveat (handwriting) — self-hosted, OFL
Motion: --ease cubic-bezier(.22,1,.36,1), --ios cubic-bezier(.32,.72,0,1), --spring cubic-bezier(.34,1.4,.64,1)
Breakpoints (min-width): sm 641px, md 901px (desktop nav), lg 1101px, xl 1281px; `@include short` is max-height 480px
(a landscape phone or a page zoomed far in: nothing pinned)
```

Global classes: `.container .section .section--soft .section--ink .page-hero .sec-head .display .h2 .lead .btn
.btn--primary .btn--ghost .link .round .chips .hand`. Component styles start with `@use 'abstracts' as *;`.

---

## Asset Locations

| Type | Path |
|---|---|
| Translation files | `public/i18n/*.json` + `src/app/i18n/*.ts` |
| Global styles | `src/styles/` (7-1) |
| Fonts + licences | `src/fonts/` (loaded after first paint by `index.html`), `public/licenses/fonts.txt` |
| Team photos | `public/images/team/` (`<name>.jpg` portraits, `<name>-avatar.jpg` 320px squares) |
| Social image | `public/og-image.png`, source `scripts/og-image-template.html` |
