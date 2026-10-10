# P1f - D1 Concurrency Verification

## Status: DEFERRED TO CI

## Why

Local `wrangler pages dev` cannot run in the current dev
environment (Termux + proot Ubuntu). workerd attempts to
reserve 1 GiB with 1 GiB alignment for its V8 isolate heap:

```
MmapAligned() failed - unable to allocate ...
  size=1073741824, alignment=1073741824
TCMalloc assumes a 48-bit virtual address space size
```

proot does not expose a real 48-bit VA space, so the
allocation fails and wrangler exits during startup.
This is an environment limitation, not a project bug.

## Where it is verified instead

`.github/workflows/d1-integration.yml` (workflow_dispatch)

That workflow:

1. Creates a temporary D1 database (`apex-test-<run_id>`)
2. Applies the curated migrations
3. Verifies schema: tables, triggers, spins columns
4. Tests the `_settlement_guard` mechanism against real D1
5. Tests the `trg_users_balance_nonnegative_*` triggers
6. Deletes the temporary database

## How to trigger

GitHub repo -> Actions -> 'D1 Integration Test (manual)' ->
Run workflow. Inputs: keep_db (default false).

Requires repo secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## What P1f was meant to verify

From the construction sheet:

- `changes()` inside a D1 batch reads the previous statement
- UPSERT + CHECK constraint triggers ABORT as expected
- CLI multi-statement script == Worker batch() semantics
- Zero-row UPDATE aborts the whole batch
- RETURNING carries values across statements

All of the above are covered by d1-integration.yml.

## Local workaround (not applied)

Running wrangler dev would require:

- A real container (Docker, not proot), or
- A Linux host with full VA space (WSL2, native Linux, GHA runner)

Neither is available in the current dev setup.

## Owner

Run before first production release and after any change to:

- `migrations/0027_settlement_guard.sql`
- `migrations/0032_sessions_limit_trigger.sql`
- `migrations/0033_users_balance_nonnegative_triggers.sql`
- `functions/api/game/spin.js` (transaction shape)
- `functions/api/game/sugar-rush-spin.js` (transaction shape)
