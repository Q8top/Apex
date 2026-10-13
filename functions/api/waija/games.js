// GET /api/waija/games[?currency=USD]
// Brand -> Waija proxy. Returns the game catalog for the lobby.
import { jsonResponse, optionsResponse } from '../../_response.js';
import { getGameList, isConfigured } from '../../_waija.js';

export async function onRequestOptions(context) {
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return optionsResponse(requestId);
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  try {
    const url = new URL(request.url);
    const currency = url.searchParams.get('currency') || env.WAIJA_DEFAULT_CURRENCY || 'USD';
    if (!isConfigured(env)) {
      return jsonResponse({
        success: false,
        code: 'waija_not_configured',
        message: 'WAIJA_API_LOGIN / WAIJA_API_PASSWORD not set.'
      }, 503, requestId);
    }
    const r = await getGameList(env, { currency: currency });
    if (!r.ok) {
      return jsonResponse({
        success: false,
        code: r.error || 'upstream_error',
        waijaError: r.waijaError || null,
        message: 'Waija catalog unavailable'
      }, 424, requestId);
    }
    const games = Array.isArray(r.data) ? r.data : [];
    return jsonResponse({
      success: true,
      currency: currency,
      count: games.length,
      games: games
    }, 200, requestId);
  } catch (e) {
    console.error('[waija/games] failed:', e && e.message);
    return jsonResponse({ success: false, code: 'internal_error' }, 500, requestId);
  }
}
