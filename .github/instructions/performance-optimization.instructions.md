---
description: "Use when optimizing performance, fixing Lighthouse scores, improving Core Web Vitals, reducing bundle size, fixing LCP/TBT/CLS, adding SEO meta tags, fixing accessibility audits, or improving mobile performance. Covers Angular-specific patterns, CSS paint budgets, defer strategies, and deployment config."
---

# Performance & Optimization Expert — JVM Solutions

Lessons extracted from real Lighthouse audit cycles on this codebase. Apply these before writing new code, not after.

---

## 1. Angular Bundle & Runtime

### provideNoopAnimations, not provideAnimations
If no `@Component({ animations: [...] })` exists anywhere in the app, swap `provideAnimations()` for `provideNoopAnimations()`. The full animations engine is tree-shaken away.

```ts
// app.config.ts
import { provideNoopAnimations } from '@angular/platform-browser/animations';
```

### Run timers outside NgZone
`setTimeout`, `setInterval`, and `requestAnimationFrame` loops that only update signals do not need zone awareness. Zone-patched timers flush microtasks on every tick.

```ts
// hero.component.ts — typewriter, counters, rAF animation loops
constructor(private ngZone: NgZone) {}

this.ngZone.runOutsideAngular(() => {
  this.service.start(strings, (text) => this.signal.set(text));
});
```

### @defer: separate prefetch from render trigger
`on idle; on viewport` is wrong — `on idle` fires immediately after paint and downloads all deferred chunks at once, creating a cascade waterfall.

```html
<!-- WRONG — all chunks download on idle regardless of scroll -->
@defer (on idle; on viewport) { ... }

<!-- CORRECT — prefetch quietly during idle, but only render when scrolled into view -->
@defer (on viewport; prefetch on idle) { ... }
```

**Always give placeholders real height** — a zero-height `<div>` is "in viewport" at load time, defeating the trigger:

```html
@defer (on viewport; prefetch on idle) {
  <app-services />
} @placeholder {
  <div style="min-height:700px"></div>
}
```

Use approximate section heights:
| Section | min-height |
|---|---|
| services, portfolio | 700px |
| how-it-works, testimonials | 580px |
| faq | 480px |
| stats | 180px |
| footer, contact-cta | 300px |

---

## 2. LCP (Largest Contentful Paint)

### Never put opacity:0 on a wrapper containing the LCP element
Hero `animation: fade-in-up 0.8s ease both` on the content wrapper sets *every* child to `opacity:0`. The browser cannot detect or measure the LCP element until opacity > 0. This adds the full animation delay to LCP.

**Fix**: Remove animation from the wrapper. Animate only non-LCP children individually.

### Use transform-only keyframes for the LCP heading
`fade-in-up` animates both `opacity` and `transform` — opacity delay hides the LCP element.

```scss
// Use this for the h1 headline
@keyframes slide-in-up {
  from { transform: translateY(28px); }
  to   { transform: translateY(0); }
}
```

The element is visible (opacity:1) from the first frame — LCP is measured immediately.

### Async font loading — never @import in CSS
`@import url(...)` inside a `.scss` file blocks rendering for an entire extra round-trip.

```html
<!-- index.html — load fonts async, never @import in CSS -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style"
  href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap"
  onload="this.onload=null;this.rel='stylesheet'">
<noscript>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?...">
</noscript>
```

---

## 3. Mobile GPU / Paint Budget

### Hide decorative multi-layer blur orbs on mobile
Each element with `filter: blur()` + `animation` creates a stacked GPU compositing layer. Three orbs on a low-end phone = three separate composited layers animating simultaneously. On mobile this costs ~20ms/frame.

```scss
&__orb--green,
&__orb--purple-sm {
  @include max-md { display: none; }
}
```

Keep one orb max on mobile. Also hide decorative grid backgrounds:

```scss
&__grid {
  @include max-md { display: none; }
}
```

### Scroll indicators have no value below md
```scss
&__scroll {
  @include max-md { display: none; }
}
```

### prefers-reduced-motion — one place, total coverage
Add to `_animations.scss`, not scattered across component SCSS files:

```scss
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .reveal, .reveal-left, .reveal-scale {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
```

For JS-driven animations (counters, typewriter), check at component init:

```ts
private readonly prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

ngOnInit() {
  if (this.prefersReducedMotion) return; // skip animation entirely
}
```

---

## 4. Rendering / Layout — content-visibility

Add to the `section-padding` mixin so all below-fold sections benefit automatically:

```scss
@mixin section-padding {
  padding: $space-16 $space-6;
  content-visibility: auto;
  contain-intrinsic-size: auto 600px; // approximate section height
  @include md { padding: $space-32 $space-8; }
}
```

For sections with custom padding (stats, footer), add directly:

```scss
.stats {
  content-visibility: auto;
  contain-intrinsic-size: auto 200px;
}
.footer {
  content-visibility: auto;
  contain-intrinsic-size: auto 400px;
}
```

