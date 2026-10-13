import { jsonResponse } from '../../_response.js';
export async function onRequestGet(context) {
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return jsonResponse({ ok: true, level: 10, code_returned: 424 }, 424, requestId);
}
