---
name: Always sync en.ts with en.json
description: Reminder to keep src/app/i18n/en.ts in sync whenever en.json is updated
type: feedback
---

Whenever `public/i18n/en.json` is updated, `src/app/i18n/en.ts` **must** be updated in the same pass.

**Why:** `en.ts` is the bundled inline English translation used on initial load (eliminates an HTTP round-trip). It's a TypeScript mirror of `en.json`. Missing keys in `en.ts` mean English users see empty strings on first paint.

**How to apply:** After every change to `en.json`, apply the equivalent change to `en.ts` before closing the task. Don't wait to be reminded.
