# P2b - CSP style-src-attr Analysis

Status: ASSESSED, PARTIAL SKIP
Date:   2026-10-10

## Goal (from construction sheet)

Remove `'unsafe-inline'` from `style-src-attr` in `_headers`.

## What We Found

Inline `style="..."` attributes across HTML:

- `index.html`: 30 occurrences
- `sweet-demo.html`: 2 occurrences

JS files using `.style.xxx`, `.cssText`, or
`setAttribute('style', ...)`: 17 files (150+ sites).

**Important**: `.style.xxx = ...` (CSSOM) is NOT
constrained by `style-src-attr` in any CSP spec. Only HTML
attributes are. So the JS usage does not matter for P2b.

## The Blocker

`sweet-demo.html:37`:

```html
<text style="paint-order:stroke;stroke:rgba(120,53,15,.4);stroke-width:2">
```

`paint-order` is defined in SVG 2 as a CSS property, but SVG
1.1 (which is what browsers implement for standalone inline
SVG in HTML) only accepts it as a presentation attribute --
i.e. inline. External CSS rule for `<text>` cannot set
`paint-order` reliably across browsers.

Therefore `style-src-attr 'unsafe-inline'` MUST stay, or the
Sugar Rush symbol rendering loses the white outline effect.

## Risk Analysis

Keeping `style-src-attr 'unsafe-inline'`:

- Attack vector: attacker injects `style="background:url()"`
- Blocked by: `img-src 'self' data:` (no external URLs)
- Blocked by: `connect-src 'self' https://cloudflareinsights.com`
- Blocked by: `script-src-attr 'none'` (no JS via attributes)
- Blocked by: `default-src 'self'` (no external resource load)

Net: the residual attack surface from inline style is CSS-based
data exfiltration, which is itself blocked by the img-src and
connect-src directives. The marginal value of removing
`unsafe-inline` is close to zero.

## Decision

DO NOT rewrite index.html or sweet-demo.html.
KEEP `style-src-attr 'unsafe-inline'` in `_headers`.

Add an explanatory comment to `_headers` so future readers
know why.

## Revisit If

- The SVG `<text paint-order>` usage is removed or replaced
- A stricter XSS model requires `style-src-attr 'none'`
  (e.g. a regulatory audit demands it)
- A hash-based CSP (`'unsafe-hashes'` + per-attribute hash)
  becomes feasible -- at which point we whitelist just the
  specific `paint-order` value rather than the whole class

