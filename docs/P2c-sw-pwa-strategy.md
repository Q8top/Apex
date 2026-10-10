# P2c - Service Worker / PWA Strategy

Status: DECISION (no code change)
Date:   2026-10-10

## Current State

`sw.js` is a **suicide Service Worker**: on `activate` it
clears all caches, calls `self.registration.unregister()`,
and navigates all open clients to force a reload. It never
caches anything.

No HTML or JS registers a new Service Worker. The two
references to `navigator.serviceWorker` are:

- `src/js/inline/block-01.js` -- detects an existing SW and
  shows a refresh banner to the user
- `src/js/inline/event-bindings.js` -- the `sw-reset` action
  handler (clear caches + unregister + reload)

`manifest.json` is linked from `index.html` and
`sugar-rush.html`.

## Decision: Option A -- No Service Worker

We keep everything as-is. No files are deleted. Rationale:

1. **Legacy cleanup must stay available.** Some clients
   may still have the old caching SW installed. Deleting
   `sw.js` would leave them stuck on stale content forever,
   since the browser would 404 on the update check and keep
   the old SW. Keeping the suicide SW ensures eventual
   self-cleanup on every client that visits.

2. **PWA install works without a Service Worker.** The
   `manifest.json` enables `Add to Home Screen` on Android
   Chrome and iOS Safari. This works today. We do not need
   a SW for it.

3. **No offline support is intentional.** This is a live
   real-money / demo gaming site. Serving cached HTML or
   stale game JS during an active session is a correctness
   risk. Offline play is not a product goal.

4. **Caching is already handled by Cloudflare CDN.** Static
   assets use content-hashed URLs (see `scripts/hash-assets.mjs`)
   and `_headers` sets `immutable` cache for `/assets/*`.
   HTML pages use `Cache-Control: no-store`. A SW would
   duplicate (and conflict with) this strategy.

## What We Do NOT Do

- Do NOT register a new SW. Ever.
- Do NOT add SWR / precache / offline mode.
- Do NOT delete `sw.js` while legacy clients may exist.
- Do NOT remove `manifest.json`.

## How To Retire The Suicide SW Eventually

Once analytics show that <0.5% of sessions are still
hitting the legacy cache path, we can:

1. Replace `sw.js` with an empty file (or a 204 response)
2. Add a redirect from `/sw.js` to `/404.html` in `_redirects`
3. Remove the refresh banner from `block-01.js`

Until then, leave it alone. The cost is one extra fetch
per session on legacy clients only.

## Revisit If

- Product decides offline play is a feature (major rework)
- A regulatory requirement demands offline-first behavior
- We add a native app wrapper (Capacitor / Tauri)

