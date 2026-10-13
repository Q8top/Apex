// POST /api/waija/demo-launch
// Body: { gameid: 'waija-pragmaticslots/gates-of-olympus', lang?: 'zh'|'en' }
// Returns: { success: true, url } or an error.
//
// Demo mode: no player account, no wallet, no callbacks.
// Uses Waija getGameDemo, which returns a public demo URL.
import { jsonResponse, errorResponse, optionsResponse } from '../../_response.js';
import { enforceIpRateLimit } from '../../_rateLimit.js';
import { getGameDemo, isConfigured } from '../../_waija.js';

const GAMEID_RE = /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/;
const LANGS = ['zh', 'en'];

export async function onRequestOptions(context) {
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return optionsResponse(requestId);
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  try {
    // Demo mode is public: no login required.
    // Rate limit by IP to prevent abuse.
    const rl = await enforceIpRateLimit(env, request, 'waija:demo', 30, 60);
    if (rl) return rl;

    let body;
    try { body = await request.json(); } catch (e) {
      return errorResponse('invalid json', 400, 'invalid_json', requestId);
    }
    const gameid = body && typeof body.gameid === 'string' ? body.gameid : '';
    if (!GAMEID_RE.test(gameid)) {
      return errorResponse('gameid must be provider/slug', 400, 'invalid_gameid', requestId);
    }
    const lang = body && LANGS.indexOf(body.lang) !== -1 ? body.lang : 'en';

    if (!isConfigured(env)) {
      return jsonResponse({ success: false, code: 'waija_not_configured' }, 503, requestId);
    }

    const base = String(env.PUBLIC_BASE_URL || 'https://apextop.cc.cd').replace(/\/+$/, '');
    const r = await getGameDemo(env, {
      gameid: gameid,
      lang: lang,
      homeurl: base + '/',
      cashierurl: base + '/',
    });
    if (!r.ok) {
      return jsonResponse({
        success: false,
        code: r.error || 'upstream_error',
        waijaError: r.waijaError || null,
        message: r.message || 'Waija demo launch failed'
      }, 424, requestId);
    }
    const url = typeof r.data === 'string' ? r.data : null;
    if (!url) {
      return jsonResponse({ success: false, code: 'invalid_response' }, 502, requestId);
    }
    return jsonResponse({ success: true, url: url, gameid: gameid }, 200, requestId);
  } catch (e) {
    console.error('[waija/demo-launch] failed:', e && e.message);
    return jsonResponse({ success: false, code: 'internal_error' }, 500, requestId);
  }
}
