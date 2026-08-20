# AGENT.md — Working Agreement

Rules distilled from real corrections the user had to make across our sessions
(this repo + sibling projects cleansia and tisknicz). Architecture and coding
standards live in [CLAUDE.md](CLAUDE.md) and [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md);
this file encodes *how to work* so the same corrections never have to be repeated.

---

## 1. "Done" means verified, not written

The most frequent correction (~10×) was a bug reported **after** the task was
declared done: animations invisible in Chrome/Safari/mobile, login state lost,
pagination broken, upload broken, IČO validation rejecting a valid Czech IČO,
typewriter effect pushing hero content down.

Before saying "hotovo":

- **Run the app** and screenshot at **375 / 768 / 1440 px**. Look at the
  screenshots — a blank or broken frame is a failure, not evidence.
- **Animations & browser APIs** (WebGL, IntersectionObserver, CSS features):
  provide a fallback and sanity-check Chrome *and* Safari. "Works in one
  browser" has failed three separate times.
- **Validation logic**: test with real data. Reference IČO: `29633443`
  (JVM YORE s.r.o.). Czech IČO = 8 digits + mod-11 weighted checksum.
- **Layout-shifting effects** (typewriter, dynamic text): reserve space up
  front (`min-height` / `ch`-width) so content never jumps.
- **Dark theme readability**: check text contrast on every surface touched —
  "often you cannot read text" was a real complaint.

## 2. Design bar — no "AI design"

Verbatim feedback: "this is ugly", "redesign those cards man, it looks bad",
"buttons look boring, cheap", "these are too AI and too simple",
"match the design, this is so random", "absolute hate that big button".

- Target aesthetic: **GitHub + iOS combined** — technical, restrained, precise.
- **Consistency beats novelty**: reuse existing tokens and match neighboring
  components before inventing a new pattern.
- Forbidden by experience: decorative gradients, icons on badges, icon spam,
  oversized CTA buttons, transparent "cheap" buttons without color.
- Pixel-level QA is expected: alignment (numbers centered), gaps, badge
  positioning, no overflow scrollbars, forms not "weirdly spread out".
- If a section still looks like a generic template, iterate **before**
  presenting it — don't ship the first draft of a redesign.

## 3. Finish the chain — don't stop, don't stall

The user had to type "continue / don't stop" ~15 times and untangle merge
conflicts and red pipelines left behind.

- Deliver the whole chain in one go:
  **code → build → verify in running app → PR (adequate name) → CI green → merge**.
- When asked to merge: resolve conflicts yourself, wait for the pipeline,
  confirm it's green. "i have merge conflicts bro" must not happen again.
- Missing content (price, copy, label)? **Invent a sensible default and flag
  it in one line** ("invent it then" was the actual instruction) — don't block
  on a question. If a question is unavoidable, make it one precise question
  with a recommended answer.

## 4. Communication

- Final answers in **short bullets (≤10)**, no preamble, no closing filler —
  explicitly requested to save tokens.
- Czech question → Czech answer. Czech UI copy must read as native Czech,
  not translated English ("uprav copywriting na vice lidsky a cesky").
- State invented/placeholder values explicitly so they're easy to correct.
- Report failures plainly (failed test, red pipeline) with the fix already
  attempted — never a silent skip.

## 5. Recurring project gotchas

- **i18n is fourfold + one**: every string change goes to `public/i18n/en.json`,
  `cs.json`, `sk.json`, `uk.json` **and** the bundled mirror
  `src/app/i18n/*.ts` (en/cs/sk/uk) in the same pass. Missing `en.ts` sync
  means empty strings on first paint.
- **Performance is a gate**, not a nice-to-have — "insanely slow" /
  "ridiculously slow" complaints came with measurements. If something takes
  seconds, fix the query/payload before closing.
- Company facts (for copy, contact, legal): **JVM YORE s.r.o.**, IČO 29633443 —
  verify against the public register, don't invent.