---

## 5. Accessibility (also affects Lighthouse score)

### Skip link — always present
```html
<!-- index.html body, first child before app-root -->
<a class="skip-link" href="#main-content">Skip to main content</a>
```

```scss
// styles.scss
.skip-link {
  position: absolute;
  top: -100%;
  left: $space-4;
  z-index: 9999;
  padding: $space-2 $space-4;
  background: $purple;
  color: #fff;
  border-radius: $radius-lg;
  font-size: $text-sm;
  font-weight: 600;
  text-decoration: none;
  transition: top 0.2s;
  &:focus { top: $space-4; }
}
```

### Every page needs `id="main-content"` on `<main>`
SPA navigation means index.html's `<main>` is only the home page wrapper. Each page component's `<main>` needs the id independently.

### Tap targets minimum 24×24px
Lighthouse fails if interactive elements are smaller. Lang buttons, small icon-only links, and close buttons are the usual culprits.

```scss
// Set min-height on any button below $text-sm
&__lang-btn {
  padding: $space-2 $space-2;
  min-height: 28px;
}
```

### aria-live on count-up counters creates noise
`aria-live="polite"` on elements that update every 16ms (rAF) announces every intermediate number. Remove from counter elements — the final value is what matters.

### Mobile dialog needs aria-label
```html
<div role="dialog" aria-modal="true" aria-label="Mobile navigation">
```

### Page titles on every route
```ts
// app.routes.ts
{ path: 'contact', title: 'Get In Touch — JVM Solutions', loadComponent: ... }
```

---

## 6. SEO Checklist (100/100 Lighthouse)

All of the following must exist before deploying:

```html
<!-- index.html — complete head section -->
<meta name="description" content="...under 160 chars...">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:type" content="website">
<meta property="og:url" content="https://yourdomain.com/">
<meta property="og:image" content="https://yourdomain.com/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://yourdomain.com/og-image.png">
<link rel="canonical" href="https://yourdomain.com/">
```

```
public/robots.txt       — must exist and not block /
public/sitemap.xml      — list all public routes
public/og-image.png     — 1200×630, branded
```

---

## 7. Azure Static Web Apps — staticwebapp.config.json

### Cache headers for immutable assets
Angular's production build hashes all filenames. Tell browsers (and CDN) these never change:

```json
{
  "routes": [
    { "route": "/*.js",    "headers": { "Cache-Control": "public, max-age=31536000, immutable" } },
    { "route": "/*.css",   "headers": { "Cache-Control": "public, max-age=31536000, immutable" } },
    { "route": "/*.woff2", "headers": { "Cache-Control": "public, max-age=31536000, immutable" } },
    { "route": "/i18n/*.json", "headers": { "Cache-Control": "public, max-age=3600" } },
    { "route": "/index.html",  "headers": { "Cache-Control": "no-cache, no-store, must-revalidate" } }
  ]
}
```

### HTTP/2 — Azure SWA enables it at CDN edge automatically
The Lighthouse "Modern HTTP" warning only appears when auditing `localhost`. Run Lighthouse against the deployed `*.azurestaticapps.net` URL — the warning will be gone.

---

## 8. @defer Placeholder Sizing Reference

Empty `<div>` placeholders collapse to 0px height. Any section with a zero-height placeholder is "in viewport" the moment the page loads, defeating lazy loading entirely.

Always use approximate rendered heights:

```html
@defer (on viewport; prefetch on idle) {
  <app-services />
} @placeholder {
  <div style="min-height:700px"></div>
}
```

---

## 9. Container Utility Class Must Include Gutters

The `@include container` mixin only sets `max-width` and `margin: auto`. HTML elements using `class="container"` will have no horizontal padding without this:

```scss
// styles.scss — global utility
.container {
  @include container;
  padding-left: $space-6;
  padding-right: $space-6;
  @include md {
    padding-left: $space-8;
    padding-right: $space-8;
  }
}
```

Without the padding, text bleeds edge-to-edge on mobile on every page that uses `class="container"` directly on the HTML element.

---

## 10. SVG Icons via [innerHTML] — DomSanitizer Required

Plain `string` injected via `[innerHTML]` is sanitized by Angular — SVG path attributes (`stroke-width`, `viewBox`, `d`, `stroke-linecap`) are stripped, leaving an empty `<svg>` shell. Icons appear invisible.

```ts
// WRONG — Angular strips SVG attributes
icon: string = `<svg ...><path d="..."/></svg>`;

// CORRECT
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

icon: SafeHtml;

constructor(private sanitizer: DomSanitizer) {
  this.icon = sanitizer.bypassSecurityTrustHtml(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" ...>`);
}
```

Every SVG string must have explicit `xmlns`, `width`, `height`, and `viewBox` attributes — scoped component CSS cannot style injected SVG content without them.
