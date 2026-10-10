# P2e - i18n Language Coverage

Status: DEFERRED (fallback chain operational)
Date:   2026-10-10

## Current Coverage

The i18n registry declares 11 languages:

| code | name | registry | full sr.* keys |
|---|---|---|---|
| zh-CN | Chinese (Simp) | yes | YES (34 keys) |
| en-US | English | yes | YES (34 keys) |
| ja | Japanese | yes | partial (generic) |
| ko | Korean | yes | partial (generic) |
| th | Thai | yes | none |
| vi | Vietnamese | yes | none |
| id | Indonesian | yes | none |
| ms | Malay | yes | none |
| ar | Arabic (RTL) | yes | partial (generic) |
| es | Spanish | yes | partial (generic) |
| pt-BR | Portuguese (BR) | yes | partial (generic) |

## Fallback Chain (Already Implemented)

`src/js/platform/i18n.js` `t(key)` resolves in order:

1. `lang` (the active locale)
2. `META[lang].fallback` (e.g. ja -> en-US)
3. `DEFAULT` (zh-CN)
4. `en-US`
5. key name itself (last resort)

Result: a Japanese user sees the Japanese label for
`sr.title` if defined, otherwise the English one. No blank
labels, no key leaked to UI.

## Why We Do Not Translate Now

1. Quality. 28-34 Sugar Rush strings per language, times 8
   languages = ~250 strings. Machine translation produces
   acceptable UI labels for zh<->en but degrades badly for
   ja/ko/ar. A player notices.

2. Cost. Human translators need context (what is a
   `Tumble`? a `Scatter`? a `Multiplier Bomb`?). That
   context is in the rules sheet, which itself is not
   fully translated. Translating labels without the rules
   produces inconsistent terminology.

3. Priority. The product launches in zh-CN markets first.
   The English UI covers non-Chinese early adopters. Every
   other locale is a v2 concern.

## What We Do Instead

- Keep the registry (11 languages, switchable in UI)
- Keep the fallback chain (no blank labels)
- Ship v1 with zh-CN + en-US as the two "real" locales
- Add real translations only when we have a translator or
  a localized landing page to justify it

## Translation Workflow (When Ready)

For each new language `XX`:

1. Create `i18n/XX.json` (or extend `src/js/platform/i18n.js`)
2. Port keys in this order: navigation, buttons, stat labels,
   toasts, rules sheet body
3. Register in `LANG_REGISTRY` with `fallback: 'en-US'`
4. Add RTL flag (`dir: 'rtl'`) if the language is RTL
5. Test on a device with the OS set to that language

## Currency Formatting

`ApexI18n.formatMinor(minor, opts)` already uses
`Intl.NumberFormat` with the active locale. JPY and KRW
will render with their natural unit conventions when the
locale is switched. No changes needed.

## Revisit If

- We run a marketing campaign targeting a specific region
- A regulatory requirement mandates a local language
- A community volunteer offers a reviewed translation

