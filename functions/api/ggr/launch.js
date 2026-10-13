// POST /api/ggr/launch
// Body: { game: 'provider:gameId', mode?: 'real'|'demo', level?: string }
// Returns: { success, url, mock } or an error.
//
// Player id sent to GGR: 'apex-u-{userId}' (no underscores, stable).
// Mock mode (no GGR_API_KEY) returns 503 with a clear message so the
// frontend can show 'coming soon' instead of a broken iframe.
import { jsonResponse, errorResponse, optionsResponse } from '../../_response.js';
import { getCurrentUser } from '../../_auth.js';
import { enforceKeyRateLimit } from '../../_rateLimit.js';
import { launchGame, isConfigured } from '../../_ggr.js';

const GAME_ID_RE = /^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/;
const MODES = ['real', 'demo'];
const LEVELS = ['proxy', 'basic', 'advanced', 'premium', 'vip'];

export async function onRequestOptions(context) {
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return optionsResponse(requestId);
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  try {
    const user = await getCurrentUser(env, request);
    if (!user || !user.userId) {
      return jsonResponse({ success: false, code: 'unauthenticated' }, 401, requestId);
    }
    if (user.status && user.status !== 'active') {
      return jsonResponse({ success: false, code: 'user_inactive' }, 403, requestId);
    }
    const rl = await enforceKeyRateLimit(env, 'ggr:launch', 'u:' + user.userId, 30, 60);
    if (rl) return rl;

    let body;
    try { body = await request.json(); } catch (e) {
      return errorResponse('invalid json', 400, 'invalid_json', requestId);
    }
    const game = body && typeof body.game === 'string' ? body.game : '';
    if (!GAME_ID_RE.test(game)) {
      return errorResponse('game must be provider:gameId', 400, 'invalid_game', requestId);
    }
    const mode = body && MODES.indexOf(body.mode) !== -1 ? body.mode : 'demo';
    const level = body && LEVELS.indexOf(body.level) !== -1 ? body.level : null;

    if (!isConfigured(env)) {
      return jsonResponse({
        success: false,
        code: 'ggr_not_configured',
        mock: true,
        message: 'GGR Labs API key is not configured yet. Set GGR_API_KEY to enable launches.'
      }, 503, requestId);
    }

    const playerId = 'apex-u-' + user.userId;
    const r = await launchGame(env, {
      game: game,
      player: playerId,
      mode: mode,
      level: level,
    });
    if (!r.ok) {
      const upstreamCode = r.data && r.data.code ? r.data.code : 'upstream_error';
      const http = (r.status === 400 || r.status === 401 || r.status === 402 || r.status === 403)
        ? r.status : 502;
      return jsonResponse({
        success: false,
        code: upstreamCode,
        message: (r.data && r.data.error) || 'GGR launch failed',
        upstreamStatus: r.status || 0
      }, http, requestId);
    }
    const url = r.data && r.data.url;
    if (!url || typeof url !== 'string') {
      return jsonResponse({ success: false, code: 'invalid_response' }, 502, requestId);
    }
    return jsonResponse({ success: true, url: url, mock: false, mode: mode }, 200, requestId);
  } catch (e) {
    console.error('[ggr/launch] failed:', e && e.message);
    return jsonResponse({ success: false, code: 'internal_error' }, 500, requestId);
  }
}
