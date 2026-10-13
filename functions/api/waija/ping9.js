import { jsonResponse } from '../../_response.js';
export async function onRequestGet(context) {
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return jsonResponse({ ok: true, level: 9, code_returned: 502 }, 502, requestId);
}
