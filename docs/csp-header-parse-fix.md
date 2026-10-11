# CSP Header Parse Fix

Status: FIXED
Date:   2026-10-10

## Symptom

All Remix Icon glyphs rendered as empty squares (tofu).
Affected: home tab bar, category sidebar, header buttons.

## Root Cause

P2b added a note inside the Content-Security-Policy line
using CSS-style syntax:

```
...; style-src-attr 'unsafe-inline'; /* P2b: kept for SVG ... */ font-src 'self' ...;
```

HTTP headers do NOT support `/* */` comments. Cloudflare
Pages passed the value through verbatim. Browsers parsed
the CSP only up to the `/` character, then discarded the
remaining directives. `font-src`, `img-src`, `connect-src`
and everything after the comment were silently dropped.

Effective policy seen by the browser:

```
default-src 'self';
script-src 'self' https://static.cloudflareinsights.com;
script-src-attr 'none';
style-src 'self' https://cdn.jsdelivr.net;
style-src-attr 'unsafe-inline';
/* <-- parse stops here, everything after is ignored */
```

Result: font requests to `cdn.jsdelivr.net` were blocked by
the fallback `default-src 'self'` -- icons could not load.

## Fix

1. Remove the inline comment from the CSP value.
2. Move the note to the top of `_headers` using `#` syntax
   (Cloudflare Pages `_headers` treats `#` as a comment).

## Why We Did Not Notice

Local wrangler dev failed in this environment (see
docs/P1f-d1-concurrency.md). The CSP header change was
never exercised locally. CI runs headless and does not
evaluate the header against a real browser.

## Regression Guard (TODO)

Add a test that parses `_headers` and asserts:

- No `/*` or `*/` appears inside any header value
- All required CSP directives are present in the value
- `font-src` includes `https://cdn.jsdelivr.net`

Until then: never embed comments inside HTTP header values.

