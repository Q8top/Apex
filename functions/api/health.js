import { jsonResponse, optionsResponse } from '../_response.js';
export async function onRequestGet(context) {
  const { env, data } = context;
  const requestId = data && data.requestId ? data.requestId : '';

  const checks = {
    api: 'ok',
    db: 'unknown',
    time: new Date().toISOString(),
  };

  try {
    await env.apex_db.prepare('SELECT 1').first();
    checks.db = 'ok';
  } catch {
    checks.db = 'error';
  }

  const status = checks.db === 'ok' ? 200 : 503;
  return jsonResponse({ success: checks.db === 'ok', checks }, status, requestId);
}

export async function onRequestOptions(context) {
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return optionsResponse(requestId);
}
