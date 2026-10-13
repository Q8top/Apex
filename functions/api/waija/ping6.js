// ping6: import jsonResponse and call it.
import { jsonResponse } from '../../_response.js';
export async function onRequestGet(context) {
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  return jsonResponse({ ok: true, level: 6 }, 200, requestId);
}
