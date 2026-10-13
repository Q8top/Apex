// Apex - GET /api/game/history?game=sweet&limit=50
// Returns last N spins for current user (real mode only)
import { jsonResponse, errorResponse, optionsResponse } from '../../_response.js';
import { getCurrentUser } from '../../_auth.js';
import { enforceKeyRateLimit } from '../../_rateLimit.js';

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 30;

function parseLimit(v) {
  var n = parseInt(v, 10);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT;
  if (n > MAX_LIMIT) return MAX_LIMIT;
  return n;
}

export async function onRequestOptions(context) {
  var requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return optionsResponse(requestId);
}

export async function onRequestGet(context) {
  var request = context.request;
  var env = context.env;
  var requestId = context.data && context.data.requestId ? context.data.requestId : '';

  var user = await getCurrentUser(env, request);
  if (!user || !user.userId) {
    return jsonResponse({ success: false, message: '\u672a\u767b\u5f55', code: 'unauthenticated' }, 401, requestId);
  }

  var rl = await enforceKeyRateLimit(env, 'game:history', 'u:' + user.userId, 60, 1);
  if (rl) return rl;

  var url = new URL(request.url);
  var game = url.searchParams.get('game') || 'sweet';
  if (game !== 'sweet' && game !== 'sugar-rush') {
    return errorResponse('invalid game', 400, 'game_invalid', requestId);
  }

  // B4-6-1: spins table has no game_id column yet (sweet + sugar-rush
  // currently share one table). Non-sweet history is not implemented.
  // Do NOT silently return sweet rows labelled as another game.
  // TODO(APEX-stage4-sr): real multi-game split requires
  //   (1) migration: ALTER TABLE spins ADD COLUMN game_id ...
  //   (2) INSERT in spin.js / sugar-rush-spin.js / buy-fs.js
  //   (3) history WHERE game_id = ?
  //   (4) backfill (only after verifying SR row discriminators)
  if (game !== 'sweet') {
    return jsonResponse({
      success: true,
      game: game,
      items: [],
      notSupported: true
    }, 200, requestId);
  }
  var limit = parseLimit(url.searchParams.get('limit'));

  try {
    var rows = await env.apex_db.prepare(
      "SELECT spin_id, bet_minor, win_minor, effective_bet_minor, is_free, " +
      " balance_before, balance_after, created_at " +
      "FROM spins WHERE user_id = ? ORDER BY id DESC LIMIT ?"
    ).bind(user.userId, limit).all();
    var list = (rows && rows.results) ? rows.results : [];
    return jsonResponse({
      success: true,
      game: game,
      limit: limit,
      items: list
    }, 200, requestId);
  } catch (e) {
    console.error('[history] failed:', e && e.message);
    return errorResponse('\u670d\u52a1\u5668\u5185\u90e8\u9519\u8bef', 500, 'internal_error', requestId);
  }
}
