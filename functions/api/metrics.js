// Apex GET /api/metrics
// Aggregated operational metrics for external monitoring.
//
// Auth: header X-Metrics-Token must equal env.METRICS_TOKEN.
//   - METRICS_TOKEN unset -> 503 metrics_not_configured
//   - missing header      -> 401 unauthorized
//   - wrong token         -> 401 unauthorized (constant-time compare)
//
// Returns aggregated counts only (no user IDs, no spin IDs, no raw rows).
// All DB errors -> 503 (fail closed, never leak partial state).

import { jsonResponse, optionsResponse } from '../_response.js';

const HOUR_MS = 3600 * 1000;
const MAX_WINDOW_HOURS = 24 * 30; // cap at 30 days

function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function parseWindow(url) {
  const raw = url.searchParams.get('hours');
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 24;
  if (n > MAX_WINDOW_HOURS) return MAX_WINDOW_HOURS;
  return Math.floor(n);
}

export async function onRequestGet(context) {
  const { request, env, data } = context;
  const requestId = data && data.requestId ? data.requestId : '';

  // ---- auth ----
  const expected = env.METRICS_TOKEN;
  if (!expected || typeof expected !== 'string' || expected.length < 16) {
    return jsonResponse(
      { success: false, code: 'metrics_not_configured' },
      503,
      requestId
    );
  }
  const provided = request.headers.get('X-Metrics-Token') || '';
  if (!timingSafeEqual(provided, expected)) {
    return jsonResponse(
      { success: false, code: 'unauthorized' },
      401,
      requestId
    );
  }

  // ---- window ----
  const url = new URL(request.url);
  const hours = parseWindow(url);
  const now = Date.now();
  const since = new Date(now - hours * HOUR_MS).toISOString();
  const until = new Date(now).toISOString();

  try {
    // ---- totals over window ----
    const totals = await env.apex_db.prepare(
      'SELECT COUNT(*) AS spins, ' +
      'COALESCE(SUM(bet_minor), 0) AS wagered_minor, ' +
      'COALESCE(SUM(win_minor), 0) AS paid_minor, ' +
      'COALESCE(SUM(CASE WHEN is_free = 1 THEN 1 ELSE 0 END), 0) AS fs_spins, ' +
      'COALESCE(SUM(CASE WHEN is_free = 0 THEN 1 ELSE 0 END), 0) AS paid_spins, ' +
      'COUNT(DISTINCT user_id) AS unique_users ' +
      'FROM spins WHERE created_at >= ?'
    ).bind(since).first();

    // ---- per-mode breakdown ----
    const modes = await env.apex_db.prepare(
      'SELECT mode, COUNT(*) AS n, ' +
      'COALESCE(SUM(bet_minor), 0) AS wagered_minor, ' +
      'COALESCE(SUM(win_minor), 0) AS paid_minor ' +
      'FROM spins WHERE created_at >= ? GROUP BY mode'
    ).bind(since).all();

    // ---- math/game version distribution ----
    const versions = await env.apex_db.prepare(
      'SELECT math_version, game_version, COUNT(*) AS n ' +
      'FROM spins WHERE created_at >= ? ' +
      'GROUP BY math_version, game_version'
    ).bind(since).all();

    // ---- wallet/ledger reconciliation (all time, not window) ----
    // Count users where wallet_balance != SUM(ledger.delta)
    const recon = await env.apex_db.prepare(
      'SELECT COUNT(*) AS users_checked, ' +
      'COALESCE(SUM(CASE WHEN u.wallet_balance != COALESCE(l.s, 0) THEN 1 ELSE 0 END), 0) AS mismatch_count ' +
      'FROM users u ' +
      'LEFT JOIN (SELECT user_id, SUM(delta) AS s FROM wallet_ledger GROUP BY user_id) l ' +
      'ON l.user_id = u.id'
    ).first();

    // ---- active FS sessions ----
    const fs = await env.apex_db.prepare(
      "SELECT COUNT(*) AS active FROM free_spin_sessions " +
      "WHERE status = 'active' AND remaining_spins > 0 AND expires_at > ?"
    ).bind(until).first();

    // ---- idempotency conflict count (approx: fingerprints used by >1 spin_id) ----
    // Actually we count spins where request_fingerprint IS NOT NULL
    // Repeated hits of the same spin_id are served from cache and not stored twice.
    const fp = await env.apex_db.prepare(
      'SELECT COUNT(*) AS with_fp FROM spins WHERE created_at >= ? AND request_fingerprint IS NOT NULL'
    ).bind(since).first();

    const wagered = Number(totals.wagered_minor || 0);
    const paid = Number(totals.paid_minor || 0);

    const body = {
      success: true,
      window: { since, until, hours },
      totals: {
        spins: Number(totals.spins || 0),
        paid_spins: Number(totals.paid_spins || 0),
        fs_spins: Number(totals.fs_spins || 0),
        unique_users: Number(totals.unique_users || 0),
        wagered_minor: wagered,
        paid_minor: paid,
        rtp: wagered > 0 ? paid / wagered : 0,
      },
      modes: (modes.results || []).map(function (m) {
        return {
          mode: String(m.mode),
          spins: Number(m.n || 0),
          wagered_minor: Number(m.wagered_minor || 0),
          paid_minor: Number(m.paid_minor || 0),
        };
      }),
      versions: (versions.results || []).map(function (v) {
        return {
          math_version: String(v.math_version || ''),
          game_version: String(v.game_version || ''),
          spins: Number(v.n || 0),
        };
      }),
      reconciliation: {
        users_checked: Number(recon.users_checked || 0),
        mismatch_count: Number(recon.mismatch_count || 0),
      },
      fs: {
        active_sessions: Number(fs.active || 0),
      },
      idempotency: {
        spins_with_fingerprint: Number(fp.with_fp || 0),
      },
      generated_at: new Date().toISOString(),
    };

    return jsonResponse(body, 200, requestId);
  } catch (e) {
    console.error('[Metrics] failed:', e && e.message ? e.message : e);
    return jsonResponse(
      { success: false, code: 'metrics_unavailable' },
      503,
      requestId
    );
  }
}

export async function onRequestOptions(context) {
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return optionsResponse(requestId);
}
