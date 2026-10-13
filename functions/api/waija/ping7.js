// ping7: exactly like games.js but no fetch to Waija; tests module combo.
import { jsonResponse } from '../../_response.js';
import { isConfigured } from '../../_waija.js';
export async function onRequestGet(context) {
  const { env } = context;
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  try {
    if (!isConfigured(env)) {
      return jsonResponse({ ok: false, level: 7, reason: 'not_configured' }, 503, requestId);
    }
    return jsonResponse({ ok: true, level: 7 }, 200, requestId);
  } catch (e) {
    return jsonResponse({ ok: false, level: 7,
      err: String(e && e.message || e) }, 200, requestId);
  }
}
