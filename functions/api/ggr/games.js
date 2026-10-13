// GET /api/ggr/games[?currency=USD]
// Brand -> GGR proxy. Returns the game catalog for the lobby.
// Falls back to mock data when GGR_API_KEY is a placeholder.
import { jsonResponse, optionsResponse } from '../../_response.js';
import { listGames } from '../../_ggr.js';

export async function onRequestOptions(context) {
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return optionsResponse(requestId);
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  try {
    const url = new URL(request.url);
    const currency = url.searchParams.get('currency') || env.GGR_DEFAULT_CURRENCY || 'USD';
    const r = await listGames(env, { currency: currency });
    if (!r.ok) {
      return jsonResponse({
        success: false,
        code: 'upstream_error',
        message: 'GGR catalog unavailable',
        upstreamStatus: r.status || 0,
        upstreamError: (r.data && r.data.error) || null
      }, 502, requestId);
    }
    return jsonResponse({
      success: true,
      mock: !!r.mock,
      currency: currency,
      games: (r.data && r.data.games) || []
    }, 200, requestId);
  } catch (e) {
    console.error('[ggr/games] failed:', e && e.message);
    return jsonResponse({ success: false, code: 'internal_error' }, 500, requestId);
  }
}
